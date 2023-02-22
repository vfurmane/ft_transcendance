import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import sanitize from 'sanitize-html';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }) => sanitize(value))
  username!: string;

  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => sanitize(value))
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(72)
  password!: string;
}
