import {
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { ConversationsService } from './conversations.service';
import { sendMessageDto } from './dtos/sendMessage.dto';
import { isUUIDDto } from './dtos/IsUUID.dto';
import { HttpExceptionTransformationFilter } from '../common/filters/HttpExceptionFilter.filter';
import { User } from '../users/user.entity';
import { createConversationDto } from './dtos/createConversation.dto';
import { updateRoleDto } from './dtos/updateRole.dto';
import { Conversation } from './entities/conversation.entity';
import { muteUserDto } from './dtos/muteUser.dto';
import { isDateDto } from './dtos/isDate.dto';
import { conversationRestrictionEnum } from './conversationRestriction.enum';
import { ConversationsDetails, unreadMessagesResponse } from 'types';
import { Message } from './entities/message.entity';
import { ConversationRole } from './entities/conversationRole.entity';
import { UsersService } from '../users/users.service';
import { instanceToPlain } from 'class-transformer';

@UseFilters(HttpExceptionTransformationFilter)
@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({
  namespace: 'conversations',
})
export class ConversationsGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket): Promise<string | void> {
    if (!client.handshake.headers?.authorization) {
      client.disconnect();
      return;
    }
    const currentUser = this.authService.verifyUserFromToken(
      client.handshake.headers.authorization,
    );
    if (!currentUser) {
      client.disconnect();
      return;
    }
    client.data = { id: currentUser.sub, name: currentUser.name };
    client.join(`user_${currentUser.sub}`);
    const conversations = await this.conversationsService.getConversationsIds(
      currentUser.sub,
    );
    conversations.forEach((el) => client.join(`conversation_${el}`));
    return 'Connection established';
  }

  // handleDisconnect(client : any) {
  // this.clients.get(client.data.id)?.delete(client.id)
  // if (this.clients.get(client.data.id)?.size === 0) this.clients.delete(client.data.id)
  // console.error("Removed socket", this.clients);
  // }

  @SubscribeMessage('getConversations')
  getConversations(
    @ConnectedSocket() client: Socket,
  ): Promise<ConversationsDetails> {
    return this.conversationsService.getConversations(client.data as User);
  }

  @SubscribeMessage('createConversation')
  async createConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() newConversation: createConversationDto,
  ): Promise<Conversation> {
    const { conversation, newConversationMessage } =
      await this.conversationsService.createConversation(
        newConversation,
        client.data as User,
      );
    if (newConversationMessage) {
      this.server
        .in(`user_${client.data.id}`)
        .socketsJoin(`conversation_${conversation.id}`);
      for (const participant of newConversation.participants) {
        this.server
          .in(`user_${participant}`)
          .socketsJoin(`conversation_${conversation.id}`);
      }
      client
        .to(`conversation_${conversation.id}`)
        .emit('newConversation', instanceToPlain(conversation));
    }
    return conversation;
  }

  @SubscribeMessage('getUnread')
  unreadCount(
    @ConnectedSocket() client: Socket,
  ): Promise<unreadMessagesResponse> {
    return this.conversationsService.unreadCount(client.data as User);
  }

  @SubscribeMessage('getMessages')
  getMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: isUUIDDto,
  ): Promise<Message[]> {
    return this.conversationsService.getMessages(client.data as User, id);
  }

  @SubscribeMessage('postMessage')
  async postMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { content }: sendMessageDto,
    @MessageBody() { id }: isUUIDDto,
  ): Promise<Message> {
    const ret = await this.conversationsService.postMessage(
      client.data as User,
      id,
      content,
    );
    if (ret)
      client
        .to(`conversation_${id}`)
        .emit('newMessage', { id, message: instanceToPlain(ret) });
    return ret;
  }

  @SubscribeMessage('joinConversation')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: isUUIDDto,
    @MessageBody('password') password: string | undefined,
  ): Promise<Conversation> {
    const { conversation, joinMessage } =
      await this.conversationsService.joinConversation(
        client.data as User,
        id,
        password ? password : null,
      );
    if (joinMessage) {
      this.server
        .in(`user_${client.data.id}`)
        .socketsJoin(`conversation_${conversation.id}`);
      client
        .to(`user_${client.data.id}`)
        .emit('newConversation', instanceToPlain(conversation));
      this.server
        .in(`conversation_${conversation.id}`)
        .except(`user_${client.data.id}`)
        .emit('userJoined', {
          id,
          user: instanceToPlain(
            await this.usersService.getById(client.data.id),
          ),
        });
      this.server
        .in(`conversation_${conversation.id}`)
        .except(`user_${client.data.id}`)
        .emit('newMessage', { id, message: instanceToPlain(joinMessage) });
    }
    return conversation;
  }

  @SubscribeMessage('getParticipants')
  getConversationPartipants(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: isUUIDDto,
  ): Promise<ConversationRole[]> {
    return this.conversationsService.getConversationParticipants(
      client.data as User,
      id,
    );
  }

  @SubscribeMessage('updateRole')
  async updateRole(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: isUUIDDto,
    @MessageBody() newRole: updateRoleDto,
  ): Promise<updateRoleDto> {
    const role = await this.conversationsService.updateRole(
      id,
      newRole,
      client.data as User,
    );
    if (role) {
      client.to(`conversation_${id}`).emit('newRole', instanceToPlain(newRole));
    }
    return newRole;
  }

  @SubscribeMessage('leaveConversation')
  async leaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: isUUIDDto,
  ): Promise<ConversationRole> {
    const { userRole, leftMessage } =
      await this.conversationsService.leaveConversation(
        client.data as User,
        id,
      );
    if (leftMessage) {
      this.server
        .in(`user_${client.data.id}`)
        .socketsLeave(`conversation_${id}`);
      client.to(`user_${client.data.id}`).emit('leaveConversation', id);
      this.server
        .in(`conversation_${id}`)
        .emit('userLeft', { id, user: instanceToPlain(userRole.user) });
      this.server
        .in(`conversation_${id}`)
        .emit('newMessage', { id, message: instanceToPlain(leftMessage) });
    }
    return userRole;
  }

  @SubscribeMessage('muteUser')
  async muteUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id, username }: muteUserDto,
    @MessageBody() { date }: isDateDto,
  ): Promise<string> {
    const restriction = await this.conversationsService.restrictUser(
      client.data as User,
      id,
      username,
      conversationRestrictionEnum.MUTE,
      new Date(date),
    );
    client
      .to(`conversation_${id}`)
      .emit('mutedUser', instanceToPlain(restriction));
    return restriction;
  }

  @SubscribeMessage('banUser')
  async banUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id, username }: muteUserDto,
    @MessageBody() { date }: isDateDto,
  ): Promise<string> {
    const restriction = this.conversationsService.restrictUser(
      client.data as User,
      id,
      username,
      conversationRestrictionEnum.BAN,
      new Date(date),
    );
    client
      .to(`conversation_${id}`)
      .emit('bannedUser', instanceToPlain(restriction));
    this.server.in(`user_${id}`).socketsLeave(`conversation_${id}`);
    return restriction;
  }

  @SubscribeMessage('banUserIndefinitely')
  async banUserIndefinitely(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id, username }: muteUserDto,
  ): Promise<string> {
    const restriction = this.conversationsService.restrictUser(
      client.data as User,
      id,
      username,
      conversationRestrictionEnum.BAN,
      null,
    );
    client
      .to(`conversation_${id}`)
      .emit('bannedUser', instanceToPlain(restriction));
    this.server.in(`user_${id}`).socketsLeave(`conversation_${id}`);
    return restriction;
  }
}
