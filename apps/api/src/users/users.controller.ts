import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Param,
  Header,
  BadRequestException,
  Put,
  Delete,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { User as UserEntity } from 'types';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    readonly logger: Logger,
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('profile')
  async getProfile(@User() user: UserEntity): Promise<UserEntity> {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'image/jpeg')
  @Get(':id/profile-picture')
  async getUserProfilePicture(
    @Param('id') id: string,
  ): Promise<StreamableFile> {
    return this.usersService.getProfilePicture(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/update-profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile_pictures/',
        filename: (req, file, cb) => {
          const filename: string =
            path.parse(file.originalname).name.replace(/\s/g, '') +
            randomUUID();
          const extension: string = path.parse(file.originalname).ext;
          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  async updateProfilePicture(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg',
        })
        .addMaxSizeValidator({
          maxSize: 100000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ): Promise<void> {
    if (!file) throw new BadRequestException('No file provided');
    return this.usersService.updateProfilePicture(id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id/delete-profile-picture')
  async deleteProfilePicture(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteProfilePicture(id);
  }
}
