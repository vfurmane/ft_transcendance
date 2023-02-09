import { Injectable } from '@nestjs/common';
import { GameMode, User } from 'types';

export type QueueList = User[];
export type QueuesMap = { [key in GameMode]: QueueList };

@Injectable()
export class MatchmakingService {
  queues: QueuesMap = {} as QueuesMap;

  constructor() {
    for (const mode in GameMode) {
      this.queues[GameMode[mode as keyof typeof GameMode]] = [];
    }
  }

  getGameModeQueue(mode: GameMode): QueueList {
    return this.queues[GameMode[mode as string as keyof typeof GameMode]];
  }

  userIsInQueue(user: User, mode?: GameMode): GameMode | null {
    if (mode) return this.getGameModeQueue(mode).includes(user) ? mode : null;
    for (const mode in GameMode) {
      if (this.getGameModeQueue(mode as GameMode).includes(user))
        return mode as GameMode;
    }
    return null;
  }

  join(user: User, mode: GameMode): void {
    if (this.userIsInQueue(user)) return;
    this.getGameModeQueue(mode).push(user);
  }

  setGameModeQueue(new_queue: QueueList, mode: GameMode): void {
    this.queues[mode] = new_queue;
  }

  leave(user: User): void {
    const mode = this.userIsInQueue(user);
    if (!mode) return;
    const new_queue = this.getGameModeQueue(mode).filter(
      (e) => e.id !== user.id,
    );
    this.setGameModeQueue(new_queue, mode);
  }
}
