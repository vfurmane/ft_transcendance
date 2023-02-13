import { User } from "./entities";
import { Conversation } from "./entities/conversation.entity";

export interface FtUser {
  login: string;
  email: string;
  image: { link: string };
}

export interface AccessTokenResponse {
  access_token: string;
  refresh_token: string;
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

export interface unreadMessagesResponse
{
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

export interface Userfront {
  id: string;
  name: string;
  avatar_num: number;
  status: string;
  victory: number;
  defeat: number;
  rank: number;
  level: number;
  tfaSetup: boolean;
}

export interface FriendshipRequestStatus {
  friend : Userfront | null,
  accept: boolean,
  ask: boolean
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

export * from './enums';
export * from './entities';
