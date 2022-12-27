import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckTfaTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The OTP token', example: '123456' })
  token!: string;
}
