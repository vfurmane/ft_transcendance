import { Controller, Post, Delete, Body, Get, Query, UseGuards } from "@nestjs/common";
import { FriendshipsService } from "./friendships.service";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from "src/users/user.entity";

@UseGuards(JwtAuthGuard)
@Controller('friendships')
export class FriendshipsController {
    constructor(
        private readonly fiendshipsService : FriendshipsService
    ) {}

    @Post()
    async add (@Body() body : {initiator_id: string, target_id: string}) : Promise<number> {
        return this.fiendshipsService.add(body.initiator_id, body.target_id);
    }

    @Get()
    async getFriendsList(@Query() query : {user_id: string}) : Promise<(User | null)[]> {
        return this.fiendshipsService.getFriendsList(query.user_id);
    }

    @Delete()
    async delete (@Body() body : {user_id: string,  userToDelete_id: string}) : Promise<number> {
        return this.fiendshipsService.delete(body.user_id, body.userToDelete_id);
    }
}
