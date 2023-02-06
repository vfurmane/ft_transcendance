import { User, Userfront } from 'types';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository, MoreThan } from 'typeorm';

@Injectable()
export class TransformUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async #getVictoryNumber(user_id: string): Promise<number> {
    const user = await this.userRepository.findOne({
      relations: {
        win: true,
      },
      where: {
        id: user_id,
      },
    });
    if (!user) throw new BadRequestException('user not found');
    return user.win.length;
  }

  async #getDefeatNumber(user_id: string): Promise<number> {
    const user = await this.userRepository.findOne({
      relations: {
        defeat: true,
      },
      where: {
        id: user_id,
      },
    });
    if (!user) throw new BadRequestException('user not found');

    return user.defeat.length;
  }

  async #getRank(user_id: string): Promise<number> {
    const user = await this.userRepository.findOneBy({ id: user_id });
    if (!user) throw new BadRequestException('users not found');
    return (
      (await this.userRepository.count({
        where: { level: MoreThan(user.level) },
      })) + 1
    );
  }

  async transform(userBack: User | null): Promise<Userfront> {
    if (!userBack)
      return {
        id: '',
        name: '',
        avatar_num: 1,
        status: '',
        victory: 0,
        defeat: 0,
        rank: 0,
        level: 0,
      };
    return {
      id: userBack.id,
      name: userBack.name,
      avatar_num: Math.floor(Math.random() * 19) + 1,
      status: Math.floor(Math.random() * 1) + 1 ? 'online' : 'offline',
      victory: await this.#getVictoryNumber(userBack.id),
      defeat: await this.#getDefeatNumber(userBack.id),
      rank: await this.#getRank(userBack.id),
      level: userBack.level,
    };
  }
}
