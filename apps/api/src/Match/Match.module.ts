import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MatchController} from "./Match.controller";
import { MatchEntity } from "./Match.entity";
import { MatchService } from "./Match.service";
import { User } from "src/users/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity, User])],
    controllers: [MatchController],
    providers: [MatchService],
    exports: [TypeOrmModule]
})
export class MatchModule{};
