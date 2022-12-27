import { Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiMovedPermanentlyResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponse } from 'types';
import * as speakeasy from 'speakeasy';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { FtOauth2AuthGuard } from './ft-oauth2-auth.guard';
import { FtOauth2Dto } from './ft-oauth2.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SpeakeasyGeneratedSecretDto } from './speakeasy-generated-secret.dto';
import { StateGuard } from './state.guard';
import { User as UserEntity } from '../users/user.entity';
import { User } from '../common/decorators/user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    readonly logger: Logger,
  ) {}

  @Get('/login/oauth2/42')
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
  ftCallback(@User() user: UserEntity): AccessTokenResponse {
    this.logger.log(`${user.name} logged in using OAuth2`);
    return this.authService.login(user);
  }

  @Post('tfa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The TFA secret has been created.',
    type: SpeakeasyGeneratedSecretDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'The authentication failed (likely due to a missing Bearer token in the `Authorization` header)',
  })
  async createTfa(
    @User() user: UserEntity,
  ): Promise<SpeakeasyGeneratedSecretDto> {
    const tfaSecret = speakeasy.generateSecret();
    await this.usersService.createTfa(user, tfaSecret.base32);
    return tfaSecret;
  }
}
