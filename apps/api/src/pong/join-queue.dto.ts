import { IsEnum, IsNotEmpty } from 'class-validator';
import { GameMode } from 'types';

export class JoinQueueDto {
  @IsNotEmpty()
  @IsEnum(GameMode)
  game_mode!: GameMode;
}
