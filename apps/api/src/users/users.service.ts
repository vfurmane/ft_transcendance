import { Injectable } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as speakeasy from 'speakeasy';
import { SpeakeasyGeneratedSecretDto } from 'src/auth/speakeasy-generated-secret.dto';

export interface AddUserData {
  name: string;
  email: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async addUser(user: AddUserData): Promise<User> {
    const userEntity = new User();
    userEntity.email = user.email;
    userEntity.name = user.name;
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
