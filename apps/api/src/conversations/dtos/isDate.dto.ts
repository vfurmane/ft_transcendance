import { IsDateString, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class isDateDto
{
    @IsNotEmpty()
    @IsDateString()
    date!: Date;
}