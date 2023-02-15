import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchController } from './Match.controller';
import { MatchService } from './Match.service';
import { Match } from 'types';
import { UsersModule } from '../users/users.module';
import { TransformUserModule } from '../TransformUser/TransformUser.module';
import { AchivementsModule } from 'src/Achivements/Achivements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    UsersModule,
    TransformUserModule,
    AchivementsModule,
  ],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [TypeOrmModule, MatchService],
})
export class MatchModule {}
