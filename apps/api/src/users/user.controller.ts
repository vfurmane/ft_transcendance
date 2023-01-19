import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from "src/users/user.entity";

//@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
    constructor(
        private readonly usersService : UsersService
    ) {}

    @Get()
    async getFriendsList(@Query() query : {user_id: string}) : Promise<(User | null)> {
        return this.usersService.getById(query.user_id);
    }

    @Post()
    async updateLevel(@Body() body : {user_id: string, xp: number}) : Promise<number> {
        return this.usersService.updateLevel(body.user_id, body.xp);
    }
}
