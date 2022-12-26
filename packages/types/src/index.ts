export interface State {
  id: string;
  created_at: Date;
  updated_at: Date;
  token: string;
}

export interface User {
  id: string;
  name: string;
}

export interface FtUser {
  login: string;
}

export type SessionRequest = Request & { state: State, user?: User }
