import { Server, Socket } from 'socket.io';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import {
  BadRequestException,
  CACHE_MANAGER,
  ClassSerializerInterceptor,
  Inject,
  Logger,
  NotFoundException,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GameEntityFront,
  GameStartPayload,
  User,
  Userfront,
  GameMode,
  UserStatusUpdatePayload,
} from 'types';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';
import { SubscribedGameDto } from './subscribed-game.dto';
import { PongService } from './pong.service';
import { JoinQueueDto } from './join-queue.dto';
import { UsersService } from 'src/users/users.service';
import { instanceToPlain, TransformInstanceToPlain } from 'class-transformer';
import { InviteUserDto } from './invite-user.dto';
import getCookie from '../common/helpers/getCookie';
import { eventNames, listeners } from 'process';
import { SpiedUserDto } from '../spied-user.dto';
import { ConversationsService } from '../conversations/conversations.service';

@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({ namespace: 'pong' })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  room_id!: string[];

  constructor(
    private readonly authService: AuthService,
    private readonly conversationsService: ConversationsService,
    private readonly logger: Logger,
    private readonly pongService: PongService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly transformUserService: TransformUserService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.room_id = [];
  }

  async handleConnection(client: Socket): Promise<void | string> {
    console.log('SOMEBODY IS TRYING TO CONNECT');
    const token = getCookie(client, 'access_token');
    if (!token) {
      client.disconnect();
      console.log('No Authorization cookie found');
      return;
    }
    const currentUser = this.authService.verifyUserFromToken(token);
    if (!currentUser) {
      client.disconnect();
      console.log('invalid Token');
      return;
    }
    client.data = {
      id: currentUser.sub,
      name: currentUser.name,
      room: undefined,
      position: -1,
    };
    client.join(`user_${currentUser.sub}`);
    console.log('NEW CONNECTION!');
    console.log('YOU ARE ' + currentUser.name + ' OF ID ' + client.data.id);
    if (this.pongService.games) {
      this.pongService.games.forEach((value, key) => {
        value[1].forEach((user) => {
          if (user.id === client.data.id) {
            client.data.room = key;
            client.data.position = value[1].indexOf(user);
            client.join(`game_${key}`);
            console.log('Reconnected to the game !');
            this.server
              .in(`user_${client.data.id}`)
              .emit('replace', `/pingPong/${key}`);
            return 'Connection restored';
          }
        });
      });
    }
    return 'Connection established';
  }

  async handleDisconnect(client: Socket): Promise<void> {
    await this.leaveQueue(client);
    if (!client.data.room) {
      console.log(client.data.name + ' WAS NOT IN A ROOM');
      return;
    }
    if (!this.room_id.includes(client.data.room)) {
      console.log(client.data.name + ' IS CURRENTLY GAMING');
      return;
    }
    client.leave(client.data.room);
  }

  @Interval(17) // THIS FUNCTION CALLS UPDATE FOR EVERY CURRENT GAME
  update(): void {
    if (!this.pongService.games || this.pongService.games === undefined) {
      return;
    }
    this.pongService.games.forEach(async (key, room) => {
      const game = key[0];
      if (game.boardType !== 0) {
        let pos: number;
        if ((pos = game.updateGame()) !== -1) {
          const sockets = await this.server.in(`game_${room}`).fetchSockets();
          key[1].splice(pos, 1);
          sockets.forEach((socket) => {
            if (socket.data.position === pos) {
              socket.data.position = -1;
              this.cacheManager.del(`spy:${socket.data.id}`);
              this.server
                .to(`spy_${socket.data.id}`)
                .emit('user_status_update', {
                  type: 'online',
                  userId: socket.data.id,
                });
            } else if (socket.data.position > pos) {
              socket.data.position--;
            }
          });
          console.log('REMOVED PLAYER ', pos);
        }
      } else {
        console.log('GAME ENDED');
        const sockets = await this.server.in(`game_${room}`).fetchSockets();
        this.server.emit('game_end', {
          id: room,
          users: [],
        } as GameStartPayload);
        this.server.in(`game_${room}`).emit('endGame');
        sockets.forEach((socket) => {
          socket.leave(`game_${room}`);
          this.cacheManager.del(`spy:${socket.data.id}`);
          this.server.to(`spy_${socket.data.id}`).emit('user_status_update', {
            type: 'online',
            userId: socket.data.id,
          });
          socket.data.room = undefined;
        });
        if (key[1].length === 2)
          this.pongService.saveGame(
            key[1].map((e) => e.id),
            key[0].player.map((e) => e.hp),
            key[0].live,
          );
        this.pongService.games.delete(room);
      }
    });
  }

  @SubscribeMessage('ready')
  async clientIsReady(
    @ConnectedSocket() client: Socket,
  ): Promise<void | string> {
    const room = client.data.room;
    if (!this.checkUser(client, room)) {
      return 'You are not allowed to send this kind of message !';
    }
    const game = this.pongService.games.get(room);
    if (!game || !game[0]) {
      return 'Game is not launched';
    }
    game[1].forEach((user) => {
      if (client.data.id === user.id) {
        if (user.ready === true) {
          console.log(
            client.data.name + ' SENT A READY REQUEST HE WASNT SUPPOSED TO ...',
          );
          return;
        }
        console.log(client.data.name + ' IS READY IN GAME ' + room);
        user.ready = true;
        this.cacheManager.set(`spy:${user.id}`, user.id, 0);
        this.server.to(`spy_${user.id}`).emit('user_status_update', {
          type: 'gaming',
          userId: user.id,
        });
        for (let i = 0; i < game[1].length; i++) {
          if (game[1][i].ready === false) {
            return;
          }
        }
        console.log('LAUNCHING GAME AT ', Date.now());
        game[0].init();
        game[0].await = false;
        this.server
          .in(`game_${room}`)
          .emit('refresh', game[0].getState(), Date.now());
      }
    });
  }

  /*    THIS FUNCTION IS DEBUG ONLY (SHOW SERVER SIDE VISION OF THE GAME)    */
  // @Interval(10)
  // refresh() {
  // 	if (!this.games || this.games === undefined) {
  // 		return ;
  // 	}
  // 	this.games.forEach(async (key, room) => {
  // 		let game = key[0];
  // 		if (!game.await && game.boardType !== 0) {
  // 			let state = game.getState();
  // 			this.server.in(room).emit('refresh', state, Date.now());
  // 		}
  // 	});
  // }

  checkUser(client: Socket, room: undefined | string): boolean {
    if (room === undefined) {
      // not in any room
      console.log('no room');
      return false;
    } else if (client.data.position === -1) {
      // is not a player (spectate)
      console.log('no position : ' + client.data.position);
      return false;
    }
    return true;
  }

  @SubscribeMessage('pressUp')
  async pressUp(@ConnectedSocket() client: Socket): Promise<void | string> {
    const room = client.data.room;
    if (!this.checkUser(client, room)) {
      return 'You are not allowed to send this kind of message !';
    }
    const game = this.pongService.games.get(room)![0];
    if (!game) {
      return 'Game not launched';
    }
    game.movePlayer(client.data.position, true, true);
    this.server.in(`game_${room}`).emit('refresh', game.getState(), Date.now());
    return 'You pressed up';
  }

  @SubscribeMessage('unpressUp')
  async unpressUp(@ConnectedSocket() client: Socket): Promise<void | string> {
    const room = client.data.room;
    if (!this.checkUser(client, room)) {
      return 'You are not allowed to send this kind of message !';
    }
    const game = this.pongService.games.get(room)![0];
    if (!game) {
      return 'Game not launched';
    }

    game.movePlayer(client.data.position, true, false);
    this.server.in(`game_${room}`).emit('refresh', game.getState(), Date.now());
    return 'You moved up';
  }

  @SubscribeMessage('pressDown')
  async pressDown(@ConnectedSocket() client: Socket): Promise<void | string> {
    const room = client.data.room;
    if (!this.checkUser(client, room)) {
      return 'You are not allowed to send this kind of message !';
    }
    const game = this.pongService.games.get(room)![0];
    if (!game) {
      return 'Game not launched';
    }
    game.movePlayer(client.data.position, false, true);
    this.server.in(`game_${room}`).emit('refresh', game.getState(), Date.now());
    return 'You moved down ';
  }

  @SubscribeMessage('unpressDown')
  async unpressDown(@ConnectedSocket() client: Socket): Promise<void | string> {
    const room = client.data.room;
    if (!this.checkUser(client, room)) {
      return 'You are not allowed to send this kind of message !';
    }
    const game = this.pongService.games.get(room)![0];
    if (!game) {
      return 'Game not launched';
    }
    game.movePlayer(client.data.position, false, false);
    this.server.in(`game_${room}`).emit('refresh', game.getState(), Date.now());
    return 'You moved down ';
  }

  @SubscribeMessage('subscribe_game')
  async subscribeGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() subscribedGameDto: SubscribedGameDto,
  ): Promise<GameEntityFront> {
    client.data.room = subscribedGameDto.id;
    let game: GameEntityFront;
    try {
      game = await this.pongService.getGame(subscribedGameDto.id);
    } catch (error) {
      return { id: '', opponents: [] };
    }
    client.data.position = game.opponents.findIndex(
      (opponent) => opponent.user.id === client.data.id,
    );
    client.join(`game_${subscribedGameDto.id}`);
    return game;
    return await this.pongService.getGame(subscribedGameDto.id);
  }

  @SubscribeMessage('unsubscribe_game')
  unsubscribeGame(@ConnectedSocket() client: Socket): void {
    client.leave(`game_${client.data.room}`);
    client.data.room = undefined;
  }

  @SubscribeMessage('launch')
  async launch(@ConnectedSocket() client: Socket) {
    console.log('receiving launch');
    const user = await this.usersService.getById(client.data.id);
    if (!user) return;
    const gameQueue = await this.pongService.getGameModeQueue(
      GameMode.BATTLE_ROYALE,
    );
    if (!gameQueue) return;
    if (gameQueue.length < 2) return;
    if (user.id !== gameQueue[0].id) return;
    console.log('should be launching the game');
    const game = await this.pongService.startGame(gameQueue, this.server);

    this.server.emit(
      'game_start',
      instanceToPlain<GameStartPayload>({
        id: game.id,
        users: await Promise.all(
          gameQueue.map((e) => this.transformUserService.transform(e)),
        ),
      }),
    );
  }

  @SubscribeMessage('join_queue')
  async joinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinQueueDto: JoinQueueDto,
  ): Promise<void> {
    const user = await this.usersService.getById(client.data.id);
    if (!user) return;
    const gameQueue = this.pongService.join(user, joinQueueDto.game_mode);
    this.logger.log(
      `'${user.id}' (${user.name}) has joined queue for game mode '${joinQueueDto.game_mode}'`,
    );
    if (gameQueue !== null) {
      this.logger.log(`Queue is full, the game will start soon. Players:`);
      const game = await this.pongService.startGame(gameQueue, this.server);
      gameQueue.forEach((user_loop) => {
        this.logger.log(`- ${user_loop.id} (${user_loop.name})`);
      });
      this.server.emit(
        'game_start',
        instanceToPlain<GameStartPayload>({
          id: game.id,
          users: await Promise.all(
            gameQueue.map((opponent) =>
              this.transformUserService.transform(opponent),
            ),
          ),
        }),
      );
    }
    const lead = this.pongService.getFirstUserOfGameModeQueue(
      GameMode.BATTLE_ROYALE,
    );
    if (lead !== undefined) {
      this.server
        .in(`user_${lead.id}`)
        .emit(
          'lead',
          this.pongService.getLengthOfGameModeQueue(GameMode.BATTLE_ROYALE),
        );
    }
  }

  @SubscribeMessage('leave_queue')
  async leaveQueue(@ConnectedSocket() client: Socket): Promise<void> {
    const user = await this.usersService.getById(client.data.id);
    if (!user) return;
    this.pongService.leave(user);
    this.logger.log(`'${user.id}' (${user.name}) has left queue`);
    const lead = this.pongService.getFirstUserOfGameModeQueue(
      GameMode.BATTLE_ROYALE,
    );
    if (lead !== undefined) {
      this.server
        .in(`user_${lead.id}`)
        .emit(
          'lead',
          this.pongService.getLengthOfGameModeQueue(GameMode.BATTLE_ROYALE),
        );
    }
  }

  @SubscribeMessage('invite')
  async invite(
    @ConnectedSocket() client: Socket,
    @MessageBody() inviteUserDto: InviteUserDto,
  ): Promise<{ message: string }> {
    this.logger.debug('invite');
    const host = await this.usersService.getById(client.data.id);
    const target = await this.usersService.getById(inviteUserDto.id);
    if (!host || !target)
      throw new BadRequestException('`host` or `target` not found');

    const gameQueue = this.pongService.invite(host, target);
    if (gameQueue) {
      this.logger.log(
        `Invitation accepted, the game will start soon. Players:`,
      );
      gameQueue.forEach((user_loop) => {
        this.logger.log(`- ${user_loop.id} (${user_loop.name})`);
      });
      const game = await this.pongService.startGame(gameQueue, this.server);
      setTimeout(async () => {
        this.server.emit(
          'game_start',
          instanceToPlain<GameStartPayload>({
            id: game.id,
            users: await Promise.all(
              gameQueue.map((opponent) =>
                this.transformUserService.transform(opponent),
              ),
            ),
          }),
        );
      }, 100);
    } else {
      this.logger.log(`Invitation sent, the user will receive a message`);
      const { conversation, newConversationMessage } =
        await this.conversationsService.createConversation(
          {
            name: `${host.name} - ${target.name}`,
            groupConversation: false,
            password: '',
            participant: target.id,
            visible: false,
          },
          client.data as User,
        );
      if (newConversationMessage) {
        this.server
          .to(`user_${target.id}`)
          .emit('newConversation', instanceToPlain(conversation));
      }
      const ret = await this.conversationsService.postPongInvitationMessage(
        client.data as User,
        conversation.id,
        "let's play",
      );
      this.server.to(`user_${target.id}`).emit('newPongMessage', {
        id: conversation.id,
        message: instanceToPlain(ret),
      });
    }

    return { message: 'Waiting for approval' };
  }

  @SubscribeMessage('discard')
  async discard(
    @ConnectedSocket() client: Socket,
  ): Promise<{ message: string }> {
    const host = await this.usersService.getById(client.data.id);
    if (!host) throw new BadRequestException('`host` not found');
    this.pongService.discardInvitations(host);
    return { message: 'Invitations discarded' };
  }

  @SubscribeMessage('get_featuring')
  async getFeaturing(): Promise<GameStartPayload[]> {
    const games: GameStartPayload[] = [];
    for (const [gameId, game] of this.pongService.games) {
      games.push({
        id: gameId,
        users: await Promise.all(
          game[1].map(async (opponent): Promise<Userfront> => {
            const user = await this.usersService.getById(opponent.id);
            return this.transformUserService.transform(user);
          }),
        ),
      });
    }
    return games;
  }

  @SubscribeMessage('subscribe_user')
  async subscribeUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() spiedUserDto: SpiedUserDto,
  ): Promise<boolean> {
    client.join(`spy_${spiedUserDto.userId}`);
    const user = await this.cacheManager.get<User>(
      `spy:${spiedUserDto.userId}`,
    );
    console.log(user);
    return user !== undefined;
  }

  @SubscribeMessage('unsubscribe_user')
  unsubscribeUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() spiedUserDto: SpiedUserDto,
  ): void {
    this.logger.log(
      `'${client.data.id}' (${client.data.name}) is not spying on '${spiedUserDto.userId}' anymore`,
    );
    client.leave(`spy_${spiedUserDto.userId}`);
  }
}
