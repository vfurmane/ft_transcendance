import { forwardRef, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersGateway } from './users.gateway';
import { User } from 'types';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Jwt } from 'types';

@Module({
  imports: [
    TypeOrmModule.forFeature([Jwt, User]),
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService, Logger, UsersGateway],
  controllers: [UsersController],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
