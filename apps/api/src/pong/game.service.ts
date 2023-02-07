import { GameState, Form, Vector, Point, Entity, Wall, Board } from 'types';

export class Game {
  public boardCanvas = {
    width: 1000,
    height: 500,
  };
  public boardType: number = Form.REC;
  public board!: Board;
  public countUpdate = 0;
  public broadcaster: any;
  public ball!: Ball;
  public player: Racket[] = [];
  public start = Date.now();
  public lastUpdate = 0;
  public color: string[] = ['blue', 'red', 'orange', 'white', 'pink', 'black'];

  constructor(playerNumber: number, broadcaster: any) {
    this.boardType = playerNumber;
    this.broadcaster = broadcaster;
    this.init();
  }

  getState() {
    const state: GameState = {
      numberPlayer: this.boardType,
      players: [],
      ball: {
        point: this.ball.point[0],
        dir: this.ball.speed,
      },
    };
    for (const player of this.player) {
      state.players.push({
        point: player.center(),
        dir: player.dir,
        hp: player.hp,
      });
    }
    return state;
  }

  movePlayer(playerPosition: number, dir: boolean) {
    const timeRatio = (Date.now() - this.start - this.lastUpdate) / 17;
    const player = this.player[playerPosition];
    player.move(dir, this.board.wall, timeRatio);
  }

  createRegularPolygon(point: Point, side: number, n: number) {
    const points: Point[] = [];
    const angle = -(360 - ((n - 2) * 180) / n) * (Math.PI / 180);
    points[0] = new Point(point.x, point.y);
    const vector = point.vectorTo(new Point(points[0].x, points[0].y - side));
    for (let i = 0; i < n - 1; i++) {
      points[i + 1] = new Point(points[i].x, points[i].y);
      [vector.x, vector.y] = [
        -(vector.x * Math.cos(angle) + vector.y * Math.sin(angle)),
        vector.x * Math.sin(angle) - vector.y * Math.cos(angle),
      ];
      points[i + 1].x += vector.x;
      points[i + 1].y += vector.y;
    }
    return points;
  }

  updatePlayer(player: Racket[], wall: Wall[]) {
    const racket: Racket[] = [];
    for (let i = 0; i < wall.length; i++) {
      const wallDir = wall[i].point[0].vectorTo(wall[i].point[2]).normalized();
      const wallPerp = wallDir.perp().normalized();
      const racketCenter = player[i].center();
      const p3 = new Point(
        racketCenter.x - wallDir.x * 40,
        racketCenter.y - wallDir.y * 40,
      );
      const p0 = new Point(
        racketCenter.x + wallDir.x * 40,
        racketCenter.y + wallDir.y * 40,
      );
      const p1 = new Point(p0.x + wallPerp.x * 10, p0.y + wallPerp.y * 10);
      const p2 = new Point(p3.x + wallPerp.x * 10, p3.y + wallPerp.y * 10);
      if (this.player === undefined)
        racket.push(new Racket(i, [p0, p1, p2, p3], this.color[i]));
      else racket.push(new Racket(i, [p0, p1, p2, p3], this.player[i].color));
    }
    return racket;
  }

  createRacket(wall: Wall[]) {
    const racket: Racket[] = [];
    for (let i = 0; i < wall.length; i++) {
      const wallDir = wall[i].point[0].vectorTo(wall[i].point[2]).normalized();
      const wallPerp = wallDir.perp().normalized();
      const wallCenter = wall[i].center();
      const racketCenter = new Point(
        wallCenter.x + wallPerp.x * 5,
        wallCenter.y + wallPerp.y * 5,
      );
      const p3 = new Point(
        racketCenter.x - wallDir.x * 40,
        racketCenter.y - wallDir.y * 40,
      );
      const p0 = new Point(
        racketCenter.x + wallDir.x * 40,
        racketCenter.y + wallDir.y * 40,
      );
      const p1 = new Point(p0.x + wallPerp.x * 10, p0.y + wallPerp.y * 10);
      const p2 = new Point(p3.x + wallPerp.x * 10, p3.y + wallPerp.y * 10);
      if (this.player.length === 0)
        racket.push(new Racket(i, [p0, p1, p2, p3], this.color[i]));
      else racket.push(new Racket(i, [p0, p1, p2, p3], this.player[i].color));
    }
    return racket;
  }

