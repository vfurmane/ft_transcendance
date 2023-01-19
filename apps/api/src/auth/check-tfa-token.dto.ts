import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckTfaTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The OTP token', example: '123456' })
  token!: string;
}
