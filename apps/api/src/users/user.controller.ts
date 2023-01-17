import { Controller, Get, Query, UseGuards } from "@nestjs/common";
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
        console.log(`user_id : ${query.user_id}`);
        return this.usersService.getById(query.user_id);
    }
}
