import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class FtOauth2Strategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    protected configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      authorizationURL: `${configService.get('ft.api.oauth.authorizationURL')}`,
      tokenURL: `${configService.get('ft.api.oauth.tokenURL')}`,
      clientID: `${configService.get('FT_OAUTH2_CLIENT_ID')}`,
      clientSecret: `${configService.get('FT_OAUTH2_CLIENT_SECRET')}`,
      callbackURL: `${configService.get('FRONTEND_BASE_URL')}/auth/oauth2/42`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: User,
    cb: VerifyCallback,
  ): Promise<void> {
    const ftUser = await this.authService.fetchProfileWithToken(accessToken);
    let user = await this.usersService.getByEmail(ftUser.email);
    if (user === null) {
      user = await this.usersService.addUser({
        email: ftUser.email,
        name: ftUser.login,
        password: null,
      });
    }
    profile = user;
    return cb(null, profile);
  }
}
