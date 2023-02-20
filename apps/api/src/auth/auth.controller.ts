import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Patch,
  Post,
  Res,
  UnauthorizedException,
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
import { AccessTokenResponse, TfaNeededResponse } from 'types';
import { UsersService } from '../users/users.service';
import { AccessTokenResponseDto } from './access-token-response.dto';
import { AuthService } from './auth.service';
import { CheckTfaTokenStateDto } from './check-tfa-token-state.dto';
import { CheckTfaTokenDto } from './check-tfa-token.dto';
import { FtOauth2AuthGuard } from './ft-oauth2-auth.guard';
import { FtOauth2Dto } from './ft-oauth2.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SpeakeasyGeneratedSecretDto } from './speakeasy-generated-secret.dto';
import { User as UserEntity } from 'types';
import { User } from '../common/decorators/user.decorator';
import { StateGetGuard } from './state-get.guard';
import { StatePostGuard } from './state-post.guard';
import { State } from '../common/decorators/state.decorator';
import { State as StateEntity } from 'types';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from '../users/register-user.dto';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { ChangePasswordDto } from './change-password.dto';
import { Response } from 'express';

@ApiTags()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    readonly logger: Logger,
  ) {}

  @Get('/login/oauth2/42')
  @UseGuards(FtOauth2AuthGuard, StateGetGuard)
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
  async ftCallback(
    @User() user: UserEntity,
    @State() state: StateEntity,
    @Res({ passthrough:true}) res : Response
  ): Promise<void | TfaNeededResponse> {
    if (user.tfa_setup) {
      this.logger.log(`${user.name} logged in using OAuth2, but TFA is needed`);
      return { message: 'Authentication factor needed', route: 'tfa' };
    }
    this.logger.log(`${user.name} logged in using OAuth2`);
    const token = await this.authService.login(user, state);
    res.cookie('access_token', token.access_token, {
      maxAge: (60 * 5),
      sameSite: 'strict',
      httpOnly: true
    });
    res.cookie('refresh_token', token.refresh_token, {
      maxAge: (60 * 60 * 24 * 7),
      sameSite: 'strict',
      httpOnly: true,
      path: '/api/auth/refresh'
    })
  }

  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<UserEntity> {
    const user = await this.authService.createUser(registerUserDto);
    return user;
  }

  @UseGuards(LocalAuthGuard, StatePostGuard)
  @Post('login')
  async login(
    @User() user: UserEntity,
    @State() state: StateEntity,
    @Res({passthrough : true}) res : Response
  ): Promise<void | TfaNeededResponse> {
    if (user.tfa_setup) {
      this.logger.log(
        `${user.name} logged in using username:password, but TFA is needed`,
      );
      return { message: 'Authentication factor needed', route: 'tfa' };
    }
    this.logger.log(`${user.name} logged in using username:password`);
    const token = await this.authService.login(user, state);
    res.cookie('access_token', token.access_token, {
      maxAge: (60 * 5),
      sameSite: 'strict',
      httpOnly: true
    });
    res.cookie('refresh_token', token.refresh_token, {
      maxAge: (60 * 60 * 24 * 7),
      sameSite: 'strict',
      httpOnly: true,
      path: '/api/auth/refresh'
    })
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
    if (user.tfa_setup)
      throw new BadRequestException(
        'TFA is already configured on your account',
      );
    return this.usersService.createTfa(user);
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
  async removeTfa(@User() user: UserEntity): Promise<void> {
    if (!user.tfa_setup)
      throw new BadRequestException('TFA is not configured on your account');
    this.usersService.removeTfa(user.id);
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
    @User() user: UserEntity,
    @Body() body: CheckTfaTokenDto,
  ): Promise<void> {
    await this.authService.checkTfa(user, body.token);
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
    @State() state: StateEntity,
    @Body() body: CheckTfaTokenStateDto,
    @Res({ passthrough : true}) res: Response
  ): Promise<void> {
    if (!state.user)
      throw new UnauthorizedException('Missing first factor authentication.');
    await this.authService.checkTfa(state.user, body.token);
    this.logger.log(`${state.user.name} validated TFA`);
    const token = await this.authService.login(state.user, state);
    res.cookie('access_token', token.access_token, {
      maxAge: (5 * 60),
      sameSite: 'strict',
      httpOnly: true
    });
    res.cookie('refresh_token', token.refresh_token, {
      maxAge: (60 * 60 * 24 * 7),
      sameSite: 'strict',
      httpOnly: true,
      path: '/api/auth/refresh'
    })
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(@User() user: UserEntity, @Res({ passthrough : true}) res: Response) : Promise<void> {
    const token = await this.authService.login(user);
    res.cookie('access_token', token.access_token, {
      expires: new Date(new Date().getTime() + (30 * 1000 * 60)),
      sameSite: 'strict',
      httpOnly: true
    });
    res.cookie('refresh_token', token.refresh_token, {
      expires: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 7)),
      sameSite: 'strict',
      httpOnly: true,
      path: '/api/auth/refresh'
    })
  }

  @Patch('change_password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User() user: UserEntity,
  ): Promise<{ message: string }> {
    if (
      changePasswordDto.new_password !== changePasswordDto.confirm_new_password
    )
      throw new BadRequestException('Both new passwords must match');
    if (
      user.password !== null &&
      (await this.authService.validateUser(
        user.name,
        changePasswordDto.old_password,
      )) === null
    )
      throw new UnauthorizedException('Old password is incorrect');

    await this.authService.changePassword(
      user.id,
      changePasswordDto.new_password,
    );
    await this.authService.revokeAllToken(user);
    return { message: 'Successfully changed password' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@User() user: UserEntity): Promise<{ message: string }> {
    await this.authService.logout(user.currentJwt.jti);
    return { message: 'Successfully logged out' };
  }
}
