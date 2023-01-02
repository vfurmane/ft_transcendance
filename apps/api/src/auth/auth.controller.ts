import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiMovedPermanentlyResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AccessTokenResponse,
  SessionRequest,
  TfaNeededResponse,
  User,
} from 'types';
import { UsersService } from '../users/users.service';
import { AccessTokenResponseDto } from './access-token-response.dto';
import { AuthService } from './auth.service';
import { CheckTfaTokenStateDto } from './check-tfa-token-state.dto';
import { CheckTfaTokenDto } from './check-tfa-token.dto';
import { FtOauth2AuthGuard } from './ft-oauth2-auth.guard';
import { FtOauth2Dto } from './ft-oauth2.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SpeakeasyGeneratedSecretDto } from './speakeasy-generated-secret.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/register-user.dto';
import { StateGetGuard } from './state-get.guard';
import { StatePostGuard } from './state-post.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    readonly logger: Logger,
  ) {}

  @Get('/login/oauth2/42')
  @UseGuards(StateGetGuard)
  @UseGuards(FtOauth2AuthGuard)
  @ApiOperation({
    summary:
      'Authenticate the user against the 42 Authorization Server (managed by Passport).',
  })
  @ApiQuery({ type: FtOauth2Dto })
  @ApiOkResponse({ type: AccessTokenResponseDto })
  @ApiMovedPermanentlyResponse({
    description:
      'The user needs to authorize the request (should not happen in front to back communication).',
  })
  @ApiUnauthorizedResponse({
    description:
      'The authentication failed (`code` or `state` may be invalid).',
  })
  ftCallback(
    @Req() req: SessionRequest,
  ): AccessTokenResponse | TfaNeededResponse {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    if (req.user.tfa_setup) {
      this.logger.log(
        `${req.user.name} logged in using OAuth2, but TFA is needed`,
      );
      return { message: 'TFA needed' };
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
    if (req.user.tfa_setup)
      throw new BadRequestException(
        'TFA is already configured on your account',
      );
    return this.usersService.createTfa(req.user);
  }

  @Delete('tfa')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove TFA setup.' })
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'The TFA setup has been removed.',
  })
  @ApiUnauthorizedResponse({
    description:
      'The authentication failed (likely due to a missing Bearer token in the `Authorization` header)',
  })
  async removeTfa(@Req() req: SessionRequest): Promise<void> {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    if (!req.user.tfa_setup)
      throw new BadRequestException('TFA is not configured on your account');
    this.usersService.removeTfa(req.user.id);
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
  async checkTfa(
    @Req() req: SessionRequest,
    @Body() body: CheckTfaTokenDto,
  ): Promise<void> {
    if (!req.user) {
      this.logger.error(
        'This is the impossible type error where the user is authenticated but the `req.user` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    await this.authService.checkTfa(req.user, body.token);
  }

  @Post('/login/tfa')
  @HttpCode(200)
  @UseGuards(StatePostGuard)
  @ApiOperation({ summary: 'Login using an OTP token (as TFA).' })
  @ApiBody({
    type: CheckTfaTokenStateDto,
  })
  @ApiOkResponse({
    description: 'The authentication succeeded.',
    type: AccessTokenResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Authorization header is missing or invalid, or the first factor authentication has not been done yet.',
  })
  @ApiBadRequestResponse({
    description: 'The OTP is invalid or TFA is not setup yet.',
  })
  async loginWithTfa(
    @Req() req: SessionRequest,
    @Body() body: CheckTfaTokenStateDto,
  ): Promise<AccessTokenResponse> {
    if (!req.state) {
      this.logger.error(
        'This is the impossible type error where the state is registered but the `req.state` is `undefined`',
      );
      throw new InternalServerErrorException('Unexpected error');
    }
    if (!req.state.user)
      throw new UnauthorizedException('Missing first factor authentication.');
    await this.authService.checkTfa(req.state.user, body.token);
    await this.authService.removeState(req.state);
    this.logger.log(`${req.state.user.name} validated TFA`);
    return this.authService.login(req.state.user);
  }
}
