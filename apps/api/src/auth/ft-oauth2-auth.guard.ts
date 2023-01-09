import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/user.entity';

@Injectable()
export class FtOauth2AuthGuard extends AuthGuard('oauth2') {
  handleRequest<TUser = User>(err: Error, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException(err.message || 'Authentication failed');
    }
    return user;
  }
}
