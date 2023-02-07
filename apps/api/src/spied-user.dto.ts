import { IsNotEmpty, IsString } from 'class-validator';

export class SpiedUserDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
