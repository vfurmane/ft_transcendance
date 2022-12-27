import { ApiProperty } from '@nestjs/swagger';

export class FtOauth2Dto {
  @ApiProperty({
    description: 'The authorization code',
  })
  code!: string;

  @ApiProperty({
    description: "The request's state",
  })
  state!: string;
}
