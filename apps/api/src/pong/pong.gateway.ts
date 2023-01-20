import { Server, Socket } from "socket.io"
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, ConnectedSocket } from "@nestjs/websockets";
//import { Game, Player } from "../../../web/pages/pong.tsx"
import { GameDto, RacketDto } from './pong.dto'

 @WebSocketGateway()
 export class PongGateway  {
	//  private game: Game;

//	 constructor(private client:Player[], private room_id:string) {
//		 this.game = new Game();
//	 }
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
