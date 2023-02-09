import { Logger, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { MatchmakingGateway } from './matchmaking.gateway';
import { MatchmakingService } from './matchmaking.service';

@Module({
  imports: [UsersModule],
  providers: [Logger, MatchmakingService, MatchmakingGateway],
})
export class MatchmakingModule {}
