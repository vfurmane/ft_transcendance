import { forwardRef, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Jwt } from 'src/auth/jwt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Jwt, User]),
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService, Logger],
  exports: [TypeOrmModule, UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
