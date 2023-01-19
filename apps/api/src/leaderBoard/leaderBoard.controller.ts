import { Injectable } from "@nestjs/common";
import { Userfront } from "src/TransformUserbackToUserfront/TransformUserbackToUserfront";

@Injectable()
export class LeaderBoardService{
    constructor(

    ){}

    async getLeaderBoard () : Promise<Userfront>{
        return({
            id:'',
            name:'',
            avatar_num: 1,
            status:'',
            victory: 0,
            defeat:0,
            rank: 0,
            level: 0
        });
    }

}