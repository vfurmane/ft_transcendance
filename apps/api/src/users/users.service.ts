import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'types';
import { AddUserDto } from './add-user.dto';
import { User as UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async getByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({
      email,
    });
  }

  async addUser(user: AddUserDto): Promise<User> {
    const userEntity = new UserEntity();
    userEntity.email = user.email;
    userEntity.name = user.name;
    userEntity.password = null;
    return this.usersRepository.save(userEntity);
  }
}
