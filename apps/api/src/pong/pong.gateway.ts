import { Server, Socket } from "socket.io"
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, ConnectedSocket, WebSocketServer } from "@nestjs/websockets";
//import { Game, Player } from "../../../web/pages/pong.tsx"
import { GameDto, RacketDto } from './pong.dto'
import { ClassSerializerInterceptor, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { UUIDVersion } from "class-validator";
import { arrayBuffer } from "stream/consumers";

@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
 @WebSocketGateway({namespace: "pong"})
 export class PongGateway implements OnGatewayConnection  {
	@WebSocketServer() server !: Server;
	room_id !: string[];
	//  private game: Game;

	constructor(private readonly authService : AuthService) {
	}

	async handleConnection(client: Socket)
	{
		if (!client.handshake.headers?.authorization) {
			client.disconnect();
			return;
		  }
		  const currentUser = this.authService.verifyUserFromToken(
			client.handshake.headers.authorization,
		  );
		  if (!currentUser) {
			client.disconnect();
			return;
		  }
		  client.data = { id: currentUser.sub, name: currentUser.name, room: undefined, position: -1 };
		  client.join(`user_${currentUser.sub}`);
		  return 'Connection established';
	}

	@SubscribeMessage('move')
	async	registerMove(@ConnectedSocket() client : Socket) {
		const clientSockets = await this.server.in(`user_${client.data.id}`).fetchSockets();
		const room = client.data.room;
		if (room === undefined)
			return 'You are not in a room'
		if (this.room_id.indexOf(room) === -1) {
			client.data.room = undefined
			return 'Your room doesnt exist !'
		}
		if (client.data.position === -1) {
			return 'You are not a player !'
		}
	}

	@SubscribeMessage('startGame')
	async  startGame(@ConnectedSocket() client : Socket) {
		const clientSockets = await this.server.in(`user_${client.data.id}`).fetchSockets();
		const room = client.data.room;
		if (room === undefined)
			return 'You are not in a room'
		if (this.room_id.indexOf(room) === -1) {
			client.data.room = undefined
			return 'Your room doesnt exist !'
		}
		if (client.data.position === 0) {
			let numberPlayer = (await this.server.in(room).fetchSockets()).length;
			(await this.server.in(room).fetchSockets()).forEach(element => {
				this.server.in(`user_${element.data.id}`).emit('startGame', { number_player: numberPlayer, position : element.data.position});
			});
			return 'Launching the game for room ' + room;
		}
		return 'You are not player 1 !'
	}

	@SubscribeMessage('searchGame')
	async searchGame(@ConnectedSocket() client : Socket) {
		const clientSockets = await this.server.in(`user_${client.data.id}`).fetchSockets()
		clientSockets.filter((socket) => socket.data.isGaming !== undefined)
		if (clientSockets.length) return 'You are already in a room !'
		if (this.room_id) {
			for (let id of this.room_id) {
				let count = (await this.server.in(id).fetchSockets()).length 
				if (count < 5) {
					client.join(id);
					client.data.room = id;
					client.data.position = count;
					if (count == 4) {
						(await this.server.in(id).fetchSockets()).forEach(element => {
							this.server.in(`user_${element.data.id}`).emit('startGame', { number_player: 5, position : element.data.position});
						});
						return 'Launched game for room ' + id;
					}
					return 'Joined room of id ' + id;
				}
			}
			let num = (Number(this.room_id.at(-1)) + 1).toString();
			this.room_id.push(num);
			client.join(num);
			client.data.room = num;
			return 'Created room of id ' + num;
		}
		this.room_id = ['0'];
		client.join('0');
		client.data.room = '0';
		return 'Created the first ever room !'
	}



/*
	 updateGame() : void {
		 let game : GameDto;
		 game.player = this.game.player
		io.in(this.room_id).emit('update', {game});
	 }

	 @SubscribeMessage('move')
	 async move(@MessageBody() data: RacketDto, @ConnectedSocket() socket: Socket) {
		 if (socket.rooms.has(this.room_id + '/player')) {
			 this.updateGame(data); //data is the key pressed (either up/true or down/false
		 } else {
			 throw new WsException('Sender is not a player');
		 }
	 }*/
 }
