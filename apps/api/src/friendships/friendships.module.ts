import { Module } from '@nestjs/common';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsService } from './friendships.service';
import { Friendships as FriendshipsEntity } from 'types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';

@Module({
  imports: [TypeOrmModule.forFeature([FriendshipsEntity]), UsersModule],
  controllers: [FriendshipsController],
  providers: [FriendshipsService, TransformUserService],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
