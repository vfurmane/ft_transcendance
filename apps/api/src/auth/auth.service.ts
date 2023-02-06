import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { AccessTokenResponse, FtUser, JwtPayload } from 'types';
import * as speakeasy from 'speakeasy';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'types';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { State } from 'types';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from '../users/register-user.dto';
import { Jwt } from 'types';
import { TokenTypeEnum } from 'types';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(State)
    private readonly statesRepository: Repository<State>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Jwt)
    private readonly jwtsRepository: Repository<Jwt>,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,

    @Inject(forwardRef(() => UsersService))
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

  async validateJwt(user: User, payload: JwtPayload): Promise<User | null> {
    //Check if jwt exist in db (in case of revocation)
    const jwt = await this.jwtsRepository.findOneBy({
      id: payload.jti,
      token_type: TokenTypeEnum.ACCESS_TOKEN,
    });
    if (!jwt) return null;

    return user;
  }

  async validateRefreshJwt(payload: JwtPayload): Promise<User | null> {
    const jwt = await this.jwtsRepository.findOneBy({
      id: payload.jti,
      token_type: TokenTypeEnum.REFRESH_TOKEN,
    });
    if (!jwt) return null;

    if (jwt.consumed) {
      this.revokeAllToken(jwt.user);
      return null;
    } else {
      jwt.consumed = true;
      await this.jwtsRepository.save(jwt);
    }

    return jwt.user;
  }

  async createJwtEntity(
    user: User,
    token_type: TokenTypeEnum = TokenTypeEnum.ACCESS_TOKEN,
    originToken: Jwt | null = null,
  ): Promise<Jwt> {
    const jwtEntity = new Jwt();
    jwtEntity.user = user;
    jwtEntity.token_type = token_type;
    jwtEntity.originToken = originToken;
    await this.jwtsRepository.save(jwtEntity).then((jwt) => {
      jwtEntity.id = jwt.id;
    });
    return jwtEntity;
  }

  async revokeAllToken(user: User): Promise<void> {
    await this.jwtsRepository.delete({ user: { id: user.id } });
  }

  async createTokensPair(user: User): Promise<string[]> {
    const accessTokenEntity = await this.createJwtEntity(user);
    const refreshTokenEntity = await this.createJwtEntity(
      user,
      TokenTypeEnum.REFRESH_TOKEN,
      accessTokenEntity,
    );

    return Promise.all([
      this.jwtService.sign(
        {
          sub: user.id,
          name: user.name,
          jti: accessTokenEntity.id,
        },
        {
          expiresIn: '5m',
        },
      ),
      this.jwtService.sign(
        {
          sub: user.id,
          name: user.name,
          jti: refreshTokenEntity.id,
        },
        {
          expiresIn: '5d',
        },
      ),
    ]);
  }

  async login(user: User, state?: State): Promise<AccessTokenResponse> {
    const [accessToken, refreshToken] = await this.createTokensPair(user);
    if (state) {
      this.removeState(state);
    }
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async getRequestState(stateToken: string, user: User): Promise<State> {
    if (!stateToken)
      throw new BadRequestException('State parameter is needed.');

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
    this.statesRepository.delete({ token: state.token });
    return;
  }
}
