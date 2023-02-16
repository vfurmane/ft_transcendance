import { forwardRef, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersGateway } from './users.gateway';
import { User, Jwt } from 'types';
import { UsersService } from './users.service';
import { UserController } from './user.controller';
import { UsersController } from './users.controller';
import { TransformUserModule } from '../TransformUser/TransformUser.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Jwt, User]),
    forwardRef(() => AuthModule),
    forwardRef(() => TransformUserModule),
  ],
  providers: [UsersService, Logger, UsersGateway],
  controllers: [UsersController, UserController],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
