import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';
import { Repository } from 'typeorm';
import { Match, User, MatchFront } from 'types';
import { UsersService } from '../users/users.service';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UsersService,
    private readonly transformUserService: TransformUserService,
  ) {}

  #getXp(
    winner: User,
    looser: User,
    score_winner: number,
    score_looser: number,
  ): number {
    if (winner && looser && score_looser && score_winner) return 5;
    //calcul xp selon niveau et score
    return 5;
  }

  async addMatch(
    winner_id: string,
    looser_id: string,
    score_winner: number,
    score_looser: number,
  ): Promise<void> {
    const winner = await this.userRepository.findOneBy({ id: winner_id });
    if (!winner) throw new BadRequestException('winner not find');

    const looser = await this.userRepository.findOneBy({ id: looser_id });
    if (!looser) throw new BadRequestException('looser not find');

    const newMatch = new Match();
    newMatch.winner_id = winner;
    newMatch.looser_id = looser;
    newMatch.score_winner = score_winner;
    newMatch.score_looser = score_looser;
    await this.matchRepository.save(newMatch);

    this.userService.updateLevel(
      winner_id,
      this.#getXp(winner, looser, score_winner, score_looser),
    );
  }

  async getMatch(Id: string): Promise<MatchFront[]> {
    const user = await this.userRepository.findOne({
      relations: {
        win: { looser_id: true },

        defeat: { winner_id: true },
      },
      where: {
        id: Id,
      },
    });

    if (!user) throw new BadRequestException('user not found');

    const winArray = user.win.map(async (el) => {
      return {
        id: el.id,
        score_winner: el.score_winner,
        score_looser: el.score_looser,
        looser: await this.transformUserService.transform(el.looser_id),
        winner: null,
      };
    });

    const looseArray = user.defeat.map(async (el) => {
      return {
        id: el.id,
        score_winner: el.score_winner,
        score_looser: el.score_looser,
        winner: await this.transformUserService.transform(el.winner_id),
        looser: null,
      };
    });

    return Promise.all([...winArray, ...looseArray]);
  }
}
