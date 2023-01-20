<<<<<<< HEAD
import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TransformUserService, Userfront } from "src/TransformUser/TransformUser.service";
import { Repository } from "typeorm";
import { Match, User} from "types";
import { UsersService } from "../users/users.service";
=======
import { Injectable } from "@nestjs/common";
>>>>>>> 6a17e2e (game data first commit)

export interface MatcFront {
    id: string,
    score_winner: number,
    score_looser: number,
    looser: Userfront | null,
    winner: Userfront | null
}

@Injectable()
export class MatchService{
    constructor(
<<<<<<< HEAD
        @InjectRepository(Match)
        private readonly matchRepository : Repository<Match>,
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,
        private readonly userService : UsersService,
        private readonly transformUserService : TransformUserService,
    ){}

    #getXp(winner : User, looser: User, score_winner: number, score_looser: number) : number
    {
        //calcul xp selon niveau et score
        return 5;
    }

    async addMatch( winner_id : string, looser_id: string, score_winner: number, score_looser: number) : Promise<Number> {
        
        const winner =  await this.userRepository.findOneBy({id : winner_id});
        if (!winner)
            throw new BadRequestException('winner not find');

        const looser =  await this.userRepository.findOneBy({id : looser_id});
        if (!looser)
            throw new BadRequestException('looser not find');

        const newMatch = new Match();
        newMatch.winner_id = winner;
        newMatch.looser_id = looser;
        newMatch.score_winner = score_winner;
        newMatch.score_looser = score_looser;
        await this.matchRepository.save(newMatch);

        this.userService.updateLevel(winner_id, this.#getXp(winner, looser, score_winner, score_looser))
        return 1;
    }

    async getMatch (user_id: string) : Promise<MatcFront[]>{
        const user = await this.userRepository.findOne({relations: {
            win: {looser_id: true},
          
            defeat: { winner_id: true},
        },
        where:
        {
            id: user_id
        }
        });
        if (!user)
<<<<<<< HEAD
            throw new BadRequestException('');
        
        
        return user;
=======

    ){}

    async addMatch( winner_id : string, looser_id: string, score_winner: number, score_looser: number, date: Date) : Promise<Number> {
        return 1;
    }

    async getMatch (user_id: string) : Promise<number>{
        return 1;
>>>>>>> 6a17e2e (game data first commit)
=======
            throw new BadRequestException('user not found');

        let winArray : MatcFront[] = [];

        let looseArray : MatcFront[] = [];

        for(let i = 0; i < user.win.length; i++)
        {
            winArray.push(
                {
                    id: user.win[i].id,
                    score_winner: user.win[i].score_winner,
                    score_looser: user.win[i].score_looser,
                    looser: await this.transformUserService.transform(user.win[i].looser_id),
                    winner: null
                })
        }

        for(let i = 0; i < user.defeat.length; i++)
        {
            looseArray.push(
                {
                    id: user.defeat[i].id,
                    score_winner: user.defeat[i].score_winner,
                    score_looser: user.defeat[i].score_looser,
                    winner: await this.transformUserService.transform(user.defeat[i].winner_id),
                    looser: null
                })
        }

        return [...winArray, ...looseArray];
>>>>>>> 7591658 (transform userBack to userFront)
    }

}