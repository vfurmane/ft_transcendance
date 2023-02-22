import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import sanitize from 'sanitize-html';

export class createConversationDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  name!: string;

  @IsNotEmpty()
  @IsBoolean()
  groupConversation!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsUUID()
  participant!: string;

  @IsOptional()
  @IsBoolean()
  visible!: boolean;
}
