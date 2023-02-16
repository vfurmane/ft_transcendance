import { UsersModule } from "src/users/users.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Achievements as AchievementsEntity } from "types";
import { AchievementsService } from "./Achievements.service";
import { AchievementsController } from "./Achivements.controller";

@Module({
    imports: [
      TypeOrmModule.forFeature([AchievementsEntity]),
      UsersModule,
    ],
    controllers: [AchievementsController],
    providers: [AchievementsService],
    exports: [AchievementsService],
  })
  export class AchievementsModule {}