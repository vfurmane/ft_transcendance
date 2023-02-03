import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import sanitize from 'sanitize-html';

export class sendMessageDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  content!: string;
}
