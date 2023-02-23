import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import sanitize from 'sanitize-html';

export class ChangeNameDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }) => sanitize(value))
  new_username!: string;
}
