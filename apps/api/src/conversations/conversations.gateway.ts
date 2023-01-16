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
    clients!: {[key: string]: Socket[]};

    constructor (private readonly conversationsService: ConversationsService,
        private readonly authService: AuthService){
            this.clients = {};
            console.error("Constructor");
        }

    handleConnection(client : Socket) {
        console.log('New client connected');
        console.log("handshake", client.handshake.headers.authorization);
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
                console.error("No user found");
            }
            else
            {
                console.error("current id", currentUser);
                if (!this.clients[currentUser.sub])
                    this.clients[currentUser.sub] = [];
                this.clients[currentUser.sub].push(client);
                client.on('disconnect', (reason) =>
                {
                    if (this.clients[currentUser.sub].length === 1)
                        delete this.clients[currentUser.sub]
                    else
                        this.clients[currentUser.sub] = this.clients[currentUser.sub].filter((el) => el !== client)
                })
            }
        }
        console.error(this.clients)
        // console.log(this.jwtStrategy.validate())
        // this.authService.fetchProfileWithToken(client.handshake.headers.authorization).catch((error) => console.error(error))
        client.emit('connection', 'Successfully connected to server');
    }
    
    handleDisconnect(client : any) {
        console.error(this.clients)
        console.log('Client disconnected');
    }

    @SubscribeMessage('postMessage')
    postMessage(@MessageBody() data: string)
    {
        console.log(data);
        return (data);
    }
}