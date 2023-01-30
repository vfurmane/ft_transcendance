import {
  Controller,
  Delete,
  Get,
  UseGuards,
  Put,
  Param,
  Patch,
} from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendshipRequestStatus, User } from 'types';
import { User as CurrentUser } from '../common/decorators/user.decorator';
import { isUUIDDto } from '../conversations/dtos/IsUUID.dto';

//let userTest = new User();
//userTest.id = "2d0f1e9e-f273-42b6-b897-1eecf18b85b2";

@UseGuards(JwtAuthGuard)
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly fiendshipsService: FriendshipsService) {}

  @Put('/:id')
  add(
    @CurrentUser() currentUser: User,
    @Param() { id }: isUUIDDto,
  ): Promise<boolean> {
    return this.fiendshipsService.add(currentUser, id);
  }

  @Get()
  getFriendsList(
    @CurrentUser() currentUser: User
  ): Promise<FriendshipRequestStatus[]> {
    return this.fiendshipsService.getFriendsList(currentUser);
  }

  @Delete('/:id')
  async delete(
    @CurrentUser() currentUser: User,
    @Param() { id }: isUUIDDto,
  ): Promise<boolean> {
    return this.fiendshipsService.delete(currentUser, id);
  }

  @Patch('/validate/:id')
  async validate(
    @CurrentUser() currentUser: User,
    @Param() { id }: isUUIDDto,
  ): Promise<boolean> {
    return this.fiendshipsService.update(currentUser, id);
  }
}
