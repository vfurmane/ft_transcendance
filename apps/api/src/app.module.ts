import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SearchModule } from './search/search.module';
import { FriendshipsModule  } from './friendships/friendships.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: 5432,
        username: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        autoLoadEntities: true,
        // TODO check NODE_ENV
        //
        // From NestJS docs:
        // Setting `synchronize: true` shouldn't be used in production - otherwise you can lose production data.
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    SearchModule,
    FriendshipsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
