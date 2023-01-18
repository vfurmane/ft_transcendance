import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from './user.entity';
import { UsersGateway } from './users.gateway';
import { UsersService } from './users.service';
<<<<<<< HEAD

@Module({
<<<<<<< HEAD
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
=======
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  providers: [UsersService, UsersGateway],
>>>>>>> 606a5d1 (Functional sockets for conversations)
  exports: [TypeOrmModule, UsersService],
>>>>>>> 7591658 (transform userBack to userFront)
})
export class UsersModule {}
