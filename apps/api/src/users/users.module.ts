import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'types';
import { UsersService } from './users.service';
import { UsersController } from './user.controller';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, TransformUserService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
