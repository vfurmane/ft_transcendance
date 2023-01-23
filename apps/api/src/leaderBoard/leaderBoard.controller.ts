import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TransformUserService, Userfront } from "src/TransformUser/TransformUser.service";
import { Repository } from "typeorm";
import { User } from "types";

@Injectable()
export class LeaderBoardService{
    constructor(
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,
        private readonly transfornService : TransformUserService
    ){}

    async getLeaderBoard () : Promise<Userfront[]>{
        let users = await this.userRepository.find();
        if (!users)
            throw new BadRequestException('users not found');
        let usersSort = users.sort( (a, b) => b.level - a.level);
        let res : Userfront[] = [];
        for (let i = 0; i < usersSort.length; i++)
            res.push(await this.transfornService.transform(usersSort[i]));
        return res;
    }

}