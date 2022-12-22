import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FtOauth2Strategy } from './ft-oauth2.strategy';

@Module({
  imports: [ConfigModule, HttpModule, PassportModule],
  providers: [AuthService, FtOauth2Strategy, Logger],
  controllers: [AuthController],
})
export class AuthModule {}
