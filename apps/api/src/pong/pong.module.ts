import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';
import { TransformUserModule } from 'src/TransformUser/TransformUser.module';

@Module({
  imports: [AuthModule, UsersModule, TransformUserModule],
  controllers: [],
  providers: [PongService, PongGateway],
})
export class PongModule {}
