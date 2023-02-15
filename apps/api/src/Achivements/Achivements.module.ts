import { UsersModule } from "src/users/users.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Achivements as AchivementsEntity } from "types";
import { AchivementsService } from "./Achivements.service";

@Module({
    imports: [
      TypeOrmModule.forFeature([AchivementsEntity]),
      UsersModule,
      UsersModule
    ],
    providers: [AchivementsService],
    exports: [AchivementsService],
  })
  export class AchivementsModule {}