import {
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { HttpExceptionTransformationFilter } from '../common/filters/HttpExceptionFilter.filter';
import { isUUIDDto } from '../conversations/dtos/IsUUID.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

@UseFilters(HttpExceptionTransformationFilter)
@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({ namespace: 'users' })
export class UsersGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket): Promise<string> {
    console.log('New client trying to connect');
    if (!client.handshake.headers?.authorization)
      throw new WsException('No Authorization header found');
    const currentUser = this.authService.verifyUserFromToken(
      client.handshake.headers.authorization,
    );
    if (!currentUser) throw new WsException('Invalid token');
    client.data = { id: currentUser.sub, name: currentUser.name };
    client.join(`user_${currentUser.sub}`);
    return 'Connection established';
  }

  @SubscribeMessage('getUser')
  async getUser(@MessageBody() { id }: isUUIDDto): Promise<User> {
    const user = await this.usersService.getById(id);
    if (!user) throw new WsException('User not found');
    return user;
  }
}
