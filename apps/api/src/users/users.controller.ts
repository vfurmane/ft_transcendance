import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  UseGuards,
  UseInterceptors,
  Post,
  UploadedFile,
  StreamableFile,
  Param,
  Header,
  BadRequestException,
  Put,
  Delete,
  HttpStatus,
  ParseFilePipeBuilder,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { AccessTokenResponse, User as UserEntity } from 'types';
import { UpdateUserPasswordDto } from './update-user-password.dto';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

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
  @Post('update-password')
  async updateUserPassword(
    @User() user: UserEntity,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<AccessTokenResponse> {
    return this.usersService.updateUserPassword(user, updateUserPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'image/jpeg')
  @Get(':id/profile-picture')
  async getUserProfilePicture(
    @Param('id') id: string,
  ): Promise<StreamableFile> {
    const profile = await this.usersService.getProfile(id);
    if (profile?.picture == null) {
      throw new NotFoundException(
        `User: ${id} does not have a profile picture`,
      );
    }
    const file = fs.createReadStream(profile.picture);
    return new StreamableFile(file);
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
  @HttpCode(204)
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
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const profile = await this.usersService.getProfile(id);
    if (!profile) {
      throw new NotFoundException(`User: ${id} not found`);
    }
    this.usersService.updateProfilePicture(profile, file);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('/:id/delete-profile-picture')
  async deleteProfilePicture(@Param('id') id: string): Promise<void> {
    const profile = await this.usersService.getProfile(id);
    if (!profile) {
      throw new NotFoundException(`User: ${id} not found`);
    }
    this.usersService.deleteProfilePicture(profile);
  }
}
