export interface User {
  name: string;
}

export interface FtUser {
  login: string;
}

export type SessionRequest = Request & { user?: User }
