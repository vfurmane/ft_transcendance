import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SpeakeasyGeneratedSecretDto {
  @ApiProperty({ example: 'Z8Pr9:*o*9L&r[C<>[16adAmWMqNO67L' })
  ascii!: string;

  @ApiProperty({
    example: 'LI4FA4RZHIVG6KRZJQTHEW2DHQ7FWMJWMFSEC3KXJVYU4TZWG5GA',
  })
  base32!: string;

  @ApiProperty({
    example: '5a385072393a2a6f2a394c26725b433c3e5b31366164416d574d714e4f36374c',
  })
  hex!: string;

  @ApiPropertyOptional({
    example:
      'otpauth://totp/SecretKey?secret=LI4FA4RZHIVG6KRZJQTHEW2DHQ7FWMJWMFSEC3KXJVYU4TZWG5GA',
    type: String,
  })
  otpauth_url?: string | undefined;
}
