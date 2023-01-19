import { Controller, Get, Post, Body, Query } from '@nestjs/common'

@Controller('pong')
export class PongController {
	contructor(private pongService: PongService) {}
}
