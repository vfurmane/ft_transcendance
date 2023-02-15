import { IsUUID, IsNotEmpty } from 'class-validator';

export class InviteUserDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}
