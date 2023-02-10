import { Injectable } from '@nestjs/common';
import { GameMode, User } from 'types';

export type QueueList = User[];
export type QueuesMap = { [key in GameMode]: QueueList };
export type GameModeDetails = { maxPlayersNumber: number };

@Injectable()
export class MatchmakingService {
  queues: QueuesMap = {} as QueuesMap;

  static gameModes: { [key in GameMode]: GameModeDetails } = {
    CLASSIC: { maxPlayersNumber: 2 },
    BATTLE_ROYALE: { maxPlayersNumber: 6 },
  };

  constructor() {
    for (const mode in GameMode) {
      this.queues[GameMode[mode as keyof typeof GameMode]] = [];
    }
  }

  static getGameModeDetails(mode: GameMode): GameModeDetails {
    return MatchmakingService.gameModes[
      GameMode[mode as string as keyof typeof GameMode]
    ];
  }

  getGameModeQueue(mode: GameMode): QueueList {
    return this.queues[GameMode[mode as string as keyof typeof GameMode]];
  }

  userIsInQueue(user: User, mode?: GameMode): GameMode | null {
    if (mode)
      return this.getGameModeQueue(mode).find(
        (queue_user) => queue_user.id === user.id,
      )
        ? mode
        : null;
    for (const mode in GameMode) {
      if (this.userIsInQueue(user, mode as GameMode)) return mode as GameMode;
    }
    return null;
  }

  queueIsFull(mode: GameMode): boolean {
    return (
      this.getGameModeQueue(mode).length >=
      MatchmakingService.getGameModeDetails(mode).maxPlayersNumber
    );
  }

  getFirstGameModeQueue(mode: GameMode): QueueList {
    const gameQueue: QueueList = [];
    this.getGameModeQueue(mode).forEach((user, i) => {
      if (i < MatchmakingService.getGameModeDetails(mode).maxPlayersNumber)
        gameQueue.push(user);
    });
    return gameQueue;
  }

  join(user: User, mode: GameMode): QueueList | null {
    if (this.userIsInQueue(user)) return null;
    this.getGameModeQueue(mode).push(user);
    if (this.queueIsFull(mode)) return this.getFirstGameModeQueue(mode);
    return null;
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
