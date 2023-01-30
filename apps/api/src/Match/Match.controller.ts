import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MatchFront, MatchService } from './Match.service';


@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  addMatch(
    @Body()
    body: {
      winner_id: string;
      looser_id: string;
      score_winner: number;
      score_looser: number;
    },
  ): Promise<number> {
    return this.matchService.addMatch(
      body.winner_id,
      body.looser_id,
      body.score_winner,
      body.score_looser,
    );
  }

  @Get()
  getMatch(@Query() query: { user_id: string }): Promise<MatchFront[]> {
    return this.matchService.getMatch(query.user_id);
  }
}
