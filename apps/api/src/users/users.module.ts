import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
<<<<<<< HEAD

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [TypeOrmModule],
=======
import { UsersController } from './user.controller';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, TransformUserService],
  exports: [TypeOrmModule, UsersService],
>>>>>>> 7591658 (transform userBack to userFront)
})
export class UsersModule {}
