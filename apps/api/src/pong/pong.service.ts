import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { MatchService } from 'src/Match/Match.service';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';
import { Repository } from 'typeorm';
import {
  Game as GameEntity,
  GameEntityFront,
  GameMode,
  Opponent,
  User,
  Userfront,
} from 'types';
import { Game } from './game.service';

export type QueueList = User[];
export type QueuesMap = { [key in GameMode]: QueueList };
export type GameModeDetails = { maxPlayersNumber: number };
export type Invitation = { hostId: string; targetId: string };

@Injectable()
export class PongService {
  games!: Map<string, [Game, Array<{ id: string; ready: boolean }>]>;

  queues: QueuesMap = {} as QueuesMap;

  invitesList: Invitation[] = [];

  static gameModes: { [key in GameMode]: GameModeDetails } = {
    CLASSIC: { maxPlayersNumber: 2 },
    BATTLE_ROYALE: { maxPlayersNumber: 6 },
  };

  constructor(
    @InjectRepository(GameEntity)
    private readonly gamesRepository: Repository<GameEntity>,
    private readonly logger: Logger,
    @InjectRepository(Opponent)
    private readonly opponentsRepository: Repository<Opponent>,
    private readonly transformUserService: TransformUserService,
    private readonly matchService: MatchService,
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
    this.games.set(gameEntity.id, [
      new Game(users.length, server.in(room)),
      users.map((user) => ({ id: user.id, ready: false })),
    ]);
    return gameEntity;
  }

  userIsInGame(user: User): boolean {
    for (const [game_id, game] of this.games) {
      if (game[1].find((opponent) => opponent.id === user.id)) return true;
    }
    return false;
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
    const playersIds = this.games.get(gameId)![1].map((e) => e.id);
    const players: Userfront[] = [];
    for (let i = 0; i < playersIds.length; i++) {
      const player = opponentsFront.find((e) => e.user.id === playersIds[i]);
      if (player) players.push(player.user);
    }

    return {
      ...game,
      opponents: players.map((e) => {
        return { user: e };
      }),
    };
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
    if (this.userIsInQueue(user) || this.userIsInGame(user)) return null;
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

  saveGame(ids: string[], hps: number[], hpStart: number) {
    const indexWin = hps.indexOf(Math.max(hps[0], hps[1]));
    this.matchService.addMatch(
      ids[indexWin],
      ids[1 - indexWin],
      hpStart - hps[1 - indexWin],
      hpStart - hps[indexWin],
    );
  }

  invite(host: User, target: User): QueueList | null {
    this.logger.debug(
      `'${host.id}' (${host.name}) invites '${target.id}' (${target.name})`,
    );
    const invitation = this.invitesList.find(
      (invitation) =>
        invitation.hostId === target.id && invitation.targetId === host.id,
    );
    if (invitation) {
      this.logger.debug(
        `'${target.id}' (${target.name}) has already invited '${host.id}' (${host.name})`,
      );
      return [target, host];
    }
    this.invitesList.push({ hostId: host.id, targetId: target.id });
    return null;
  }

  discardInvitations(user: User): Invitation[] {
    this.logger.debug(
      `'${user.id}' (${user.name}) is discarding all their invitations`,
    );
    const invitations = [];
    let pos;
    while (
      (pos = this.invitesList.findIndex(
        (invitation) => invitation.hostId === user.id,
      )) >= 0
    ) {
      invitations.push(this.invitesList[pos]);
      if (pos >= 0) this.invitesList.splice(pos, 1);
    }
    console.log(invitations);
    return invitations;
  }
}
