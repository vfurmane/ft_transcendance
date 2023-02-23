import { IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class addConversationPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(29)
  @MinLength(1)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(29)
  @MinLength(1)
  confirmationPassword!: string;
}
