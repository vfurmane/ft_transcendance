import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiMovedPermanentlyResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponse, SessionRequest, User } from 'types';
import { AuthService } from './auth.service';
import { FtOauth2AuthGuard } from './ft-oauth2-auth.guard';
import { FtOauth2Dto } from './ft-oauth2.dto';
import { StateGuard } from './state.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AddUserDto } from 'src/users/add-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    readonly logger: Logger,
  ) {}

  @Get('/oauth2/42')
  @UseGuards(StateGuard)
  @UseGuards(FtOauth2AuthGuard)
  @ApiOperation({
    summary:
      'Authenticate the user against the 42 Authorization Server (managed by Passport).',
  })
  @ApiQuery({ type: FtOauth2Dto })
  @ApiMovedPermanentlyResponse({
    description:
      'The user needs to authorize the request (should not happen in front to back communication).',
  })
  @ApiUnauthorizedResponse({
    description:
      'The authentication failed (`code` or `state` may be invalid).',
  })
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

  @Post('register')
  async register(@Body() req: any): Promise<User> {
    const user = await this.authService.createUser(
      req.name,
      req.email,
      req.password,
    );
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: SessionRequest): Promise<User> {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    return req.user;
  }
}
