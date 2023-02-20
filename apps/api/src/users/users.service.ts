import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Userfront, Upload, Profile } from 'types';
import * as speakeasy from 'speakeasy';
import { SpeakeasyGeneratedSecretDto } from '../auth/speakeasy-generated-secret.dto';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';
import * as fs from 'fs';
import path from 'path';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly transformUserService: TransformUserService,
    private readonly httpService: HttpService,
    private readonly logger: Logger,
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
    const userProfile = new Profile();
    await this.profileRepository.save(userProfile);
    const userEntity = new User();
    userEntity.email = user.email;
    userEntity.name = user.name;
    if (user.password) userEntity.password = user.password;
    userEntity.profile = userProfile;
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

  async getUserByUsername(username: string): Promise<Userfront | null> {
    const user = await this.getByUsername(username);
    if (user === null) throw new NotFoundException('`username` not found');
    return this.transformUserService.transform(user);
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return new Promise((resolve, reject) => {
      this.profileRepository
        .findOne({
          where: { user: { id: userId } },
          relations: ['user'],
        })
        .then((profile) => resolve(profile))
        .catch((error) => reject(error));
    });
  }

  async updateLevel(user_id: string, xp: number): Promise<number> {
    const user = await this.usersRepository.findOneBy({ id: user_id });
    const level = user?.level;
    if (!user) throw new NotFoundException('Unknown user');
    user.level = (user.level ? user.level : 0) + xp;
    this.usersRepository.save(user);
    return (level ? level : 0) + xp;
  }

  async updateName(user: User, new_username: string): Promise<UpdateResult> {
    const usernameTaken = await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(name) = :name', {
        name: new_username.toLowerCase(),
      })
      .getOne();
    if (usernameTaken)
      throw new BadRequestException('`username` is already in use');
    return this.usersRepository.update({ id: user.id }, { name: new_username });
  }

  async fetchAndStoreProfilePicture(
    user: User,
    profilePictureUrl: string,
  ): Promise<void> {
    const response = await firstValueFrom(
      this.httpService.get(profilePictureUrl, {
        responseType: 'stream',
      }),
    );
    const filepath = `./uploads/profile_pictures/${user.id}${
      path.parse(profilePictureUrl).ext
    }`;
    response.data.pipe(fs.createWriteStream(filepath));
    this.getProfile(user.id).then((profile) => {
      this.profileRepository.update({ id: profile?.id }, { picture: filepath });
    });
  }

  async updateProfilePicture(
    profile: Profile,
    file: Express.Multer.File,
  ): Promise<UpdateResult | null> {
    try {
      if (profile?.picture !== null && fs.existsSync(profile?.picture)) {
        fs.unlinkSync(profile.picture);
      }
      return this.profileRepository.update(
        { id: profile?.id },
        { picture: file.path },
      );
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async deleteProfilePicture(profile: Profile): Promise<UpdateResult | null> {
    try {
      if (profile?.picture != null) {
        fs.unlinkSync(profile.picture);
      }
      return this.profileRepository.update(
        { id: profile?.id },
        { picture: null },
      );
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