  createRect(x: number, y: number, w: number, h: number) {
    const point: Point[] = [];
    point[0] = new Point(x, y);
    point[1] = new Point(x + w, y);
    point[2] = new Point(x + w, y + h);
    point[3] = new Point(x, y + h);
    return point;
  }

  init() {
    this.board = new Board(this.boardType, this.boardCanvas);
    if (this.boardType != Form.REC) {
      this.player = this.createRacket(this.board.wall);
      this.ball = new Ball(
        this.createRegularPolygon(
          this.board.board.center(),
          30,
          this.boardType,
        ),
        this.player,
        this.board.wall,
      );
    } else {
      this.player = this.createRacket([this.board.wall[0], this.board.wall[2]]);
      this.ball = new Ball(
        this.createRect(
          this.board.board.center().x,
          this.board.board.center().y,
          10,
          10,
        ),
        this.player,
        this.board.wall,
      );
    }
  }

  updateGame() {
    if (!this.boardType) {
      return;
    }
    for (const p of this.player) {
      if (p.hp == 0) {
        if (this.boardType === Form.REC) {
          this.boardType = 0;
          return;
        } else {
          this.player.splice(p.index, 1);
          for (let i = 0; i < this.player.length; i++) {
            if (this.player[i].index > p.index) {
              this.player[i].index--;
            }
          }
          this.boardType--;
          this.init();
        }
      }
    }
    this.countUpdate++;
    const timeRatio = (Date.now() - this.start - this.lastUpdate) / 17;
    this.ball.update(this.player, this.board.wall, this.board, timeRatio, this);
    this.lastUpdate = Date.now() - this.start;
  }
}

export class Ball extends Entity {
  public defaultSpeed = 3;
  public nextCollision: { wall: number; wallIndex: number; racket: number } = {
    wall: 0,
    wallIndex: 0,
    racket: 0,
  };

  constructor(points: Point[], player: Racket[], walls: Wall[]) {
    super(points);
    const dir = player[0].point[1]
      .midSegment(player[0].point[2])
      .vectorTo(player[0].point[0].midSegment(player[0].point[3]))
      .normalized();
    this.speed = new Vector(
      dir.x * this.defaultSpeed,
      dir.y * this.defaultSpeed,
    );
    this.calcNextCollision(player, walls, null);
  }

  calcNextCollision(rackets: Racket[], walls: Wall[], ignore: number | null) {
    let face: Point;
    let ballTo: Point;
    let minRatio: number | null = null;
    rackets.forEach((racket, index) => {
      if (rackets.length != 2) {
        face = this.getFace(index);
      } else {
        if (index) face = this.getFace(2);
        else face = this.getFace(0);
      }
      ballTo = new Point(this.speed.x + face.x, this.speed.y + face.y);
      const ratio = face.intersect(ballTo, racket.point[2], racket.point[1]);
      if (ratio > 0) {
        minRatio ??= ratio;
        if (ratio < minRatio) minRatio = ratio;
      }
    });
    if (minRatio) this.nextCollision.racket = minRatio;
    minRatio = null;
    walls.forEach((wall, index) => {
      if (ignore === null || index !== ignore) {
        face = this.getFace(index);
        ballTo = new Point(this.speed.x + face.x, this.speed.y + face.y);
        const ratio = face.intersect(ballTo, wall.point[2], wall.point[1]);
        if (ratio > 0) {
          minRatio ??= ratio;
          if (ratio <= minRatio) {
            minRatio = ratio;
            this.nextCollision.wallIndex = index;
          }
        }
      }
    });
    if (minRatio) this.nextCollision.wall = minRatio;
  }

  getFace(n: number) {
    if (n) {
      return this.point[n - 1].midSegment(this.point[n]);
    }
    return this.point[this.point.length - 1].midSegment(this.point[0]);
  }

  goToRandomPlayer(player: Racket[], game: Game) {
    const random = Math.floor(Math.random() * 10000) % player.length;
    const dir = player[random].point[1]
      .midSegment(player[random].point[2])
      .vectorTo(player[random].point[0].midSegment(player[random].point[3]))
      .normalized();
    this.speed = new Vector(
      dir.x * this.defaultSpeed,
      dir.y * this.defaultSpeed,
    );
    game.broadcaster.emit('refresh', game.getState(), Date.now());
  }

