import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ClassSerializerInterceptor,
  Logger,
  UnauthorizedException,
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { JoinQueueDto } from './join-queue.dto';
import { UsersService } from 'src/users/users.service';
import { HttpExceptionTransformationFilter } from 'src/common/filters/HttpExceptionFilter.filter';
import { AuthService } from 'src/auth/auth.service';
import { instanceToPlain } from 'class-transformer';
import { GameStartPayload } from 'types';

@UseFilters(HttpExceptionTransformationFilter)
@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({ namespace: 'matchmaking' })
export class MatchmakingGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
    private readonly matchmakingService: MatchmakingService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    if (!client.handshake.auth.token)
      throw new UnauthorizedException('No Authorization header found');
    const currentUser = this.authService.verifyUserFromToken(
      client.handshake.auth.token,
    );
    if (!currentUser) throw new UnauthorizedException('Invalid token');
    client.data = { id: currentUser.sub, name: currentUser.name };
  }

  async handleDisconnect(client: Socket): Promise<void> {
    await this.leaveQueue(client);
  }

  @SubscribeMessage('join_queue')
  async joinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinQueueDto: JoinQueueDto,
  ): Promise<void> {
    const user = await this.usersService.getById(client.data.id);
    if (!user) return;
    const gameQueue = this.matchmakingService.join(
      user,
      joinQueueDto.game_mode,
    );
    this.logger.log(
      `'${user.id}' (${user.name}) has joined queue for game mode '${joinQueueDto.game_mode}'`,
    );
    if (gameQueue !== null) {
      this.logger.log(`Queue is full, the game will start soon. Players:`);
      gameQueue.forEach((user_loop) => {
        this.logger.log(`- ${user_loop.id} (${user_loop.name})`);
      });

      this.server.emit(
        'game_start',
        instanceToPlain<GameStartPayload>({
          users: gameQueue,
        }),
      );
    }
  }

  @SubscribeMessage('leave_queue')
  async leaveQueue(@ConnectedSocket() client: Socket): Promise<void> {
    const user = await this.usersService.getById(client.data.id);
    if (!user) return;
    this.matchmakingService.leave(user);
    this.logger.log(`'${user.id}' (${user.name}) has left queue`);
  }
}
