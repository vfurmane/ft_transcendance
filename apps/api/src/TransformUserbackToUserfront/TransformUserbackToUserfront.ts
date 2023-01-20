<<<<<<< HEAD
import { User } from "types";
=======
import { User } from "src/users/user.entity";
>>>>>>> 6a17e2e9810b4e52016e6b8b06d278d95d2fc673

export interface Userfront {
    id: string,
    name: string,
    avatar_num: number,
    status: string,
    victory: number,
    defeat: number,
    rank : number,
    level: number
}

export class TransformUserbackToUserfront{
    constructor(

    ){}

    async #getVictoryNumber(user_id : string) : Promise<number>{
        return 1;
    }

    async #getDefeatNumber(user_id : string) : Promise<number>{
        return 1;
    }

    async #getRank(user_id : string) : Promise<number>{
        return 1;
    }

    transform(userBack : User) : Userfront {
        return ({
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