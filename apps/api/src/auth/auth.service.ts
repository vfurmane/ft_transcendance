import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { AccessTokenResponse, FtUser, JwtPayload } from 'types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import * as speakeasy from 'speakeasy';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
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

  login(user: User): AccessTokenResponse {
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  checkTfa(user: User, token: string): boolean {
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
}
