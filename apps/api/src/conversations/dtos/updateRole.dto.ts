import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ConversationRoleEnum } from 'types';

export class updateRoleDto {
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @IsNotEmpty()
  @IsEnum(ConversationRoleEnum)
  newRole!: string;
}
