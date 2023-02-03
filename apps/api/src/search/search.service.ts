import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity, Userfront } from 'types';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly transformUserService: TransformUserService,
  ) {}

  async findAll(letters: string): Promise<Userfront[]> {
    const array = (
      await this.usersRepository
        ?.createQueryBuilder()
        .where('LOWER(name) LIKE :letters', {
          letters: `%${letters}%`,
        })
        .orderBy('name', 'ASC')
        .getMany()
    ).sort((user1, user2) => {
      const user1sub = user1.name.toLowerCase().slice(0, letters.length);
      const user2sub = user2.name.toLowerCase().slice(0, letters.length);
      if (user1sub === letters && user2sub !== letters) return -1;
      if (user1sub !== letters && user2sub === letters) return 1;
      if (user1.name.toLowerCase() < user2.name.toLowerCase()) return -1;
      return 1;
    });

    const res = array.map(
      async (el) => await this.transformUserService.transform(el),
    );
    return Promise.all(res);
  }
}
