import { IsEnum, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class invitationDto {
  @IsNotEmpty()
  @IsUUID()
  target!: string;

  @IsOptional()
  @IsUUID()
  conversationID!: string;
}
