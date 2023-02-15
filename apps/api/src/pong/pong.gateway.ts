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
  ClassSerializerInterceptor,
  Logger,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEntityFront, GameStartPayload, User } from 'types';
import { Repository } from 'typeorm';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';
import { SubscribedGameDto } from './subscribed-game.dto';
import { PongService } from './pong.service';
import { JoinQueueDto } from './join-queue.dto';
import { UsersService } from 'src/users/users.service';
import { instanceToPlain } from 'class-transformer';

@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({ namespace: 'pong' })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  room_id!: string[];

  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
    private readonly pongService: PongService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly transformUserService: TransformUserService,
  ) {
    this.room_id = [];
  }

  async handleConnection(client: Socket): Promise<void | string> {
    console.log('SOMEBODY IS TRYING TO CONNECT');
    const currentUser = this.authService.verifyUserFromToken(
      client.handshake.auth.token,
    );
    if (!currentUser) {
      client.disconnect();
      console.log('no Authorization');
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
            client.join(key);
            console.log('Reconnected to the game !');
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
    console.log(client.data.name + ' LEFT WAITING ROOM');
    const socketWaiting = await this.server.in(client.data.room).fetchSockets();
    if (socketWaiting.length === 0) {
      this.room_id.splice(this.room_id.indexOf(client.data.room), 1);
      console.log('REMOVED THE ROOM');
      console.log(this.room_id);
    } else {
      let i = 0;
      socketWaiting.forEach((socket) => (socket.data.position = i++));
    }
    console.log(client.data.name + ' DISCONNECTED');
  }

  @Interval(17) // THIS FUNCTION CALLS UPDATE FOR EVERY CURRENT GAME
  update(): void {
    if (!this.pongService.games || this.pongService.games === undefined) {
      return;
    }
    this.pongService.games.forEach(async (key, room) => {
      const game = key[0];
      if (game.boardType !== 0) {
        game.updateGame();
      } else {
        console.log('GAME ENDED');
        const sockets = await this.server.in(room).fetchSockets();
        this.server.in(room).emit('endGame'); // TELL CLIENT TO LEAVE AND REMOVE THE ROOM
        sockets.forEach((socket) => {
          socket.leave(room);
          socket.data.room = undefined;
        });
        this.pongService.games.delete(room);
      }
    });
  }

  @SubscribeMessage('ready') // THIS FUNCTION LISTEN FOR "READY" MESSAGE FROM CLIENT AND SEND THE FIRST REFRESH IF EVERY USER IS READY
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
        for (let i = 0; i < game[1].length; i++) {
          if (game[1][i].ready === false) {
            return;
          }
        }
        console.log('LAUNCHING GAME AT ', Date.now());
        game[0].init();
        game[0].await = false;
        this.server.in(room).emit('refresh', game[0].getState(), Date.now());
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

  @SubscribeMessage('up')
  async registerUp(@ConnectedSocket() client: Socket): Promise<void | string> {
    const room = client.data.room;
    if (!this.checkUser(client, room)) {
      return 'You are not allowed to send this kind of message !';
    }
    const game = this.pongService.games.get(room)![0];
    if (!game) {
      return 'Game not launched';
    }
    game.movePlayer(client.data.position, true);
    this.server.in(room).emit('refresh', game.getState(), Date.now());
    return 'You moved up';
  }

  @SubscribeMessage('down')
  async registerDown(
    @ConnectedSocket() client: Socket,
  ): Promise<void | string> {
    const room = client.data.room;
    if (!this.checkUser(client, room)) {
      return 'You are not allowed to send this kind of message !';
    }
    const game = this.pongService.games.get(room)![0];
    if (!game) {
      return 'Game not launched';
    }
    game.movePlayer(client.data.position, false);
    this.server.in(room).emit('refresh', game.getState(), Date.now());
    return 'You moved down ';
  }

  @SubscribeMessage('subscribe_game')
  async subscribeGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() subscribedGameDto: SubscribedGameDto,
  ): Promise<GameEntityFront> {
    client.data.room = `game_${subscribedGameDto.id}`;
    const game = await this.pongService.getGame(subscribedGameDto.id);
    client.data.position = game.opponents.findIndex(
      (opponent) => opponent.user.id === client.data.id,
    );
    client.join(`game_${subscribedGameDto.id}`);
    return this.pongService.getGame(subscribedGameDto.id);
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
      gameQueue.forEach((user_loop) => {
        this.logger.log(`- ${user_loop.id} (${user_loop.name})`);
      });

      setTimeout(async () => {
        console.log('SENDING game_start at ', Date.now());
        const game = await this.pongService.startGame(gameQueue, this.server);
        this.server.emit(
          'game_start',
          instanceToPlain<GameStartPayload>({
            id: game.id,
            users: gameQueue,
          }),
        );
      }, 2000);
    }
  }

  @SubscribeMessage('leave_queue')
  async leaveQueue(@ConnectedSocket() client: Socket): Promise<void> {
    const user = await this.usersService.getById(client.data.id);
    if (!user) return;
    this.pongService.leave(user);
    this.logger.log(`'${user.id}' (${user.name}) has left queue`);
  }
}
