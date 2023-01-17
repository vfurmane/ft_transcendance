import { ClassSerializerInterceptor, UseGuards, UseInterceptors } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from "../auth/auth.service";
import { ConversationsService } from "./conversations.service";

@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({
    namespace: 'conversations'
})
export class ConversationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server!: Server;
    // clients!: Set<Socket>;

    constructor (private readonly conversationsService: ConversationsService,
        private readonly authService: AuthService){
            // this.clients = new Set<Socket>();
            console.error("Constructor");
        }

    handleConnection(client : Socket) {
        console.log('New client trying to connected');
        if (! client.handshake.headers?.authorization)
        {
            client.emit('unauthorized', "No token provided");
            client.disconnect(true)
            console.error("No token");
        }
        else
        {
            const currentUser = this.authService.verifyUserFromToken(client.handshake.headers.authorization);
            if (!currentUser)
            {
                client.emit('unauthorized', "Invalid token");
                client.disconnect(true);
                // console.error("No user found");
            }
            else
            {
                // console.error("current id", currentUser);
                client.data.userId = currentUser.sub;
                client.data.name = currentUser.name;
                // console.error("data start", client.data, "data end");
                // this.clients.add(client);
            }
        }
        console.error("object.keys", this.server.sockets);
        // console.error("set of clients on connection", this.clients)
        client.emit('connection', 'Successfully connected to server');
    }
    
    handleDisconnect(client : any) {
        console.error("object.keys", this.server.sockets);
        // this.clients.delete(client)
        // console.error("set of clients on disconnection", this.clients);
        console.log('Client disconnected');
    }

    @SubscribeMessage('postMessage')
    postMessage(@MessageBody() data: string)
    {
        console.log(data);
        return (data);
    }
}