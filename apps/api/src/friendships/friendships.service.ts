import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransformUserService } from '../TransformUser/TransformUser.service';
import { Repository } from 'typeorm';
import {
  FriendshipRequestStatus,
  Friendships as friendshipsEntity,
} from 'types';
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

  async add(currentUser: User, target_id: string): Promise<boolean> {
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

    if ((targetFriend && targetFriend.accepted) || initiatorFriend)
      return false;
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
    return true;
  }

  async getFriendsList(currentUser: User): Promise<FriendshipRequestStatus[]> {
    const response: FriendshipRequestStatus[] = [];

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

    const res = initiatorArray.map(
      async (el): Promise<FriendshipRequestStatus> => {
        if (el.initiator.id === currentUser.id) {
          return {
            friend: await this.transformUserService.transform(el.target),
            accept: el.accepted,
            ask: true,
          };
        } else {
          return {
            friend: await this.transformUserService.transform(el.initiator),
            accept: el.accepted,
            ask: false,
          };
        }
      },
    );
    return Promise.all(res);
  }

  async delete(currentUser: User, userToDelete_id: string): Promise<boolean> {
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
      return true;
    }
    return false;
  }

  async update(currentUser: User, initiator_id: string): Promise<boolean> {
    const friendContract = await this.friendshipsRepository.findOne({
      where: {
        initiator: {
          id: initiator_id,
        },
        target: {
          id: currentUser.id,
        },
      },
    });
    if (friendContract) {
      if (friendContract.accepted === true) return true;
      friendContract.accepted = true;
      this.friendshipsRepository.save(friendContract);
      return true;
    }
    return false;
  }
}
