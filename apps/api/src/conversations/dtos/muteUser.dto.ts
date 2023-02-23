import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import sanitize from 'sanitize-html';

export class muteUserDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }) => sanitize(value))
  username!: string;
}
