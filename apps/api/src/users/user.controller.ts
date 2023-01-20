import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from "types";
import { Userfront } from "src/TransformUser/TransformUser.service";


//@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
    constructor(
        private readonly usersService : UsersService,
    ) {}

    @Get()
    async getUser(@Query() query : {user_id: string}) : Promise<(Userfront | null)> {
        return this.usersService.getUser(query.user_id);
    }

    @Post('updateLevel')
    async updateLevel(@Body() body : {user_id: string, xp: number}) : Promise<number> {
        return this.usersService.updateLevel(body.user_id, body.xp);
    }
}
