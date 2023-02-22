import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class StateDto {
  @ApiProperty({
    description: 'The state of the authentication request.',
    example: '123abc',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  state!: string;
}
