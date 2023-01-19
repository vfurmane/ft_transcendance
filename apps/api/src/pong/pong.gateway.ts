import { Server, Socket } from "socket.io"
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse } from "@nestjs/websockets";

 @WebSocketGateway(8080)
 export class PongGateway {

	 constructor(private client:Client[], private room_id:string) {
		 this.game = new Game();
	 }

	 @Interval(8)
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
	 }
 }
