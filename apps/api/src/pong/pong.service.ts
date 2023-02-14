import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';
import { Repository } from 'typeorm';
import {
  Game as GameEntity,
  GameEntityFront,
  GameMode,
  Opponent,
  User,
} from 'types';
import { Game } from './game.service';

export type QueueList = User[];
export type QueuesMap = { [key in GameMode]: QueueList };
export type GameModeDetails = { maxPlayersNumber: number };

@Injectable()
export class PongService {
  games!: Map<string, [Game, Array<{ id: string; ready: boolean }>]>;

  queues: QueuesMap = {} as QueuesMap;

  static gameModes: { [key in GameMode]: GameModeDetails } = {
    CLASSIC: { maxPlayersNumber: 2 },
    BATTLE_ROYALE: { maxPlayersNumber: 6 },
  };

  constructor(
    @InjectRepository(GameEntity)
    private readonly gamesRepository: Repository<GameEntity>,
    @InjectRepository(Opponent)
    private readonly opponentsRepository: Repository<Opponent>,
    private readonly transformUserService: TransformUserService,
  ) {
    this.games = new Map();
    for (const mode in GameMode) {
      this.queues[GameMode[mode as keyof typeof GameMode]] = [];
    }
  }

  async startGame(
    users: User[],
    server: Server<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      { id: string }
    >,
  ): Promise<GameEntity> {
    let gameEntity = new GameEntity();
    const opponents: Promise<Opponent>[] = [];
    gameEntity = await this.gamesRepository.save(gameEntity);
    users.forEach((user) => {
      const opponent = new Opponent();
      opponent.game = gameEntity;
      opponent.user = user;
      opponents.push(this.opponentsRepository.save(opponent));
    });
    await Promise.all(opponents);
    const room = `game_${gameEntity.id}`;
    this.games.set(room, [
      new Game(users.length, server.in(room)),
      users.map((user) => ({ id: user.id, ready: false })),
    ]);
    return gameEntity;
  }

  async getGame(gameId: string): Promise<GameEntityFront> {
    const game = await this.gamesRepository.findOne({
      where: { id: gameId },
      relations: { opponents: { user: true } },
    });
    if (game === null) throw new NotFoundException('Game ID not found');
    const opponentsFront = await Promise.all(
      game.opponents.map(async (opponent) => {
        return {
          ...opponent,
          user: await this.transformUserService.transform(opponent.user),
        };
      }),
    );

    return { ...game, opponents: opponentsFront };
  }

  static getGameModeDetails(mode: GameMode): GameModeDetails {
    return PongService.gameModes[
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
      PongService.getGameModeDetails(mode).maxPlayersNumber
    );
  }

  getFirstGameModeQueue(mode: GameMode): QueueList {
    const gameQueue: QueueList = [];
    this.getGameModeQueue(mode).forEach((user, i) => {
      if (i < PongService.getGameModeDetails(mode).maxPlayersNumber)
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
