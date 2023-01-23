import { Conversation } from "./entities/conversation.entity";

export interface FtUser {
  login: string;
  email: string;
}

export interface AccessTokenResponse {
  access_token: string;
}

export interface TfaNeededResponse {
  message: string;
  route: string;
}

export interface JwtPayload {
  sub: string;
  name: string;
}

export interface JwtPayload {
  sub: string;
  name: string;
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

export * from './enums';
export * from './entities';
