import { Module } from '@nestjs/common';
import { PongGateway } from 'dist/pong/pong.gateway';
import { PongService } from './pong.service';

@Module({
	imports: [],
	controllers: [],
	providers: [ PongService, PongGateway ],
})
export class PongModule {}
