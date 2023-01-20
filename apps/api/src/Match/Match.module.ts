import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MatchController} from "./Match.controller";
import { MatchService } from "./Match.service";
import { User, Match } from "types";
import { UsersService } from "../users/users.service";
import { TransformUserService } from "src/TransformUser/TransformUser.service";

@Module({
    imports: [TypeOrmModule.forFeature([Match, User])],
    controllers: [MatchController],
    providers: [MatchService , UsersService, TransformUserService],
    exports: [TypeOrmModule]
})
export class MatchModule {}
