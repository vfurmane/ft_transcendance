import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'types';
import { UsersService } from '../users/users.service';
import { JwtPayload } from 'types';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Jwt } from 'types';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    protected readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    @InjectRepository(Jwt)
    private readonly jwtsRepository: Repository<Jwt>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
      ignoreExpiration: false, //Has to be changed for prod
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  private static extractJWT(req: Request) : string | null
  {
    if (req.cookies && 'access_token' in req.cookies && req.cookies.access_token.length > 0)
      return req.cookies.access_token
    return null
  }

  async validate(payload: JwtPayload): Promise<User | null> {
    const user = await this.usersService.getById(payload.sub);
    if (user === null) return null;
    user.currentJwt = payload;

    return await this.authService.validateJwt(user, payload);
  }
}
