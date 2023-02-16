import { IsNotEmpty, IsUUID } from 'class-validator';

export class SpiedUserDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}
