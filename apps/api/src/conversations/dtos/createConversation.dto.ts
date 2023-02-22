import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
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
  @Max(72)
  password!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  participants!: string[];
}
