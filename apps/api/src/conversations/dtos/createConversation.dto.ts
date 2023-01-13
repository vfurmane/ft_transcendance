import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class createConversationDto {
    @IsOptional()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsBoolean()
    groupConversation!: boolean;

    @IsOptional()
    @IsString()
    password!:string

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', {each: true})
    participants!: string[];
}