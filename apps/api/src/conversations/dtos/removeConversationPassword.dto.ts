import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class removeConversationPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
