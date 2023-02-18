import { IsNotEmpty, IsUUID } from 'class-validator';

export class BlockUserDto {
  @IsUUID()
  @IsNotEmpty()
  targetId!: string;
}
