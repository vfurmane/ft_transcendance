import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class addConversationPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  confirmationPassword!: string;
}
