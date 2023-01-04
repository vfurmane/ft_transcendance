import { forwardRef, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersGateway } from './users.gateway';
import { User } from 'types';
import { UsersService } from './users.service';
import { UsersController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, Logger, UsersGateway],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
