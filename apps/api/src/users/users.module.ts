import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersGateway } from './users.gateway';
import { User } from 'types';
import { UsersService } from './users.service';
import { UsersController } from './user.controller';
import { TransformUserModule } from '../TransformUser/TransformUser.module';

import { UsersController } from './user.controller';
import { TransformUserModule } from '../TransformUser/TransformUser.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule), forwardRef(() => TransformUserModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
