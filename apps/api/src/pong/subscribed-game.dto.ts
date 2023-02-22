import { IsNotEmpty, IsUUID } from 'class-validator';

export class SubscribedGameDto {
  @IsNotEmpty()
  id!: string;
}
