import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FtOauth2AuthGuard extends AuthGuard('oauth2') {}
