import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';
import { Repository } from 'typeorm';
import { User, Userfront } from 'types';

@Injectable()
export class LeaderBoardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly transformService: TransformUserService,
  ) {}

  async getLeaderBoard(): Promise<Userfront[]> {
    const users = await this.userRepository.find({ order: { level: 'DESC' } });
    if (!users) throw new BadRequestException('users not found');
    
    
    const res = users.map(async (el) => await this.transformService.transform(el));
    return Promise.all(res);
  }
}
