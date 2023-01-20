import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TransformUserService,
  Userfront,
} from 'src/TransformUser/TransformUser.service';
import { Repository } from 'typeorm';
import { Friendships as friendshipsEntity } from 'types';
import { User } from 'types';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(friendshipsEntity)
    private readonly friendshipsRepository: Repository<friendshipsEntity>,
    private readonly transformUserService: TransformUserService,
  ) {}

  async add(currentUser: User, target_id: string): Promise<number> {
    const initiatorFriend = await this.friendshipsRepository.findOne({
      where: {
        initiator: {
          id: currentUser.id,
        },
        target: {
          id: target_id,
        },
      },
    });
    const targetFriend = await this.friendshipsRepository.findOne({
      where: {
        initiator: {
          id: target_id,
        },
        target: {
          id: currentUser.id,
        },
      },
    });

    if ((targetFriend && targetFriend.accepted) || initiatorFriend) return 0;
    const target = await this.userRepository.findOne({
      where: {
        id: target_id,
      },
    });
    if (!target) throw new NotFoundException('Unknown user');
    if (targetFriend) return this.update(target, currentUser.id);
    const newFriendship = new friendshipsEntity();
    newFriendship.initiator = currentUser;
    newFriendship.target = target;
    this.friendshipsRepository.save(newFriendship);
    return 1;
  }

  async getFriendsList(
    user_id: string,
  ): Promise<{ friend: Userfront | null; accept: boolean; ask: boolean }[]> {
    let friendsList: (User | null)[] = [];
    const ids: string[] = [];
    const response: {
      friend: Userfront | null;
      accept: boolean;
      ask: boolean;
    }[] = [];
    
    const initiatorArray = await this.friendshipsRepository.find({
      where: [
        {
          initiator: {
            id: currentUser.id,
          },
        },
        {
          target: {
            id: currentUser.id,
          },
        },
      ],
    });
    initiatorArray.forEach((e): void => {
      if (e.initiator.id === currentUser.id)
        response.push({ friend: e.target, accept: e.accepted, ask: true });
      else
        response.push({ friend: e.initiator, accept: e.accepted, ask: false });
    });
    return response;
  }

  async delete(currentUser: User, userToDelete_id: string): Promise<number> {
    const friendship = await this.friendshipsRepository.findOne({
      where: [
        {
          initiator: {
            id: currentUser.id,
          },
          target: {
            id: userToDelete_id,
          },
        },
        {
          initiator: {
            id: userToDelete_id,
          },
          target: {
            id: currentUser.id,
          },
        },
      ],
    });
    if (friendship) {
      this.friendshipsRepository.remove(friendship);
      return 1;
    }
    return 0;
  }

  async update(currentUser: User, target_id: string): Promise<number> {
    const friendContract = await this.friendshipsRepository.findOne({
      where: {
        initiator: {
          id: currentUser.id,
        },
        target: {
          id: target_id,
        },
      },
    });
    if (friendContract) {
      if (friendContract.accepted === true) return 1;
      friendContract.accepted = true;
      this.friendshipsRepository.save(friendContract);
      return 1;
    }

    return 0;
  }
}
