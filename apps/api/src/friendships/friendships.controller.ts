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

@UseGuards(JwtAuthGuard)
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Put('/:id')
  add(
    @CurrentUser() currentUser: User,
    @Param() { id }: isUUIDDto,
  ): Promise<boolean> {
    return this.friendshipsService.add(currentUser, id);
  }

  @Get()
  getFriendsList(
    @CurrentUser() currentUser: User,
  ): Promise<FriendshipRequestStatus[]> {
    return this.friendshipsService.getFriendsList(currentUser);
  }

  @Delete('/:id')
  async delete(
    @CurrentUser() currentUser: User,
    @Param() { id }: isUUIDDto,
  ): Promise<boolean> {
    return this.friendshipsService.delete(currentUser, id);
  }

  @Patch('/validate/:id')
  async validate(
    @CurrentUser() currentUser: User,
    @Param() { id }: isUUIDDto,
  ): Promise<boolean> {
    return this.friendshipsService.update(currentUser, id);
  }
}
