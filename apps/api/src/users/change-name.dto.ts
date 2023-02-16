import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeNameDto {
  @IsNotEmpty()
  @IsString()
  new_username!: string;
}
