import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class invitationDto {
  @IsNotEmpty()
  @IsUUID()
  target!: string;

  @IsOptional()
  @IsUUID()
  conversationID!: string;
}
