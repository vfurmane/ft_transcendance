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
import { Conversation } from "./entities/conversation.entity";

@UseFilters(BadRequestTransformationFilter)
@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({
    namespace: 'conversations'
})
export class ConversationsGateway implements OnGatewayConnection {
    @WebSocketServer() server!: Server;
    // clients!: Map<string, Set<string> >;

    constructor (private readonly conversationsService: ConversationsService,
        private readonly authService: AuthService){
            // this.clients = new Map<string, Set<string> >();
        }

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
                // if (!this.clients.has(currentUser.sub)) this.clients.set(currentUser.sub, new Set<string>([client.id]))
                // else this.clients.get(currentUser.sub)?.add(client.id)
                // console.error("Added socket: ", this.clients);
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

    @SubscribeMessage('postMessage')
    async postMessage(@ConnectedSocket() client: Socket, @MessageBody() { content }: sendMessageDto, @MessageBody() { id } : isUUIDDto)
    {
        const ret = await this.conversationsService.postMessage(client.data as User, id, content);
        if (ret)
            client.to(`conversation_${id}`).emit('newMessage', { id, content })
        return true
    }

    @SubscribeMessage('getConversations')
    getConversations(@ConnectedSocket() client: Socket)
    {
        return this.conversationsService.getConversations(client.data as User)
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
            console.error("passed room id", `user_${client.data.id}`)
            this.server.in(`user_${client.data.id}`).socketsJoin(`conversation_${conversation.id}`)
            for (let participant of newConversation.participants)
            {
                this.server.in(`user_${participant}`).socketsJoin(`conversation_${conversation.id}`)
            }
            console.error(await this.server.in(`user_${client.data.id}`).fetchSockets())
        }
        return (conversation)
      }
}