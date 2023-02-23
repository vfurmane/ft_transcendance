import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class updateConversationPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  oldPassword!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  confirmationPassword!: string;
}
