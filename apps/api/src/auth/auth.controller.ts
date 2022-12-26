import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionRequest } from 'types';
import { FtOauth2AuthGuard } from './ft-oauth2-auth.guard';
import { StateGuard } from './state.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly logger: Logger) {}

  @Get('/oauth2/42')
  @UseGuards(StateGuard)
  @UseGuards(FtOauth2AuthGuard)
  ftCallback(@Req() req: SessionRequest) {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    this.logger.log(`${req.user.name} logged in using OAuth2`);
    return req.user;
  }
}
