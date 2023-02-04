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

	games !: Map<string, [Game, Array<string>]>; 

	constructor(private readonly authService : AuthService) {
		this.room_id = [];
		this.games = new Map();
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
		client.join(`user_${currentUser.sub}`);
		console.log("NEW CONNECTION!");
		console.log("YOU ARE " + currentUser.name + " OF ID " + client.data.id);
		if (this.games) {
			this.games.forEach((value, key) => {
				value[1].forEach(id => {
					if (id === client.data.id) {
						client.data.room = key;
						client.data.position = value[1].indexOf(id);
						client.join(key);
						console.log("Reconnected to the game !")
						return 'Connection restored'
					}
				});
			})
		}
		return 'Connection established';
	}

	async handleDisconnect(client: Socket) {
		if (!client.data.room) {
			console.log(client.data.name + " WAS NOT IN A ROOM")
			return ;
		}
		if (!this.room_id.includes(client.data.room)) {
			console.log(client.data.name + " IS CURRENTLY GAMING")
			return ;
		}
		client.leave(client.data.room)
		console.log(client.data.name + " LEFT WAITING ROOM")
		const socketWaiting = await this.server.in(client.data.room).fetchSockets();
		if (socketWaiting.length === 0) {
			this.room_id.splice(this.room_id.indexOf(client.data.room), 1);
			console.log("REMOVED THE ROOM"  )
			console.log(this.room_id);
		} else {
			let i = 0;
			socketWaiting.forEach((socket) => socket.data.position = i++);
		}
		console.log(client.data.name + " DISCONNECTED")
	}

	@Interval(17)
	update() {
		if (!this.games || this.games === undefined) {
			return ;
		}
		this.games.forEach(async (key, room) => {
			let game = key[0];
			if (game.boardType !== 0) {
				game.updateGame();
			} else {
				const sockets = await this.server.in(room).fetchSockets();
				this.server.in(room).emit('endGame');
				sockets.forEach((socket) => {
					socket.leave(room);
					socket.data.room = undefined;
				})
				this.games.delete(room);
			}
		})
	}

	@Interval(1000)
	refresh() {
		if (!this.games || this.games === undefined) {
			return ;
		}
		this.games.forEach(async (key, room) => {
			let game = key[0];
			if (game.boardType !== 0) {
				let state = game.getState();
				console.log("=-=-=-=-=-= REFRESHING =-=-=-=-=-= |" + Date.now())
				this.server.in(room).emit('refresh', state, Date.now());
			}
		});
	}

	checkUser (client : Socket, room : any) {
		if (room === undefined) { // not in any room
			console.log("no room")
			return false;
		} else if (client.data.position === -1) { // is not a player (spectate)
			console.log("no position : " + client.data.position)
			return false;
		}
		return true;
	}

	@SubscribeMessage('up')
	async	registerUp(@ConnectedSocket() client : Socket) {
		const room = client.data.room;
		if (!this.checkUser(client, room)) {
			return 'You are not allowed to send this kind of message !'
		}
		const game = (this.games.get(room))![0];
		if (!game) {
			return 'Game not launched'
		}
		game.movePlayer(client.data.position, true)
		this.server.in(room).emit('refresh', game.getState(), Date.now());
		return 'You moved up'
	}

	@SubscribeMessage('down')
	async	registerDown(@ConnectedSocket() client : Socket) {
		const room = client.data.room;
		if (!this.checkUser(client, room)) {
			return 'You are not allowed to send this kind of message !'
		}
		const game = (this.games.get(room))![0];
		if (!game) {
			return 'Game not launched'
		}
		game.movePlayer(client.data.position, false)
		this.server.in(room).emit('refresh', game.getState(), Date.now());
		return 'You moved down'
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
			let list:Array<string> = [];
			(await this.server.in(room).fetchSockets()).forEach(element => {
				list.push(element.data.id);
				this.server.in(`user_${element.data.id}`).emit('startGame', { number_player: numberPlayer, position : element.data.position});
			});
			this.games.set(room, [new Game(numberPlayer), list])
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
			for (let room of this.room_id) {
				let count = (await this.server.in(room).fetchSockets()).length 
				if (count < 6) {
					client.join(room);
					client.data.room = room;
					client.data.position = count;
					console.log(count)
					if (count === 1) { // CHANGE BACK TO 5 PLEASE
						let list:Array<string> = [];
						(await this.server.in(room).fetchSockets()).forEach(element => {
							list.push(element.data.id);
							this.server.in(`user_${element.data.id}`).emit('startGame', { number_player: count + 1, position : element.data.position});
						});
						this.games.set(room, [new Game(2), list])
						this.room_id.splice(this.room_id.indexOf(room), 1);
						return 'Launched game for room ' + room;
					}
					return 'Joined room of id ' + room + ' at position ' + count;
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
