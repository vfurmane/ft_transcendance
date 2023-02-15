import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Userfront } from 'types';
import * as speakeasy from 'speakeasy';
import { SpeakeasyGeneratedSecretDto } from '../auth/speakeasy-generated-secret.dto';
import { AccessTokenResponse } from 'types';
import * as bcrypt from 'bcrypt';
import { UpdateUserPasswordDto } from './update-user-password.dto';
import { Jwt as JwtEntity } from 'types';
import { AuthService } from '../auth/auth.service';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';

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
    private readonly transformUserService: TransformUserService,
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

  async getUserById(id: string): Promise<Userfront | null> {
    const user = await this.usersRepository.findOneBy({
      id,
    });
    return await this.transformUserService.transform(user);
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
      (await this.usersRepository
        .createQueryBuilder()
        .where('LOWER(name) = :name OR LOWER(email) = :email', {
          name: user.name.toLowerCase(),
          email: user.email.toLowerCase(),
        })
        .getOne()) !== null
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

  async getUser(currentUser: User): Promise<Userfront | null> {
    return await this.transformUserService.transform(currentUser);
  }

  async updateLevel(user_id: string, xp: number): Promise<number> {
    const user = await this.usersRepository.findOneBy({ id: user_id });
    const level = user?.level;
    if (!user) throw new NotFoundException('Unknown user');
    user.level = (user.level ? user.level : 0) + xp;
    this.usersRepository.save(user);
    return (level ? level : 0) + xp;
  }

  async updateUserPassword(
    user: User,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<AccessTokenResponse> {
    const salt = await bcrypt.genSalt();
    updateUserPasswordDto.password = await bcrypt.hash(
      updateUserPasswordDto.password,
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
      { password: updateUserPasswordDto.password },
    );
    return this.authService.login(user);
  }
}
