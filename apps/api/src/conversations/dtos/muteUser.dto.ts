import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import sanitize from 'sanitize-html';

export class muteUserDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  username!: string;
}
