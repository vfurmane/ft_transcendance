import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { AccessTokenResponse, FtUser, User } from 'types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
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
    const payload = {
      sub: user.id,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
