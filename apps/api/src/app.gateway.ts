import {
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AuthService } from './auth/auth.service';

@WebSocketGateway()
export class AppGateway {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    if (!client.handshake.auth.token)
      throw new WsException('No Authorization header found');
    const currentUser = this.authService.verifyUserFromToken(
      client.handshake.auth.token,
    );
    if (!currentUser) throw new WsException('Invalid token');
    client.data = { id: currentUser.sub, name: currentUser.name };
    client.join(`user_${currentUser.sub}`);
    this.server
      .to(`user_${currentUser.sub}`)
      .emit(JSON.stringify({ event_type: 'connected' }));
    this.cacheManager.set(`user:${currentUser.sub}`, currentUser, 0);
    this.logger.log(`${currentUser.sub} connected`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.cacheManager.del(`user:${client.data.id}`);
    this.server
      .to(`user_${client.data.id}`)
      .emit(JSON.stringify({ event_type: 'disconnected' }));
    this.logger.log(`${client.data.id} disconnected`);
  }
}
