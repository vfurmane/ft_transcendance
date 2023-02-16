import { IsNotEmpty, IsUUID } from 'class-validator';

export class SubscribedGameDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}
