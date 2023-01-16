import { IsDateString, IsNotEmpty } from 'class-validator';

export class isDateDto {
  @IsNotEmpty()
  @IsDateString()
  date!: Date;
}
