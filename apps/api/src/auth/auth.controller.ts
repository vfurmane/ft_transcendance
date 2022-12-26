import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenResponse, SessionRequest } from 'types';
import { AuthService } from './auth.service';
import { FtOauth2AuthGuard } from './ft-oauth2-auth.guard';
import { StateGuard } from './state.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    readonly logger: Logger,
  ) {}

  @Get('/oauth2/42')
  @UseGuards(StateGuard)
  @UseGuards(FtOauth2AuthGuard)
  ftCallback(@Req() req: SessionRequest): Promise<AccessTokenResponse> {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    this.logger.log(`${req.user.name} logged in using OAuth2`);
    return this.authService.login(req.user);
  }
}
