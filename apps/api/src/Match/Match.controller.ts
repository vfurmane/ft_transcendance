import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { MatchService } from "./Match.service";
<<<<<<< HEAD
import { User } from "types";
=======
>>>>>>> 6a17e2e (game data first commit)

@Controller('match')
export class MatchController{
    constructor(
        private readonly matchService : MatchService
    ){}

    @Post()
<<<<<<< HEAD
    addMatch(@Body() body : {winner_id : string, looser_id: string, score_winner: number, score_looser: number}) : Promise<Number>{
        return this.matchService.addMatch(body.winner_id, body.looser_id, body.score_winner, body.score_looser);
    }

    @Get()
    getMatch(@Query() query : {user_id: string}) : Promise<User> {
=======
    addMatch(@Body() body : {winner_id : string, looser_id: string, score_winner: number, score_looser: number, date: Date}) : Promise<Number>{
        return this.matchService.addMatch(body.winner_id, body.looser_id, body.score_winner, body.score_looser, body.date);
    }

    @Get()
    getMatch(@Query() query : {user_id: string}) : Promise<number> {
>>>>>>> 6a17e2e (game data first commit)
        return this.matchService.getMatch(query.user_id);
    }
}