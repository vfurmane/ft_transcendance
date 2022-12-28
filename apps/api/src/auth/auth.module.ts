import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FtOauth2Strategy } from './ft-oauth2.strategy';
import { State } from './state.entity';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '5m' },
      }),
    }),
    PassportModule,
    TypeOrmModule.forFeature([State]),
    UsersModule,
  ],
  providers: [
    AuthService,
    FtOauth2Strategy,
    LocalStrategy,
    Logger,
    UsersService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
