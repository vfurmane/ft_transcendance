import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendshipRequestStatus, Friendships as friendshipsEntity } from 'types';
import { User } from 'types';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(friendshipsEntity)
    private readonly friendshipsRepository: Repository<friendshipsEntity>,
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

    if ((targetFriend && targetFriend.accepted) || initiatorFriend) return false;
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

  async getFriendsList(
    currentUser: User,
  ): Promise<FriendshipRequestStatus[]> {
    const response: { friend: User | null; accept: boolean; ask: boolean }[] =
      [];

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

  async update(currentUser: User, target_id: string): Promise<boolean> {
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
      if (friendContract.accepted === true) return true;
      friendContract.accepted = true;
      this.friendshipsRepository.save(friendContract);
      return true;
    }

    return false;
  }
}
