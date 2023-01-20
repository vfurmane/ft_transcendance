import { Injectable } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as speakeasy from 'speakeasy';
import { SpeakeasyGeneratedSecretDto } from 'src/auth/speakeasy-generated-secret.dto';
import { RegisterUserDto } from './register-user.dto';
import { TransformUserService, Userfront } from 'src/TransformUser/TransformUser.service';

export interface AddUserData {
  name: string;
  email: string;
  password: string | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly transformUserService : TransformUserService,
  ) {}

  async getById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({
      id,
    });
  }

  async getByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({
      name: username,
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
    if (user.password) userEntity.password = user.password;
    return this.usersRepository.save(userEntity);
  }

  async createTfa(user: User): Promise<SpeakeasyGeneratedSecretDto> {
    const tfaSecret = speakeasy.generateSecret({ name: 'ft_transcendence' });
    user.tfa_secret = tfaSecret.base32;
    user.tfa_setup = false;
    this.usersRepository.save(user);
    tfaSecret.otpauth_url = speakeasy.otpauthURL({
      secret: tfaSecret.ascii,
      label: user.email,
      issuer: 'ft_transcendence',
    });
    return tfaSecret;
  }

  async validateTfa(userId: string): Promise<UpdateResult> {
    return this.usersRepository.update({ id: userId }, { tfa_setup: true });
  }

  async removeTfa(userId: string): Promise<UpdateResult> {
    return this.usersRepository.update({ id: userId }, { tfa_setup: false });
  }

  async getUser(user_id : string) : Promise<Userfront | null>{
    const user = await this.getById(user_id);
    return await this.transformUserService.transform(user);
  }

  async updateLevel(user_id: string, xp: number) : Promise<number> {
    const user = await this.usersRepository.findOneBy({id: user_id});
    const level = user?.level;
    const queryBuilder = this.usersRepository.createQueryBuilder().select('*');
    queryBuilder.update().set({level: (level? level : 0) + xp}).where("id =  :id", {id: user_id}).execute();
    return ((level? level : 0) + xp);
  }
}
