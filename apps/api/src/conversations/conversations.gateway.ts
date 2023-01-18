import { ClassSerializerInterceptor, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from "../auth/auth.service";
import { ConversationsService } from "./conversations.service";
import { sendMessageDto } from './dtos/sendMessage.dto';
import { isUUIDDto } from './dtos/IsUUID.dto';
import { BadRequestTransformationFilter } from "../common/decorators/BadRequestFilter.decorator";
import { User } from "../users/user.entity";
import { createConversationDto } from "./dtos/createConversation.dto";
import { updateRoleDto } from "./dtos/updateRole.dto";
import { Conversation } from "./entities/conversation.entity";
import { muteUserDto } from "./dtos/muteUser.dto";
import { isDateDto } from "./dtos/isDate.dto";
import { conversationRestrictionEnum } from "./conversationRestriction.enum";

@UseFilters(BadRequestTransformationFilter)
@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({
    namespace: 'conversations'
})
export class ConversationsGateway implements OnGatewayConnection {
    @WebSocketServer() server!: Server;

    constructor (private readonly conversationsService: ConversationsService,
        private readonly authService: AuthService){}

    async handleConnection(client : Socket): Promise<WsResponse<unknown>> {
        console.log('New client trying to connected');
        let event: string;
        let data: string;
        if (! client.handshake.headers?.authorization)
        {
            client.disconnect(true)
            console.error("No token");
            event = 'connection-refused';
            data = 'No token provided'
        }
        else
        {
            const currentUser = this.authService.verifyUserFromToken(client.handshake.headers.authorization);
            if (!currentUser)
            {
                client.disconnect(true);
                console.error("Invalid token");
                event = 'connection-refused';
                data = 'Invalid token'
            }
            else
            {
                client.data.id = currentUser.sub;
                client.data.name = currentUser.name;
                client.join(`user_${currentUser.sub}`)
                const conversations = await this.conversationsService.getConversationsIds(currentUser.sub)
                conversations.forEach((el) => {
                    client.join(`conversation_${el}`)
                });
                event = 'connection-success';
                data = 'Successfully connected to server'
            }
        }
        console.error(event)
        return { event: event, data: data };
    }
    
    // handleDisconnect(client : any) {
        // this.clients.get(client.data.id)?.delete(client.id)
        // if (this.clients.get(client.data.id)?.size === 0) this.clients.delete(client.data.id)
        // console.error("Removed socket", this.clients);
    // }

    @SubscribeMessage('getConversations')
    async getConversations(@ConnectedSocket() client: Socket)
    {
        return await this.conversationsService.getConversations(client.data as User)
    }

    @SubscribeMessage('createConversation')
    async createConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() newConversation: createConversationDto,
      ): Promise<Conversation>
      {
        const conversation = await this.conversationsService.createConversation(
          newConversation,
          client.data as User,
        );
        if (conversation)
        {
            this.server.in(`user_${client.data.id}`).socketsJoin(`conversation_${conversation.id}`)
            for (let participant of newConversation.participants)
            {
                this.server.in(`user_${participant}`).socketsJoin(`conversation_${conversation.id}`)
            }
            client.to(`conversation_${conversation.id}`).emit('newConversation', conversation)
        }
        return (conversation)
      }

      @SubscribeMessage('getUnread')
      async unreadCount(@ConnectedSocket() client : Socket)
      {
        return await this.conversationsService.unreadCount(client.data as User);
      }

      @SubscribeMessage('getMessages')
      async getMessages(@ConnectedSocket() client : Socket, @MessageBody() { id } : isUUIDDto)
      {
        return await this.conversationsService.getMessages(client.data as User, id);
      }


      @SubscribeMessage('postMessage')
      async postMessage(@ConnectedSocket() client: Socket, @MessageBody() { content }: sendMessageDto, @MessageBody() { id } : isUUIDDto)
      {
          const ret = await this.conversationsService.postMessage(client.data as User, id, content);
          if (ret)
              client.to(`conversation_${id}`).emit('newMessage', { id, content })
          return true
      }

      @SubscribeMessage('joinConversation')
      async joinConversation(@ConnectedSocket() client : Socket, @MessageBody() { id } : isUUIDDto, @MessageBody('password') password : string)
      {
        const conversation = await this.conversationsService.joinConversation(
            client.data as User,
            id,
            password,
          );
        if (conversation)
        {
            this.server.in(`user_${client.data.id}`).socketsJoin(`conversation_${conversation.id}`)
            client.to(`user_${client.data.id}`).emit('newConversation', conversation)
        }
        return (conversation)
      }

      @SubscribeMessage('getParticipants')
      async getConversationPartipants(@ConnectedSocket() client : Socket, @MessageBody() { id } : isUUIDDto)
      {
        return await this.conversationsService.getConversationParticipants(
            client.data as User,
            id,
          );
      }

      @SubscribeMessage('updateRole')
      async updateRole(@ConnectedSocket() client : Socket, @MessageBody() { id } : isUUIDDto, @MessageBody() newRole : updateRoleDto)
      {
        const role = await this.conversationsService.updateRole(id, newRole, client.data as User);
        if (role)
        {
            client.to(`conversation_${id}`).emit('newRole', newRole)
        }
        return (newRole)
      }

      @SubscribeMessage('leaveConversation')
      async leaveConversation(@ConnectedSocket() client : Socket, @MessageBody() { id } : isUUIDDto)
      {
        const role = await this.conversationsService.leaveConversation(client.data as User, id);
        if (role)
        {
            this.server.in(`user_${client.data.id}`).socketsLeave(`conversation_${id}`)
            client.to(`user_${client.data.id}`).emit('leaveConversation', id)
        }
        return id
      }

      @SubscribeMessage('muteUser')
      async muteUser(@ConnectedSocket() client : Socket, @MessageBody() { id, username } : muteUserDto, @MessageBody() { date } : isDateDto)
      {
        const restriction = await this.conversationsService.restrictUser(
            client.data as User,
            id,
            username,
            conversationRestrictionEnum.MUTE,
            new Date(date),
          );
        client.to(`conversation_${id}`).emit('mutedUser', restriction)
        return (restriction);
      }

      @SubscribeMessage('banUser')
      async banUser(@ConnectedSocket() client : Socket, @MessageBody() { id, username } : muteUserDto, @MessageBody() { date } : isDateDto)
      {
        const restriction = this.conversationsService.restrictUser(
            client.data as User,
            id,
            username,
            conversationRestrictionEnum.BAN,
            new Date(date),
          );
        client.to(`conversation_${id}`).emit('bannedUser', restriction)
        return (restriction);
      }

      @SubscribeMessage('banUserIndefinitely')
      async banUserIndefinitely(@ConnectedSocket() client : Socket, @MessageBody() { id, username } : muteUserDto)
      {
        const restriction = this.conversationsService.restrictUser(
            client.data as User,
            id,
            username,
            conversationRestrictionEnum.BAN,
            null,
          );
        client.to(`conversation_${id}`).emit('bannedUser', restriction)
        return (restriction);
      }
}