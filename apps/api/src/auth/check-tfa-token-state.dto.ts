import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckTfaTokenStateDto {
  @ApiProperty({
    description: 'The state of the authentication request.',
    example: '123abc',
  })
  @IsNotEmpty()
  @IsString()
  state!: string;

  @ApiProperty({
    description: 'The OTP token.',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  token!: string;
}
