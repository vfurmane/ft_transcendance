import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  CACHE_MANAGER,
  Inject,
  Logger,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AuthService } from './auth/auth.service';
import { HttpExceptionTransformationFilter } from './common/filters/HttpExceptionFilter.filter';

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
    if (!client.handshake.auth.token)
      throw new UnauthorizedException('No Authorization header found');
    const currentUser = this.authService.verifyUserFromToken(
      client.handshake.auth.token,
    );
    if (!currentUser) throw new UnauthorizedException('Invalid token');
    client.data = { id: currentUser.sub, name: currentUser.name };
    client.join(`user_${currentUser.sub}`);
    this.server
      .to(`user_${currentUser.sub}`)
      .emit(JSON.stringify({ event_type: 'connected' }));
    this.cacheManager.set(`user:${currentUser.sub}`, currentUser, 0);
    this.logger.log(`${currentUser.sub} connected`);
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
          this.server
            .to(`user_${client.data.id}`)
            .emit(JSON.stringify({ event_type: 'disconnected' }));
          this.logger.log(`${client.data.id} disconnected`);
        }
      });
  }
}
