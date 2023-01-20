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
import { User } from 'types';
import { User as CurrentUser } from '../common/decorators/user.decorator';
import { isUUIDDto } from '../conversations/dtos/IsUUID.dto';

@UseGuards(JwtAuthGuard)
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly fiendshipsService: FriendshipsService) {}

  @Put('/:id')
  add(
    @CurrentUser() currentUser: User,
    @Param() { id }: isUUIDDto,
  ): Promise<number> {
    return this.fiendshipsService.add(currentUser, id);
  }

  @Get()
  getFriendsList(
    @CurrentUser() currentUser: User,
  ): Promise<{ friend: User | null; accept: boolean; ask: boolean }[]> {
    return this.fiendshipsService.getFriendsList(currentUser);
  }

  @Delete('/:id')
  async delete(
    @CurrentUser() currentUser: User,
    @Param() { id }: isUUIDDto,
  ): Promise<number> {
    return this.fiendshipsService.delete(currentUser, id);
  }

  @Patch('/validate/:id')
  async validate(
    @CurrentUser() currentUser: User,
    @Param() { id }: isUUIDDto,
  ): Promise<number> {
    return this.fiendshipsService.update(currentUser, id);
  }
}
