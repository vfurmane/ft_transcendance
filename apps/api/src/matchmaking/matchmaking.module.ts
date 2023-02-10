import { Logger, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { MatchmakingGateway } from './matchmaking.gateway';
import { MatchmakingService } from './matchmaking.service';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [Logger, MatchmakingService, MatchmakingGateway],
})
export class MatchmakingModule {}
