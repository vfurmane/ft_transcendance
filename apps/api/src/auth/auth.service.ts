import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { AccessTokenResponse, FtUser, JwtPayload } from 'types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from 'src/users/register-user.dto';
import { Repository } from 'typeorm';
import { State } from 'types';
import { User } from 'types';
import { UsersService } from '../users/users.service';

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

  verifyUserFromToken(access_token: string): JwtPayload | null {
    let user: JwtPayload;
    try {
      user = this.jwtService.verify<JwtPayload>(access_token);
    } catch (error) {
      return null;
    }
    return user;
  }

  async createUser(user: RegisterUserDto): Promise<User> {
    if (await this.usersService.userExists({ ...user, name: user.username }))
      throw new BadRequestException('`username` or `email` is already in use');
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    return this.usersService.addUser({ ...user, name: user.username });
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
    }
    if (user && (!state.user || user.id !== state.user.id))
      state.user = await this.usersRepository.findOneBy({
        id: user.id,
      });
    await this.statesRepository.save(state);
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
