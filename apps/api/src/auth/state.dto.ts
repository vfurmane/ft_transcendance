import { ApiProperty } from '@nestjs/swagger';

export class StateDto {
  @ApiProperty({
    description: 'The state of the authentication request.',
    example: '123abc',
  })
  state!: string;
}
