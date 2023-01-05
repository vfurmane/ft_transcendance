import { Module} from "@nestjs/common";
import { FriendshipsController } from "./friendships.controller";
import { FriendshipsService } from "./friendships.service";
import { Friendships as FriendshipsEntity } from "./frienships.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([FriendshipsEntity, User])],
    controllers: [FriendshipsController],
    providers: [FriendshipsService],
    exports: [TypeOrmModule],
})
export class FriendshipsModule {};