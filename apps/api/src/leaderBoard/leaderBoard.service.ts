import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { Userfront } from "src/TransformUser/TransformUser.service";
import { LeaderBoardService } from "./leaderBoard.controller";

@Controller('leaderBoard')
export class LeaderBoardController{
    constructor(
        private readonly leaderBoardService : LeaderBoardService
    ){}

    @Get()
    getLeaderBoard() : Promise<Userfront> {
        return this.leaderBoardService.getLeaderBoard();
    }
}