import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import sanitize from 'sanitize-html';

export class CheckTfaTokenStateDto {
  @ApiProperty({
    description: 'The state of the authentication request.',
    example: '123abc',
  })
  @IsNotEmpty()
  @IsString()
  @Transform((value) => sanitize(value as any))
  state!: string;

  @ApiProperty({
    description: 'The OTP token.',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  token!: string;
}
