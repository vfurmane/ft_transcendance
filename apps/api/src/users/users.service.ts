import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { In, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'types';
import * as speakeasy from 'speakeasy';
import { SpeakeasyGeneratedSecretDto } from '../auth/speakeasy-generated-secret.dto';
import { AccessTokenResponse } from 'types';
import * as bcrypt from 'bcrypt';
import { ChangeUserPasswordDto } from './change-user-password.dto';
import { Jwt as JwtEntity } from 'types/src/entities';
import { AuthService } from '../auth/auth.service';

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
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(JwtEntity)
    private readonly jwtsRepository: Repository<JwtEntity>,
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

  async userExists(user: AddUserData): Promise<boolean> {
    return (
      (await this.usersRepository.findOneBy([
        { name: user.name },
        { email: user.email },
      ])) !== null
    );
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

  async changeUserPassword(
    user: User,
    changeUserPasswordDto: ChangeUserPasswordDto,
  ): Promise<AccessTokenResponse> {
    const salt = await bcrypt.genSalt();
    changeUserPasswordDto.password = await bcrypt.hash(
      changeUserPasswordDto.password,
      salt,
    );

    await this.jwtsRepository
      .find({
        relations: ['user'],
        loadRelationIds: true,
        where: { user: In([user.id]) },
      })
      .then((jwts) => {
        this.jwtsRepository.remove(jwts);
      });

    await this.usersRepository.update(
      { id: user.id },
      { password: changeUserPasswordDto.password },
    );
    return this.authService.login(user);
  }
}
