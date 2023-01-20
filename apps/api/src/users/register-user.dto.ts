import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
