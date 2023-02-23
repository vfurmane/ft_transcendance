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
import { Block, User } from 'types';
import { createConversationDto } from './dtos/createConversation.dto';
import { updateRoleDto } from './dtos/updateRole.dto';
import { Conversation } from 'types';
import { muteUserDto } from './dtos/muteUser.dto';
import { isDateDto } from './dtos/isDate.dto';
import { conversationRestrictionEnum } from 'types';
import { ConversationsDetails, unreadMessagesResponse } from 'types';
import { Message } from 'types';
import { ConversationRole } from 'types';
import { UsersService } from '../users/users.service';
import { instanceToPlain } from 'class-transformer';
import { BlockUserDto } from './block-user.dto';
import { invitationDto } from './dtos/invitation.dto';
import getCookie from 'src/common/helpers/getCookie';
import { addConversationPasswordDto } from './dtos/addConversationPassword.dto';
import { updateConversationPasswordDto } from './dtos/updateConversationPassword.dto';
import { removeConversationPasswordDto } from './dtos/removeConversationPassword.dto';

@UseFilters(new HttpExceptionTransformationFilter())
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
    const token = getCookie(client, 'access_token');
    if (!token) {
      client.disconnect();
      return;
    }
    const currentUser = this.authService.verifyUserFromToken(token);
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
      if (newConversation.participant) {
        this.server
          .in(`user_${newConversation.participant}`)
          .socketsJoin(`conversation_${conversation.id}`);
      }
      client
        .to(`conversation_${conversation.id}`)
        .emit('newConversation', instanceToPlain(conversation));
    }
    if (newConversation.visible) {
      this.server.emit('NewChannel');
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

  @SubscribeMessage('getChannels')
  getChannels(@ConnectedSocket() client: Socket): Promise<Conversation[]> {
    return this.conversationsService.getChannels(client.data as User);
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

  @SubscribeMessage('read')
  async readMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: isUUIDDto,
  ) {
    return this.conversationsService.readMessage(client.data as User, id);
  }

  @SubscribeMessage('inviteToConversation')
  async inviteToConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() invitation: invitationDto,
  ): Promise<boolean> {
    let DMId!: string;
    if (!invitation.conversationID) return false;
    const invitationMessage =
      await this.conversationsService.inviteToConversation(
        client.data as User,
        invitation,
      );
    if (!invitationMessage) return false;
    if (invitationMessage.conversation) {
      this.server
        .in(`user_${client.data.id}`)
        .socketsJoin(`conversation_${invitationMessage.conversation.id}`);
      this.server
        .in(`user_${invitation.target}`)
        .socketsJoin(`conversation_${invitationMessage.conversation.id}`);
      this.server
        .in(`conversation_${invitationMessage.conversation.id}`)
        .emit(
          'newConversation',
          instanceToPlain(invitationMessage.conversation),
        );
      DMId = invitationMessage.conversation.id;
    } else if (invitationMessage.prevConversation)
      DMId = invitationMessage.prevConversation;
    else DMId = '';
    this.server.in(`conversation_${DMId}`).emit('newMessage', {
      DMId,
      message: instanceToPlain(invitationMessage.message),
    });
    return true;
  }

  @SubscribeMessage('canJoinConversation')
  async canJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: isUUIDDto,
  ) {
    return this.conversationsService.canJoinConversation(
      client.data as User,
      id,
    );
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
      this.server
        .in(`user_${client.data.id}`)
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

  @SubscribeMessage('DMExists')
  async DMExists(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: isUUIDDto,
  ) {
    if (client.data.id === id)
      return { conversationExists: false, conversation: null };
    return this.conversationsService.DMExists(client.data as User, id);
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
    const target = await this.usersService.getByUsername(username);
    client
      .to(`conversation_${id}`)
      .emit('mutedUser', { conversationID: id, userId: target?.id });
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
    const target = await this.usersService.getByUsername(username);
    client
      .to(`conversation_${id}`)
      .emit('bannedUser', { conversationID: id, userId: target?.id });
    client
      .to(`user_${target?.id}`)
      .emit('bannedUser', { conversationID: id, userId: target?.id });
    this.server.in(`user_${target?.id}`).socketsLeave(`conversation_${id}`);
    return restriction;
  }

  @SubscribeMessage('kickUser')
  async kickUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id, username }: muteUserDto,
  ): Promise<boolean> {
    const restriction = await this.conversationsService.kickUser(
      client.data as User,
      id,
      username,
    );
    const target = await this.usersService.getByUsername(username);
    client
      .to(`conversation_${id}`)
      .emit('kickedUser', { conversationID: id, userId: target?.id });
    client
      .to(`user_${target?.id}`)
      .emit('kickedUser', { conversationID: id, userId: target?.id });
    this.server.in(`user_${target?.id}`).socketsLeave(`conversation_${id}`);
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
    const target = await this.usersService.getByUsername(username);
    client
      .to(`conversation_${id}`)
      .emit('bannedUser', { conversationID: id, userId: target?.id });
    client
      .to(`user_${target?.id}`)
      .emit('bannedUser', { conversationID: id, userId: target?.id });
    this.server.in(`user_${target?.id}`).socketsLeave(`conversation_${id}`);
    return restriction;
  }

  @SubscribeMessage('get_blocked_users')
  async getBlockedUsers(@ConnectedSocket() client: Socket): Promise<Block[]> {
    return this.conversationsService.getBlockedUsers(client.data.id);
  }

  @SubscribeMessage('block_user')
  async blockUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() { targetId }: BlockUserDto,
  ): Promise<{ targetId: string | null }> {
    if (
      client.data.id === targetId ||
      (await this.conversationsService.blockExists(client.data.id, targetId))
    ) {
      return { targetId: null };
    }
    const source = await this.usersService.getById(client.data.id);
    const target = await this.usersService.getById(targetId);
    if (!source || !target) {
      return { targetId: null };
    }
    await this.conversationsService.blockUser(source, target);
    const DMExists = await this.conversationsService.DMExists(
      client.data as User,
      targetId,
    );
    if (DMExists.conversationExists) {
      this.server
        .in(`user_${client.data.id}`)
        .socketsLeave(`conversation_${DMExists.conversation?.id}`);
    }
    return { targetId };
  }

  @SubscribeMessage('unblock_user')
  async unblockUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() { targetId }: BlockUserDto,
  ): Promise<{ targetId: string | null }> {
    if (client.data.id === targetId) return { targetId: null };
    await this.conversationsService.unblockUser(client.data.id, targetId);
    const DMExists = await this.conversationsService.DMExists(
      client.data as User,
      targetId,
    );
    if (DMExists.conversationExists) {
      this.server
        .in(`user_${client.data.id}`)
        .socketsJoin(`conversation_${DMExists.conversation?.id}`);
    }
    return { targetId };
  }

  @SubscribeMessage('unbanUser')
  async unbanUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id, username }: muteUserDto,
  ) {
    const ret = await this.conversationsService.unbanUser(client.data as User, {
      id,
      username,
    });
    const target = await this.usersService.getByUsername(username);
    if (target)
      this.server.in(`user_${target.id}`).socketsJoin(`conversation_${id}`);
    client
      .to(`conversation_${id}`)
      .emit('unbannedUser', { conversationID: id, userId: target?.id });
    client
      .to(`user_${target?.id}`)
      .emit('unbannedUser', { conversationID: id, userId: target?.id });
    return ret;
  }

  @SubscribeMessage('unmuteUser')
  async unmuteUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id, username }: muteUserDto,
  ) {
    const ret = this.conversationsService.unmuteUser(client.data as User, {
      id,
      username,
    });
    const target = await this.usersService.getByUsername(username);
    client
      .to(`conversation_${id}`)
      .emit('unmutedUser', { conversationID: id, userId: target?.id });
    return ret;
  }

  @SubscribeMessage('makeVisible')
  async makeVisible(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: isUUIDDto,
  ) {
    const ret = await this.conversationsService.changeVisibility(
      client.data as User,
      id,
      true,
    );
    if (ret) {
      this.server.emit('isVisible', id);
    }
    return true;
  }

  @SubscribeMessage('makeInvisible')
  async makeInvisible(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: isUUIDDto,
  ) {
    const ret = await this.conversationsService.changeVisibility(
      client.data as User,
      id,
      false,
    );
    if (ret) {
      this.server.emit('isInvisible', id);
    }
    return true;
  }

  @SubscribeMessage('addPassword')
  async addPassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() addConversationPasswordDto: addConversationPasswordDto,
  ) {
    const ret = await this.conversationsService.addPassword(
      client.data as User,
      addConversationPasswordDto,
    );
    if (ret) {
      this.server.emit('protectChannel', addConversationPasswordDto.id);
    }
    return true;
  }

  @SubscribeMessage('updatePassword')
  updatePassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateConversationPasswordDto: updateConversationPasswordDto,
  ) {
    return this.conversationsService.updatePassword(
      client.data as User,
      updateConversationPasswordDto,
    );
  }

  @SubscribeMessage('removePassword')
  async removePassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() removeConversationPasswordDto: removeConversationPasswordDto,
  ) {
    console.error('removing password');
    const ret = await this.conversationsService.removePassword(
      client.data as User,
      removeConversationPasswordDto,
    );
    if (ret) {
      this.server.emit('unprotectChannel', removeConversationPasswordDto.id);
    }
    return true;
  }

  // @SubscribeMessage('removePassword')
  // async removePassword(@ConnectedSocket() client : Socket, @MessageBody() {id} : isUUIDDto)
}
