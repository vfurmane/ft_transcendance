import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ConversationRoleEnum } from '../conversationRole.enum';

export class updateRoleDto {
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @IsNotEmpty()
  @IsEnum(ConversationRoleEnum)
  newRole!: string;
}
