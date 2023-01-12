import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { AccessTokenResponse, FtUser, JwtPayload } from 'types';
import * as speakeasy from 'speakeasy';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { State } from './state.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from 'src/users/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(State)
    private readonly statesRepository: Repository<State>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
    private readonly usersService: UsersService,
  ) {}

  async fetchProfileWithToken(accessToken: string): Promise<FtUser> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<FtUser>(
          `${this.configService.get<string>('ft.api.routes.users.me')}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            if (error.response?.data) this.logger.error(error.response?.data);
            return throwError(
              () =>
                "An error occured while fetching the user's profile using its access token.",
            );
          }),
        ),
    );
    return data;
  }

  async createUser(user: RegisterUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    return this.usersService.addUser(user);
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersService.getByUsername(username);
    if (
      user &&
      user?.password !== null &&
      (await bcrypt.compare(pass, user.password))
    ) {
      return user;
    }
    return null;
  }

  login(user: User, state?: State): AccessTokenResponse {
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
    };
    if (state) {
      this.statesRepository.delete({ token: state.token });
    }
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getRequestState(stateToken: string, user: User): Promise<State> {
    if (!stateToken) throw 'State parameter is needed.';

    let state = await this.statesRepository.findOneBy({
      token: stateToken,
    });
    if (state === null) {
      state = new State();
      state.token = stateToken;
      if (user)
        state.user = await this.usersRepository.findOneBy({
          id: user.id,
        });
      await this.statesRepository.save(state);
    }
    return state;
  }

  async checkTfa(user: User, token: string): Promise<boolean> {
    if (user.tfa_secret === null)
      throw new BadRequestException('TFA not setup yet');

    // Check the token
    const tokenValidates = speakeasy.totp.verify({
      secret: user.tfa_secret,
      encoding: 'base32',
      token: token,
      window: 1,
    });
    if (!tokenValidates) throw new BadRequestException('OTP token is invalid');

    // Finish token setup (if not already)
    if (!user.tfa_setup) {
      this.usersService.validateTfa(user.id);
    }
    return true;
  }

  async removeState(state: State): Promise<void> {
    state;
    return;
  }
}
