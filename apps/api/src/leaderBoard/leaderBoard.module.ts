import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeaderBoardController } from "./leaderBoard.service";
import { LeaderBoardService } from "./leaderBoard.controller";
import { User } from "src/users/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [LeaderBoardController],
    providers: [LeaderBoardService],
    exports: [TypeOrmModule]
})
export class LeaderBoardModule{};