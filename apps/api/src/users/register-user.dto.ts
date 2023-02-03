import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import sanitize from 'sanitize-html';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  username!: string;

  @IsEmail()
  @Transform(({ value }) => sanitize(value))
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
