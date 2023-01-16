import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class muteUserDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsString()
  username!: string;
}
