import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { FtUser, User } from 'types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private httpService: HttpService,
    private jwtService: JwtService,
    private logger: Logger,
  ) {}

  async fetchProfileWithToken(accessToken: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get<FtUser>('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            if (error.response?.data) this.logger.error(error.response?.data);
            throw "An error occured while fetching the user's profile using its access token.";
          }),
        ),
    );
    return data;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
