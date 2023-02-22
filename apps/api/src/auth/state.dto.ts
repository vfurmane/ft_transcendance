import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Max } from 'class-validator';

export class StateDto {
  @ApiProperty({
    description: 'The state of the authentication request.',
    example: '123abc',
  })
  @IsNotEmpty()
  @IsString()
  @Max(255)
  state!: string;
}
