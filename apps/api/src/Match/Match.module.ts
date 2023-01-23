<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MatchController} from "./Match.controller";
<<<<<<< HEAD
import { MatchService } from "./Match.service";
import { User, Match } from "types";
import { UsersService } from "../users/users.service";
import { TransformUserService } from "src/TransformUser/TransformUser.service";

@Module({
    imports: [TypeOrmModule.forFeature([Match, User])],
    controllers: [MatchController],
<<<<<<< HEAD
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
=======
    providers: [MatchService , UsersService, TransformUserService],
>>>>>>> 7591658 (transform userBack to userFront)
    exports: [TypeOrmModule]
=======
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchController } from './Match.controller';
import { MatchService } from './Match.service';
import { User, Match } from 'types';
import { UsersService } from '../users/users.service';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match, User])],
  controllers: [MatchController],
  providers: [MatchService, UsersService, TransformUserService],
  exports: [TypeOrmModule],
>>>>>>> d219be5 (match, gamedata and leaderboard fix)
})
export class MatchModule {}
