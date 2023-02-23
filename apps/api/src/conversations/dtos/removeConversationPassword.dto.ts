import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class removeConversationPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  password!: string;
}
