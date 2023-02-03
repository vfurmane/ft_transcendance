import { Controller, Get } from '@nestjs/common';
import { Userfront } from 'types';
import { LeaderBoardService } from './leaderBoard.service';

@Controller('leaderBoard')
export class LeaderBoardController {
  constructor(private readonly leaderBoardService: LeaderBoardService) {}

  @Get()
  getLeaderBoard(): Promise<Userfront[]> {
    return this.leaderBoardService.getLeaderBoard();
  }
}
