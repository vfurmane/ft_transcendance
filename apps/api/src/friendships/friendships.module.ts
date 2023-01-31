import { Module } from '@nestjs/common';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsService } from './friendships.service';
import { Friendships as FriendshipsEntity } from 'types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { TransformUserModule } from 'src/TransformUser/TransformUser.module';

@Module({
  imports: [TypeOrmModule.forFeature([FriendshipsEntity]), UsersModule, TransformUserModule],
  controllers: [FriendshipsController],
  providers: [FriendshipsService],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
