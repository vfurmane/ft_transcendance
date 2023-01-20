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
		  client.data = { id: currentUser.sub, name: currentUser.name, isGaming: false };
		  client.join(`user_${currentUser.sub}`);
		  return 'Connection established';
	}

	@SubscribeMessage('startGame')
	async  startGame(@ConnectedSocket() client : Socket)
	{
		const clientSockets = await this.server.in(`user_${client.data.id}`).fetchSockets();
	}

	@SubscribeMessage('searchGame')
	async searchGame(@ConnectedSocket() client : Socket)
	{
		const clientSockets = await this.server.in(`user_${client.data.id}`).fetchSockets()
		clientSockets.filter((socket) => socket.data.isGaming === true)
		if (clientSockets.length) return 'You are already in a room !'
		this.server.in('game_room').emit("startGame", {})
		if (this.room_id) {
			for (let id of this.room_id) {
				let count = (await this.server.in(id).fetchSockets()).length 
				if (count < 5) {
					client.join(id);
					client.data.isGaming = true;
					client.data.number = count;
					if (count == 4) {
						(await this.server.in(id).fetchSockets()).forEach(element => {
							this.server.in(`user_${element.data.id}`).emit('startGame', { number_player: 5, position : element.data.number});
						});
					}
					return 'Joined room of id ' + id;
				}
			}
			let num = (Number(this.room_id.at(-1)) + 1).toString();
			this.room_id.push(num);
			client.join(num);
			client.data.isGaming = true;
			return 'Created room of id ' + num;
		}
		this.room_id = ['0'];
		client.join('0');
		client.data.isGaming = true;
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
