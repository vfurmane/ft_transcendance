import { IsNotEmpty } from 'class-validator';

export class ChangeUserPasswordDto {
  @IsNotEmpty()
  password!: string;
}
