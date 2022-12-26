import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FtOauth2Strategy } from './ft-oauth2.strategy';
import { State } from './state.entity';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    PassportModule,
    TypeOrmModule.forFeature([State]),
  ],
  providers: [AuthService, FtOauth2Strategy, Logger],
  controllers: [AuthController],
})
export class AuthModule {}
