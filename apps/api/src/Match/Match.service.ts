import { Injectable } from "@nestjs/common";

@Injectable()
export class MatchService{
    constructor(

    ){}

    async addMatch( winner_id : string, looser_id: string, score_winner: number, score_looser: number, date: Date) : Promise<Number> {
        return 1;
    }

    async getMatch (user_id: string) : Promise<number>{
        return 1;
    }

}