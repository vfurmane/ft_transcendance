import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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
  password!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  participants!: string[];
}
