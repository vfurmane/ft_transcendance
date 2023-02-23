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
import { dataSourceOptions } from 'db/data-source';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...dataSourceOptions,
        autoLoadEntities: true,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options!).initialize();
        await dataSource.runMigrations();
        return dataSource;
      },

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
