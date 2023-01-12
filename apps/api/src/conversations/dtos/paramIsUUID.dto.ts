import { IsNotEmpty, IsUUID } from "class-validator";

export class paramIsUUIDDto
{

    @IsNotEmpty()
    @IsUUID()
    id!: string
}