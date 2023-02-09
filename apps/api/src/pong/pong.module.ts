import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [],
  providers: [PongService, PongGateway],
})
export class PongModule {}
