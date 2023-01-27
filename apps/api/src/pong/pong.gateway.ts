import { Server, Socket } from "socket.io"
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, ConnectedSocket, WebSocketServer } from "@nestjs/websockets";
//import { Game, Player } from "../../../web/pages/pong.tsx"
import { GameDto, RacketDto } from './pong.dto'
import { ClassSerializerInterceptor, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { UUIDVersion } from "class-validator";
import { arrayBuffer } from "stream/consumers";
import { Game } from "./game.service"
import { Interval } from "@nestjs/schedule";

@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
 @WebSocketGateway({namespace: "pong"})
 export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect  {
	@WebSocketServer() server !: Server;
	room_id !: string[];
	games !: Map<string, Game>; 

	constructor(private readonly authService : AuthService) {
	}

	async handleConnection(client: Socket)
	{
		console.log("SOMEBODY IS TRYING TO CONNECT")
		const currentUser = this.authService.verifyUserFromToken(
			client.handshake.auth.token,
		);
		if (!currentUser) {
			client.disconnect();
			console.log("no Authorization")
			return ;
		}
		client.data = { id: currentUser.sub, name: currentUser.name, room: undefined, position: -1 };
		// const checkSockets = await this.server.in(`user_${currentUser.sub}`).fetchSockets();
		// if (checkSockets.length != 0) {
		// 	client.disconnect();
		// 	console.log("THERE IS ALREADY A SOCKET OPEN FOR YOU");
		// 	return ;
		// }
		client.join(`user_${currentUser.sub}`);
		console.log("NEW CONNECTION!");
		console.log("YOU ARE " + currentUser.name);
		return 'Connection established';
	}

	async handleDisconnect(client: Socket) {
		if (client.data.room) {
			client.leave(client.data.room)
			console.log(client.data.name + " LEFT WAITING ROOM")
			const socketWaiting = await this.server.in(client.data.room).fetchSockets();
			if (socketWaiting.length === 0) {
				this.room_id.splice(this.room_id.indexOf(client.data.room), 1);
				console.log("REMOVED THE ROOM")
				console.log(this.room_id);
			} else {
				let i = 0;
				socketWaiting.forEach((socket) => socket.data.position = i++);
			}
		}
		console.log(client.data.name + " DISCONNECTED")
	}

	@Interval(100)
	refresh() {
		if (!this.games || this.games === undefined) {
			return ;
		}
		if (!this.room_id || this.room_id === undefined) {
			return ;
		}
		for (let room of this.room_id) {
			let game = this.games.get(room);
			if (!game) {
				return ;
			}
			game.updateGame();
			this.server.in(room).emit('refresh', { GameState : game.getState() });
		}
	}

	@SubscribeMessage('move')
	async	registerMove(@ConnectedSocket() client : Socket, dir : boolean) {
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
		const game = this.games.get(room);
		if (!game) {
			return 'Fatal error : No game !'
		}
		game.movePlayer(client.data.position, dir)
		this.server.in(room).emit('refresh', { GameState : game.getState()});
		return 'You moved ' + (dir ? 'up' : 'down')
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
			this.games.set(room, new Game(numberPlayer))
			return 'Launching the game for room ' + room;
		}
		return 'You are not player 1 !'
	}

	@SubscribeMessage('searchGame')
	async searchGame(@ConnectedSocket() client : Socket) {
		console.log("SOMEBODY IS SEARCHING FOR A GAME");
		const clientSockets = await this.server.in(`user_${client.data.id}`).fetchSockets()
		console.log(`YOU HAVE ${clientSockets.length} SOCKETS OPEN MY FRIEND`);
		let connectedSockets = clientSockets.filter((socket) => socket.data.room !== undefined)
		if (connectedSockets.length) return 'You are already in a room !'
		if (this.room_id?.length) {
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
						this.games.set(id, new Game(5))
						return 'Launched game for room ' + id;
					}
					return 'Joined room of id ' + id + ' at position ' + count;
				}
			}
			let num = (Number(this.room_id.at(-1)) + 1).toString();
			this.room_id.push(num);
			client.join(num);
			client.data.room = num;
			client.data.position = 0;
			return 'Created room of id ' + num;
		}
		this.room_id = ['0'];
		client.join('0');
		client.data.room = '0';
		client.data.position = 0;
		return 'Created the first ever room !'
	}
 }
