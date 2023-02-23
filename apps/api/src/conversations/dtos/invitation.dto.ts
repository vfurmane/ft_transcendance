import { IsEnum, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class invitationDto {
  @IsNotEmpty()
  @IsUUID()
  @MaxLength(30)
  target!: string;

  @IsOptional()
  @IsUUID()
  conversationID!: string;
}
