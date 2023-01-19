import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MatchController} from "./Match.controller";
<<<<<<< HEAD
import { MatchService } from "./Match.service";
import { User, Match } from "types";
import { UsersService } from "../users/users.service";

@Module({
    imports: [TypeOrmModule.forFeature([Match, User])],
    controllers: [MatchController],
    providers: [MatchService , UsersService],
=======
import { MatchEntity } from "./Match.entity";
import { MatchService } from "./Match.service";
import { User } from "src/users/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity, User])],
    controllers: [MatchController],
    providers: [MatchService],
>>>>>>> 6a17e2e (game data first commit)
    exports: [TypeOrmModule]
})
export class MatchModule{};
