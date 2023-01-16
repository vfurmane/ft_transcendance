import { ClassSerializerInterceptor, UseGuards, UseInterceptors } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { AuthService } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtStrategy } from "../auth/jwt.strategy";
import { ConversationsService } from "./conversations.service";

@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({
    namespace: 'conversations'
})
export class ConversationsGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor (private readonly conversationsService: ConversationsService,
        private readonly jwtStrategy: JwtStrategy){}

    handleConnection(client : any) {
        console.log('New client connected');
        console.log("handshake", client.handshake.headers.authorization);
        // console.log(this.jwtStrategy.validate())
        // this.authService.fetchProfileWithToken(client.handshake.headers.authorization).catch((error) => console.error(error))
        client.emit('connection', 'Successfully connected to server');
    }
    
    handleDisconnect(client : any) {
        console.log('Client disconnected');
    }

    @SubscribeMessage('postMessage')
    postMessage(@MessageBody() data: string)
    {
        console.log(data);
        return (data);
    }
}