  update(
    rackets: Racket[],
    walls: Wall[],
    board: Board,
    timeRatio: number,
    game: Game,
  ) {
    this.nextCollision.wall -= 1 * timeRatio;
    this.nextCollision.racket -= 1 * timeRatio;

    if (
      this.nextCollision.wall > this.nextCollision.racket &&
      this.nextCollision.racket < 1
    ) {
      for (const racket of rackets) {
        if (this.sat(racket)) {
          let angle = 0;
          let face;
          if (rackets.length != 2) face = this.getFace(rackets.indexOf(racket));
          else {
            const index = rackets.indexOf(racket);
            if (index == 1) face = this.getFace(2);
            else face = this.getFace(0);
          }
          let ratio = racket.point[2].intersect(
            racket.point[1],
            this.center(),
            face,
          );
          if (ratio > 1) ratio = 1;
          if (ratio < 0) ratio = 0;
          angle = -(Math.PI / 4 + (Math.PI / 2) * (1 - ratio));
          const norm = racket.point[2].vectorTo(racket.point[1]).normalized();
          [norm.x, norm.y] = [
            norm.x * Math.cos(angle) + norm.y * Math.sin(angle),
            -(norm.x * Math.sin(angle)) + norm.y * Math.cos(angle),
          ];
          this.speed = new Vector(
            norm.x * this.defaultSpeed,
            norm.y * this.defaultSpeed,
          );
          this.moveTo(this.speed, timeRatio);
          this.calcNextCollision(rackets, walls, null);
          return;
        }
      }
    }
    if (this.nextCollision.wall <= 0) {
      const newCoords = new Point(
        this.point[0].x - this.speed.x * this.nextCollision.wall,
        this.point[0].y - this.speed.y * this.nextCollision.wall,
      );
      this.replaceTo(newCoords);
      const wall = walls[this.nextCollision.wallIndex];
      const wallVector = wall.point[0].vectorTo(wall.point[2]);
      const Norm = wallVector.norm() * this.speed.norm();
      const angle = Math.acos(wallVector.product(this.speed) / Norm);
      const tmp = new Vector(this.speed.x, this.speed.y);
      const isAcute = angle <= Math.PI / 2;
      const outAngle = isAcute ? angle * 2 : (Math.PI - angle) * 2;
      const cosA = Math.cos(outAngle);
      const sinA = Math.sin(outAngle);
      [tmp.x, tmp.y] = [
        this.speed.x * cosA - this.speed.y * sinA,
        this.speed.x * sinA + this.speed.y * cosA,
      ];
      const angle2 = Math.acos(wallVector.product(tmp) / Norm);
      if (Math.abs(angle2 - angle) > 0.001) {
        [tmp.x, tmp.y] = [
          this.speed.x * cosA - this.speed.y * -sinA,
          this.speed.x * -sinA + this.speed.y * cosA,
        ];
      }
      this.speed = tmp;
      this.moveTo(this.speed, timeRatio);
      this.moveTo(this.speed, timeRatio);
      const index = this.nextCollision.wallIndex;
      if (rackets.length === 2) {
        if (index === 2) {
          console.log('GOAL for player 0');
          rackets[1].hp--;
          this.replaceTo(board.board.center());
          this.goToRandomPlayer(rackets, game);
        } else if (index === 0) {
          console.log('GOAL for player 1');
          rackets[0].hp--;
          this.replaceTo(board.board.center());
          this.goToRandomPlayer(rackets, game);
        }
      } else {
        rackets[index].hp--;
        this.replaceTo(board.board.center());
        this.goToRandomPlayer(rackets, game);
      }
      this.calcNextCollision(rackets, walls, null);
      return;
    }
    this.moveTo(this.speed, timeRatio);
  }
}

export class Racket extends Entity {
  public defaultSpeed = 1.5;
  public hp = 2;
  public dir!: Vector;

  constructor(public index: number, points: Point[], public color: string) {
    super(points);
    this.dir = this.point[2].vectorTo(this.point[1]).normalized();
    this.speed = new Vector(
      this.dir.x * this.defaultSpeed,
      this.dir.y * this.defaultSpeed,
    );
  }

  move(dir: boolean, walls: Wall[], timeRatio: number) {
    if (dir) {
      this.speed = new Vector(
        this.dir.x * this.defaultSpeed,
        this.dir.y * this.defaultSpeed,
      );
    } else {
      this.speed = new Vector(
        -this.dir.x * this.defaultSpeed,
        -this.dir.y * this.defaultSpeed,
      );
    }
    this.moveTo(this.speed, timeRatio);
    for (const wall of walls) {
      if (this.sat(wall)) {
        this.moveTo(new Vector(-this.speed.x, -this.speed.y), timeRatio);
      }
    }
  }
}
