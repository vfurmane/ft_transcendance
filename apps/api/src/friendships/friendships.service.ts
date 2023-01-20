import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TransformUserService, Userfront } from "src/TransformUser/TransformUser.service";
import { Repository } from "typeorm";
import { Friendships as friendshipsEntity } from 'types';
import { User } from "types";


@Injectable()
export class FriendshipsService {
    constructor (
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,
        @InjectRepository(friendshipsEntity)
        private readonly friendshipsRepository : Repository<friendshipsEntity>,
        private readonly transformUserService : TransformUserService,
    ) {}

    async add (initiator_id : string, target_id : string) : Promise<number> {


        const initiatorFriend = await this.friendshipsRepository.findBy({initiator_id : initiator_id});
        const targetFriend = await this.friendshipsRepository.findBy({target_id : initiator_id});

        const targetAlreadyAsk = targetFriend.filter(e => e.initiator_id === target_id);
        const userAlreadyAsk = (initiatorFriend).filter(e => e.target_id === target_id);

        if ((targetAlreadyAsk.length !== 0 && targetAlreadyAsk[0].accepted) || (userAlreadyAsk.length !== 0))
            return 0;
        else if (targetAlreadyAsk.length !== 0)
            return this.update(target_id, initiator_id);

        const newFriendship = new friendshipsEntity();
        newFriendship.initiator_id = initiator_id;
        newFriendship.target_id = target_id;
        newFriendship.accepted = false;

        await this.friendshipsRepository.save(newFriendship);

        return 1;
    }

    async getFriendsList ( user_id : string ) : Promise<{friend : Userfront | null , accept: boolean, ask: boolean}[]> {

        let friendsList :  (User| null)[] = [];
        let ids : string[] = [];
        let response : {friend : Userfront | null , accept: boolean, ask: boolean}[] = [];

        const initiatorArray = await this.friendshipsRepository.findBy({initiator_id : user_id});
        const targetArray = await this.friendshipsRepository.findBy({target_id : user_id});
        
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

        for (let i = 0; i < initiatorArray.length; i++)
        {
            response.push({
                friend: await this.transformUserService.transform(friendsList.filter(el => el?.id === initiatorArray[i].target_id)[0]),
                accept: initiatorArray[i].accepted, 
                ask: true
            });
            i++;
        }

        for (let i = 0; i < targetArray.length; i++)
        {
            response.push({
                friend: await this.transformUserService.transform(friendsList.filter(el => el?.id === targetArray[i].initiator_id)[0]),
                accept: targetArray[i].accepted, 
                ask: false
            });
            i++;
        }
        
        //for debug :
        //const friendships =  await this.friendshipsRepository.find();
        //console.log(friendships);

        return response;
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

    async update (initiator_id: string, target_id: string ) : Promise<number> {
        
        const friendContract = await this.friendshipsRepository.findOneBy({initiator_id: initiator_id, target_id : target_id});
        const queryBuilder = this.friendshipsRepository.createQueryBuilder().select('*');
        queryBuilder.update().set({accepted: true}).where("id =  :id", {id: friendContract?.id}).execute();

        //debug
        //const friendships =  await this.friendshipsRepository.find();
        //console.log(friendships);

        return (1);
    }
}