export interface State {
  id: string;
  created_at: Date;
  updated_at: Date;
  token: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface FtUser {
  login: string;
  email: string;
}

export interface AccessTokenResponse {
  access_token: string;
}
