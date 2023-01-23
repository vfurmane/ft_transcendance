import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { TransformUserService } from './TransformUser.service';
import { User } from 'types';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, TransformUserService],
  exports: [TypeOrmModule],
})
export class TransformUserModule {}
