import { Conversation } from "./entities/conversation.entity";
import { GameMode } from "./enums";
import { Vector } from "./class/vector.class";
import { Point } from "./class/point.class";
import { User } from "./entities";

export interface FtUser {
  login: string;
  email: string;
  image: { link: string };
}

export interface AccessTokenResponse {
  access_token: string;
  refresh_token: string;
  username?: string;
}

export interface TfaNeededResponse {
  message: string;
  route: string;
}

export interface JwtPayload {
  sub: string;
  name: string;
  jti: string;
}

export interface unreadMessagesResponse {
  totalNumberOfUnreadMessages: number;
  UnreadMessage: unreadMessages[];
}

export interface unreadMessages {
  conversationId: string;
  name: string;
  numberOfUnreadMessages: number;
}

export interface ConversationsDetails {
  totalNumberOfUnreadMessages: number;
  conversations: ConversationWithUnread[];
}

export interface ConversationWithUnread {
  conversation: Conversation;
  numberOfUnreadMessages: number;
  lastMessage: Date;
}

export interface Ball {
  point: Point;
  dir: Vector;
}

export interface PlayerInterface {
  point: Point;
  dir: Vector;
  hp: number;
}

export interface GameState {
  numberPlayer: number;
  players: PlayerInterface[];
  ball: Ball;
}

export interface Userfront {
  id: string;
  name: string;
  status: string;
  victory: number;
  defeat: number;
  rank: number;
  level: number;
  tfaSetup: boolean;
  gameId?: string;
  isOauth: boolean;
  avatarHash?: string;
}

export interface FriendshipRequestStatus {
  friend: Userfront | null;
  accept: boolean;
  ask: boolean;
}

export interface MatchFront {
  id: string;
  score_winner: number;
  score_looser: number;
  looser: Userfront | null;
  winner: Userfront | null;
}

export interface Achivement {
  name: string;
  status: string;
  description: string;
}

export interface DMExists {
  conversationExists: boolean;
  conversation: Conversation | null;
}

export interface Matchmaking {
  isInQueue: boolean;
  gameMode: GameMode;
}

export interface GameStartPayload {
  id: string;
  users: Userfront[];
}

export interface GameEntityFront {
  id: string;
  opponents: { user: Userfront }[];
}

export interface UserStatusUpdatePayload {
  type: string;
  userId: string;
}

export * from "./enums";
export * from "./entities";
export * from "./class";
