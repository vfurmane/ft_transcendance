import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class matchAddDto {
  @IsNotEmpty()
  @IsUUID()
  winner_id!: string;

  @IsNotEmpty()
  @IsUUID()
  looser_id!: string;

  @IsNotEmpty()
  @IsNumber()
  score_winner!: number;

  @IsNotEmpty()
  @IsNumber()
  score_looser!: number;
}
