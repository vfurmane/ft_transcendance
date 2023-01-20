import { IsNotEmpty, IsString } from 'class-validator';

export class sendMessageDto {
  @IsNotEmpty()
  @IsString()
  content!: string;
}
