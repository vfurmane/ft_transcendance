import { IsNotEmpty } from 'class-validator';

export class InviteUserDto {
  @IsNotEmpty()
  id!: string;
}
