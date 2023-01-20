import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MatchController} from "./Match.controller";
import { MatchService } from "./Match.service";
import { User, Match } from "types";
import { UsersService } from "../users/users.service";

@Module({
    imports: [TypeOrmModule.forFeature([Match, User])],
    controllers: [MatchController],
    providers: [MatchService , UsersService],
    exports: [TypeOrmModule]
})
export class MatchModule{};
