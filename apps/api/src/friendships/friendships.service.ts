import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Friendships as friendshipsEntity } from "./frienships.entity";
import { User } from "src/users/user.entity";


@Injectable()
export class FriendshipsService {
    constructor (
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,
        @InjectRepository(friendshipsEntity)
        private readonly friendshipsRepository : Repository<friendshipsEntity>
    ) {}

    async add (initiator_id : string, target_id : string) : Promise<number> {


        const initiatorFriend = await this.friendshipsRepository.findBy({initiator_id : initiator_id});
        const targetFriend = await this.friendshipsRepository.findBy({target_id : initiator_id});
        if ((initiatorFriend).filter(e => e.target_id === target_id).length !== 0
            || targetFriend.filter(e => e.initiator_id === target_id).length !== 0)
            return 0;

        const newFriendship = new friendshipsEntity();
        newFriendship.initiator_id = initiator_id;
        newFriendship.target_id = target_id;
        newFriendship.accepted = false;

        this.friendshipsRepository.save(newFriendship);

        return 1;
    }

    async getFriendsList ( user_id : string ) : Promise<(User | null)[]> {

        let friendsList :  (User| null)[] = [];
        let ids : string[] = [];

        const initiatorArray = await this.friendshipsRepository.findBy({initiator_id : user_id});
        const targetArray = await this.friendshipsRepository.findBy({target_id : user_id});
        console.log(targetArray);
        
        initiatorArray.forEach(e => ids.push(e.target_id));
        targetArray.forEach(e => ids.push(e.initiator_id));

        const queryBuilder = this.userRepository?.createQueryBuilder().select('*');

        if (ids.length)
        {
            queryBuilder.where("id IN (:...Ids)", { Ids: ids});
            friendsList =  await queryBuilder.getRawMany();
        }
        else
        {
            friendsList = [];
        }
        
        

        //for debug :
        //const friendships =  await this.friendshipsRepository.find();
        //console.log(friendships);

        return friendsList;
    }

    async delete (user_id : string, userToDelete_id: string) : Promise<number>{

        const initiatorSide = await this.friendshipsRepository.findOneBy({initiator_id : user_id, target_id: userToDelete_id});
        if (initiatorSide)
        {
            console.log(`initside ${initiatorSide}`);
            this.friendshipsRepository.delete({id: initiatorSide.id});
            return 1;
        }
        else
        {
            const targetSide = await this.friendshipsRepository.findOneBy({target_id : user_id, initiator_id: userToDelete_id});
            if (targetSide)
            {
                console.log(`targetside ${targetSide.id}`);
                this.friendshipsRepository.delete({id: targetSide.id});
                return 1;
            }
            return 0;
        }
    }
}