import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AccessTokenResponse, FtUser, User } from 'types';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { AddUserDto } from 'src/users/add-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
    private readonly userService: UsersService,
  ) {}

  async fetchProfileWithToken(accessToken: string): Promise<FtUser> {
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

  async createUser(
    username: string,
    email: string,
    pass: string,
  ): Promise<any> {
    const user = new AddUserDto();
    const salt = await bcrypt.genSalt();
    user.name = username;
    user.password = await bcrypt.hash(pass, salt);
    user.email = email;
    this.userService.addUser(user);
    const { password, ...resut } = user;
    return resut;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.getByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password || ''))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User): Promise<AccessTokenResponse> {
    const payload = {
      sub: user.id,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
