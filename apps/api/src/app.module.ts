import { CacheModule, Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SearchModule } from './search/search.module';
import { FriendshipsModule } from './friendships/friendships.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MatchModule } from './Match/Match.module';
import { LeaderBoardModule } from './leaderBoard/leaderBoard.module';
import { TransformUserModule } from './TransformUser/TransformUser.module';
import { PongModule } from './pong/pong.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AchievementsModule } from './Achievements/Achievements.module';
import { AppGateway } from './app.gateway';
import { AchievementsModule } from './Achievements/Achievements.module';

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
        // From NestJS docs:
        // Setting `synchronize: true` shouldn't be used in production - otherwise you can lose production data.
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    SearchModule,
    FriendshipsModule,
    ConversationsModule,
    MatchModule,
    LeaderBoardModule,
    TransformUserModule,
    PongModule,
    AchievementsModule,
    CacheModule.register(),
    AchievementsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway, Logger],
})
export class AppModule {}
