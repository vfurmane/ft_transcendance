import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class updateConversationPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  confirmationPassword!: string;
}
