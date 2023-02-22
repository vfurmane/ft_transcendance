import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Max } from 'class-validator';
import sanitize from 'sanitize-html';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @Max(30)
  @Transform(({ value }) => sanitize(value))
  username!: string;

  @IsEmail()
  @Max(255)
  @Transform(({ value }) => sanitize(value))
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Max(72)
  password!: string;
}
