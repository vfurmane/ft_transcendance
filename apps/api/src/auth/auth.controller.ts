import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiMovedPermanentlyResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponse, SessionRequest, User } from 'types';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CheckTfaTokenDto } from './check-tfa-token.dto';
import { FtOauth2AuthGuard } from './ft-oauth2-auth.guard';
import { FtOauth2Dto } from './ft-oauth2.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SpeakeasyGeneratedSecretDto } from './speakeasy-generated-secret.dto';
import { StateGuard } from './state.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/register-user.dto';

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
  ftCallback(@Req() req: SessionRequest): AccessTokenResponse {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    this.logger.log(`${req.user.name} logged in using OAuth2`);
    return this.authService.login(req.user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    const user = await this.authService.createUser(registerUserDto);
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: SessionRequest): Promise<AccessTokenResponse> {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('profile')
  async getProfile(@Request() req: SessionRequest): Promise<User> {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    return req.user;
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
    @Req() req: SessionRequest,
  ): Promise<SpeakeasyGeneratedSecretDto> {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    return this.usersService.createTfa(req.user);
  }

  @Post('tfa/check')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check a OTP token.' })
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'The token is valid.' })
  @ApiUnauthorizedResponse({
    description: 'Authorization header is likely missing or invalid.',
  })
  @ApiBadRequestResponse({
    description: 'The OTP is invalid or TFA is not setup yet.',
  })
  checkTfa(@Req() req: SessionRequest, @Body() body: CheckTfaTokenDto): void {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    this.authService.checkTfa(req.user, body.token);
  }
}
