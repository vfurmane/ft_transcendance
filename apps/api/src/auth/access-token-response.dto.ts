import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNzNjZGVhOC04YTI2LTQzNDgtOTZjOC0wZDUyZjMxZmEzZjciLCJuYW1lIjoibWFydmluIiwiaWF0IjoxNjcyMTU0NjY0LCJleHAiOjE2NzIxNTQ5NjR9.aniHzQMfL63GCruMkzvcqmR6ZxF5NjS4d4I2zgRM4-E',
  })
  access_token!: string;
}
