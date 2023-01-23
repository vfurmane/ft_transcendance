import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderBoardController } from './leaderBoard.service';
import { LeaderBoardService } from './leaderBoard.controller';
import { User } from 'types';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [LeaderBoardController],
  providers: [LeaderBoardService, TransformUserService],
  exports: [TypeOrmModule],
})
export class LeaderBoardModule {}
