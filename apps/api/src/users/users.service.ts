import { Injectable } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as speakeasy from 'speakeasy';
import { User } from 'types';
import { AddUserDto } from './add-user.dto';
import { User as UserEntity } from './user.entity';
import { SpeakeasyGeneratedSecretDto } from 'src/auth/speakeasy-generated-secret.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async getById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({
      id,
    });
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({
      email,
    });
  }

  async addUser(user: AddUserDto): Promise<User> {
    const userEntity = new UserEntity();
    userEntity.email = user.email;
    userEntity.name = user.name;
    if (user.password) userEntity.password = user.password;
    return this.usersRepository.save(userEntity);
  }

  async createTfa(user: User): Promise<SpeakeasyGeneratedSecretDto> {
    const tfaSecret = speakeasy.generateSecret();
    user.tfa_secret = tfaSecret.base32;
    user.tfa_setup = false;
    this.usersRepository.save(user);
    return tfaSecret;
  }

  async validateTfa(userId: string): Promise<UpdateResult> {
    return this.usersRepository.update({ id: userId }, { tfa_setup: true });
  }
}
