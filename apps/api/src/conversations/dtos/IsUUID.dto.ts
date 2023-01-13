import { IsNotEmpty, IsUUID } from "class-validator";

export class isUUIDDto
{

    @IsNotEmpty()
    @IsUUID()
    id!: string
}