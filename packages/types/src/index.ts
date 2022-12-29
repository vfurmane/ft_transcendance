export interface FtUser {
  login: string;
  email: string;
}

export interface AccessTokenResponse {
  access_token: string;
}

export interface TfaNeededResponse {
  message: string;
}

export interface JwtPayload {
  sub: string;
  name: string;
}
