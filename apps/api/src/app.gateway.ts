import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  CACHE_MANAGER,
  Inject,
  Logger,
  UseFilters,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AuthService } from './auth/auth.service';
import { HttpExceptionTransformationFilter } from './common/filters/HttpExceptionFilter.filter';
import { SpiedUserDto } from './spied-user.dto';
import { User, UserStatusUpdatePayload } from 'types';
import getCookie from './common/helpers/getCookie';

@WebSocketGateway()
@UseFilters(HttpExceptionTransformationFilter)
export class AppGateway {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = getCookie(client, "access_token");
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
    this.server.to(`user_${currentUser.sub}`).emit('user_status_update', {
      type: 'online',
      userId: client.data.id,
    });
    this.cacheManager.set(`user:${currentUser.sub}`, currentUser, 0);
    this.logger.log(
      `'${currentUser.sub}' (${currentUser.name}) connected on socket '${client.id}'`,
    );
  }

  async handleDisconnect(client: Socket): Promise<void> {
    await this.server
      .in(`user_${client.data.id}`)
      .fetchSockets()
      .then((sockets) => {
        if (
          sockets.filter((socket) => socket.data.id === client.data.id)
            .length === 0
        ) {
          this.cacheManager.del(`user:${client.data.id}`);
          this.server.to(`user_${client.data.id}`).emit('user_status_update', {
            type: 'offline',
            userId: client.data.id,
          });
          this.logger.log(
            `'${client.data.id}' (${client.data.name}) disconnected from socket '${client.id}'`,
          );
        }
      });
  }

  @SubscribeMessage('subscribe_user')
  async subscribeUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() spiedUserDto: SpiedUserDto,
  ): Promise<UserStatusUpdatePayload> {
    this.logger.log(
      `'${client.data.id}' (${client.data.name}) is spying on '${spiedUserDto.userId}'`,
    );
    client.join(`user_${spiedUserDto.userId}`);
    const user = await this.cacheManager.get<User>(
      `user:${spiedUserDto.userId}`,
    );
    return {
      type: user ? 'online' : 'offline',
      userId: spiedUserDto.userId,
    };
  }

  @SubscribeMessage('unsubscribe_user')
  unsubscribeUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() spiedUserDto: SpiedUserDto,
  ): void {
    this.logger.log(
      `'${client.data.id}' (${client.data.name}) is not spying on '${spiedUserDto.userId}' anymore`,
    );
    client.leave(`user_${spiedUserDto.userId}`);
  }
}
