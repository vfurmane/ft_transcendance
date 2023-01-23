<<<<<<< HEAD
import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { MatchService } from "./Match.service";
import { MatcFront, MatchService } from "./Match.service";
import { User } from "types";
=======
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MatcFront, MatchService } from './Match.service';
>>>>>>> d219be5 (match, gamedata and leaderboard fix)


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
  getMatch(@Query() query: { user_id: string }): Promise<MatcFront[]> {
    return this.matchService.getMatch(query.user_id);
  }
}