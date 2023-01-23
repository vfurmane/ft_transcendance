import { Module } from '@nestjs/common';
import { LeaderBoardController } from './leaderBoard.service';
import { LeaderBoardService } from './leaderBoard.controller';
import { UsersModule } from '../users/users.module';
import { TransformUserModule } from '../TransformUser/TransformUser.module';

@Module({
  imports: [UsersModule, TransformUserModule],
  controllers: [LeaderBoardController],
  providers: [LeaderBoardService],
  exports: [LeaderBoardService],
})
export class LeaderBoardModule {}
