import { Module } from '@nestjs/common';
import { LeaderBoardController } from './leaderBoard.controller';
import { LeaderBoardService } from './leaderBoard.service';
import { UsersModule } from '../users/users.module';
import { TransformUserModule } from '../TransformUser/TransformUser.module';

@Module({
  imports: [UsersModule, TransformUserModule],
  controllers: [LeaderBoardController],
  providers: [LeaderBoardService],
  exports: [LeaderBoardService],
})
export class LeaderBoardModule {}
