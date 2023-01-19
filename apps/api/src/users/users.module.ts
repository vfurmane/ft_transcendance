import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from './user.entity';
import { UsersGateway } from './users.gateway';
import { UsersService } from './users.service';

import { UsersController } from './user.controller';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, TransformUserService, UsersGateway],
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
