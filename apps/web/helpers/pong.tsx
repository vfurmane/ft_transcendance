import {
  GameState,
  PlayerInterface,
  Form,
  Vector,
  Point,
  Entity,
  Wall,
  Board,
  ServerCanvas,
} from "types";
import React, { useRef, useEffect } from "react";
import { NextRouter, useRouter } from "next/router";
import { useWebsocketContext } from "../components/Websocket";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

class Game {
  public static isSolo = false;
  public boardType = Form.REC;
  public boardCanvasRef!: React.RefObject<HTMLCanvasElement>;
  public ballWidth!: number;
  public boardCanvas!: HTMLCanvasElement;
  public boardContext!: CanvasRenderingContext2D;
  public board!: Board;
  public countUpdate = 0;
  public static point = 0;
  public static live = 10;
  public ball!: Ball;
  public player: Racket[] = [];
  public cible!: Target;
  public static keyPressed = { up: false, down: false };
  public start = Date.now();
  public lastUpdate = 0;
  public color: string[] = ["blue", "red", "orange", "white", "pink", "black"];
  public static position: number;
  public static scoreMax: number = 10;
  public static changeLife: (index: number, val: number) => void;
  public static socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  public static count: number;
  public await = true;

  constructor(
    number_player: number | undefined,
    position: number | undefined,
    private readonly router: NextRouter,
    changeLife: (index: number, val: number) => void) {
    if (number_player) {
      this.boardType = number_player;
    } else {
      this.boardType = Form.REC;
      Game.isSolo = true;
    }
    if (position) {
      Game.position = position;
    } else {
      Game.position = 0;
    }
    Game.changeLife = changeLife;
  }

  setWebsocket(socket: Socket<DefaultEventsMap, DefaultEventsMap>): void {
    Game.socket = socket;
    Game.socket.emit("ready");
  }

  createRegularPolygon(point: Point, side: number, n: number): Point[] {
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

  convertState(state: GameState): GameState {
    const ratiox = (this.boardCanvas.width / ServerCanvas.width);
    const ratioy = (this.boardCanvas.height / ServerCanvas.height);
    const newState: GameState = {
      numberPlayer: state.numberPlayer,
      players: [],
      ball: {
        point: new Point(state.ball.point.x * ratiox, state.ball.point.y * ratioy),
        dir: this.ball.speed,
      },
    };
    state.players.forEach((player) => {
      newState.players.push({
        point: new Point(player.point.x * ratiox, player.point.y * ratioy),
        dir : player.dir,
        hp : player.hp
      })
    })
    return state;
  }

  refresh(state: GameState): void {
    if (!this.boardType) {
      return;
    }
    state = this.convertState(state);
    if (this.boardType == Form.REC) {
      this.player = this.updatePlayer(state.players, [
        this.board.wall[0],
        this.board.wall[2],
      ]);
      this.ball = new Ball(
        this.createRect(
          state.ball.point.x,
          state.ball.point.y,
          this.ballWidth,
          this.ballWidth,
        ),
        this.player,
        this.board.wall
      );
    } else {
      this.player = this.updatePlayer(state.players, this.board.wall);
      this.ball = new Ball(
        this.createRegularPolygon(
          new Point(state.ball.point.x, state.ball.point.y),
          this.ballWidth,
          this.boardType
        ),
        this.player,
        this.board.wall
      );
    }
    this.ball.speed = new Vector(state.ball.dir.x, state.ball.dir.y);
    this.ball.calcNextCollision(this.player, this.board.wall, null);
  }

  updatePlayer(player: PlayerInterface[], wall: Wall[]): Racket[] {
    const racket: Racket[] = [];
    for (let i = 0; i < wall.length; i++) {
      const wallDir = wall[i].point[0].vectorTo(wall[i].point[2]).normalized();
      const wallPerp = wallDir.perp().normalized();
      const racketCenter = player[i].point;
      const p3 = new Point(
        racketCenter.x - wallDir.x * (this.board.wallSize * 0.05),
        racketCenter.y - wallDir.y * (this.board.wallSize * 0.05)
      );
      const p0 = new Point(
        racketCenter.x + wallDir.x * (this.board.wallSize * 0.05),
        racketCenter.y + wallDir.y * (this.board.wallSize * 0.05)
      );
      const p1 = new Point(p0.x + wallPerp.x * (this.ballWidth), p0.y + wallPerp.y * (this.ballWidth));
      const p2 = new Point(p3.x + wallPerp.x * (this.ballWidth), p3.y + wallPerp.y * (this.ballWidth));
      if (this.player === undefined)
        racket.push(new Racket(i, [p0, p1, p2, p3], this.color[i]));
      else racket.push(new Racket(i, [p0, p1, p2, p3], this.player[i].color));
      Game.changeLife(i, player[i].hp);
      racket[i].hp = player[i].hp;
    }
    return racket;
  }


  createRacket(wall: Wall[]): Racket[] {
    this.ballWidth = this.board.wallSize * 0.00625;
    if (Game.isSolo) {
      console.log("wall: ");
      return [
        new Racket(
          0,
          this.createRect(10, this.boardCanvas.height / 2, 10, 80),
          this.color[0]
        ),
      ];
    } else {
      const racket: Racket[] = [];
      for (let i = 0; i < wall.length; i++) {
        let wallDir = wall[i].point[0].vectorTo(wall[i].point[2]).normalized();
        let wallPerp = wallDir.perp().normalized();
        let wallCenter = wall[i].center();
        let racketCenter = new Point(
          wallCenter.x + wallPerp.x * 10,
          wallCenter.y + wallPerp.y * 10
        );
        let p3 = new Point(
          racketCenter.x - wallDir.x * (this.board.wallSize * 0.05),
          racketCenter.y - wallDir.y * (this.board.wallSize * 0.05)
        );
        let p0 = new Point(
          racketCenter.x + wallDir.x * (this.board.wallSize * 0.05),
          racketCenter.y + wallDir.y * (this.board.wallSize * 0.05)
        );
        let p1 = new Point(p0.x + wallPerp.x * (this.ballWidth), p0.y + wallPerp.y * (this.ballWidth));
        let p2 = new Point(p3.x + wallPerp.x * (this.ballWidth), p3.y + wallPerp.y * (this.ballWidth));
        if (this.player.length === 0)
          racket.push(new Racket(i, [p0, p1, p2, p3], this.color[i]));
        else racket.push(new Racket(i, [p0, p1, p2, p3], this.player[i].color));
      }
      return racket;
    }
  }

  createRect(x: number, y: number, w: number, h: number): Point[] {
    const point: Point[] = [];
    point[0] = new Point(x, y);
    point[1] = new Point(x + w, y);
    point[2] = new Point(x + w, y + h);
    point[3] = new Point(x, y + h);
    return point;
  }

  init(ref: React.RefObject<HTMLCanvasElement> | undefined): void {
    if (ref === undefined) return;
    if (!Game.isSolo) {
      Game.socket.on("refresh", (state: GameState, time: number) => {
        this.await = false;
        Game.count = 0;
        if (!this.board) {
          return;
        }
        this.refresh(state);
      });
      Game.socket.on("endGame", () => {
        Game.socket.off("endGame");
        Game.socket.off("refresh");
        this.boardType = 0;
      });
    } else {
      this.await = false;
    }
    this.boardCanvasRef = ref;
    if (!this.boardCanvasRef.current) {
      return;
    }
    this.boardCanvas = this.boardCanvasRef.current;
    if (!this.boardCanvas) return;


    const context = this.boardCanvas.getContext("2d");
    if (!context) return;
    this.boardContext = context;
    this.boardCanvas.width = 400;//window.innerWidth * 0.6;
    this.boardCanvas.height = 200;//(window.innerWidth * 0.6) * (1 / 2);
    this.board = new Board(this.boardType, this.boardCanvas);
    this.ballWidth = this.board.wallSize * 0.00625;
    if (this.boardType !== Form.REC) {
      this.player = this.createRacket(this.board.wall);
      this.ball = new Ball(
        this.createRegularPolygon(
          this.board.board.center(),
          this.ballWidth,
          this.boardType
        ),
        this.player,
        this.board.wall
      );
    } else {
      this.player = this.createRacket([this.board.wall[0], this.board.wall[2]]);
      this.ball = new Ball(
        this.createRect(
          this.board.board.center().x,
          this.board.board.center().y,
          this.ballWidth,
          this.ballWidth
        ),
        this.player,
        this.board.wall
      );
    }
    if (Game.isSolo)
      this.cible = new Target(
        this.createRect(
          this.boardCanvas.width * (2 / 3),
          this.boardCanvas.height / 2,
          20,
          20
        )
      );

    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") Game.keyPressed.up = true;
      else if (e.key === "ArrowDown") Game.keyPressed.down = true;
    });
    window.addEventListener("keyup", function (e) {
      if (e.key === "ArrowUp") Game.keyPressed.up = false;
      else if (e.key === "ArrowDown") Game.keyPressed.down = false;
    });
  }

  updateGame() {
    if (this.await) return;
    const time = Math.round(Date.now() - this.start);
    this.boardCanvas!.width = 400;//window.innerWidth * 0.6;
    this.boardCanvas!.height = 200;//(window.innerWidth * 0.6) * (1 / 2);
    let tmp = this.board.wallSize;
    //this.board = new Board(this.boardType, this.boardCanvas);
    /*if (this.boardType != Form.REC) {
      this.player = this.createRacket(this.board.wall);
    } else {
      this.player = this.createRacket([
        this.board.wall[0],
        this.board.wall[2],
      ]);
    }*/
    if (Game.isSolo)
    {
        this.boardCanvas!.width = window.innerWidth * 0.6;
        this.boardCanvas!.height = (window.innerWidth * 0.6) * (1 / 2);
        this.board = new Board(this.boardType, this.boardCanvas);
        if (this.board.wallSize !== tmp) {
          console.log('hello');
          this.player = this.createRacket([
            this.board.wall[0],
            this.board.wall[2],
          ]);
        }
    }



    /*if (this.ballWidth !== tmp)
    {
      if (this.boardType !== Form.REC)
      {
        this.ball = new Ball(
          this.createRegularPolygon(
            this.ball.center(),
            this.ballWidth,
            this.boardType,
          ),
          this.player,
          this.board.wall
        );
      }
      else
      {
        this.ball = new Ball(
          this.createRect(
            this.ball.center().x,
            this.ball.center().y,
            this.ballWidth,
            this.ballWidth
          ),
          this.player,
          this.board.wall
        );
      }
    }*/

    if (!this.boardType) {
      return;
    }
    this.boardContext!.fillStyle = "#666666";
    this.board.board.draw(this.boardContext, "#1e1e1e");
    this.boardContext!.font = "14px sherif";
    this.boardContext!.fillStyle = "#fff";

    // Draw the net (Line in the middle)
    if (this.player.length === 2) {
      this.boardContext!.beginPath();
      this.boardContext!.setLineDash([30, 15]);
      this.boardContext!.moveTo((this.boardCanvas!.width / 2), this.boardCanvas!.height - 20);
      this.boardContext!.lineTo((this.boardCanvas!.width / 2), 20);
      this.boardContext!.lineWidth = 2;
      this.boardContext!.strokeStyle = '#ffffff';
      this.boardContext!.stroke();
      this.boardContext!.setLineDash([0, 0]);
      this.boardContext!.lineWidth = 1;
    }


    this.countUpdate++;
    const timeRatio = (Date.now() - this.start - this.lastUpdate) / 17;
    this.ball.update(this.player, this.board.wall, this.board, timeRatio);
    this.player.forEach((player) => player.update(this.board.wall, timeRatio));
    if (Game.isSolo) this.cible.update(this.ball, this.boardCanvas);
    this.board.wall.forEach((wall) => {
      wall.draw(this.boardContext, undefined);
    });
    this.ball.draw(this.boardContext, undefined);
    for (const p of this.player) {
      p.draw(this.boardContext, p.color);
    }
    if (Game.isSolo) this.cible.draw(this.boardContext);
    if (Game.live === 0) {
      Game.point = 0;
      Game.live = 3;
      this.start = Date.now();
    }
    this.lastUpdate = Date.now() - this.start;
  }
}

class Target extends Entity {
  constructor(points: Point[]) {
    super(points);
  }

  draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.moveTo(this.getx(), this.gety());
    for (const point of this.point) {
      context.lineTo(point.x, point.y);
    }
    context.closePath();
    context.strokeStyle = "red";
    context.stroke();
    context.fillStyle = "red";
    context.fill();
  }

  randomVal(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  update(ball: Ball, canvas: HTMLCanvasElement): void {
    if (this.sat(ball)) {
      Game.point++;
      this.replaceTo(
        new Point(
          this.randomVal(canvas.width / 2, canvas.width - 30),
          this.randomVal(30, canvas.height - 30)
        )
      );
    }
  }
}

class Ball extends Entity {
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
      dir.y * this.defaultSpeed
    );
    this.calcNextCollision(player, walls, null);
  }

  calcNextCollision(
    rackets: Racket[],
    walls: Wall[],
    ignore: number | null
  ): void {
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

  isParallel(from1: Point, to1: Point, from2: Point, to2: Point): number {
    const v1 = from1.vectorTo(to1);
    const v2 = from2.vectorTo(to2);
    return v1.crossProduct(v2);
  }

  getFace(n: number): Point {
    if (n) {
      return this.point[n - 1].midSegment(this.point[n]);
    }
    return this.point[this.point.length - 1].midSegment(this.point[0]);
  }

  goToRandomPlayer(player: Racket[]): void {
    const random = Math.floor(Math.random() * 10000) % player.length;
    const dir = player[random].point[1]
      .midSegment(player[random].point[2])
      .vectorTo(player[random].point[0].midSegment(player[random].point[3]))
      .normalized();
    this.speed = new Vector(
      dir.x * this.defaultSpeed,
      dir.y * this.defaultSpeed
    );
  }

  update(
    rackets: Racket[],
    walls: Wall[],
    board: Board,
    timeRatio: number
  ): void {
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
          const index = rackets.indexOf(racket);
          if (rackets.length != 2) face = this.getFace(index);
          else {
            face = index === 1 ? this.getFace(2) : this.getFace(0);
          }
          let ratio = racket.point[2].intersect(
            racket.point[1],
            this.center(),
            face
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
            norm.y * this.defaultSpeed
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
        this.point[0].y - this.speed.y * this.nextCollision.wall
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
          rackets[1].hp--;
          this.replaceTo(board.board.center());
          this.goToRandomPlayer(rackets);
          //  Game.changeLife(1, rackets[1].hp);
        } else if (index === 0) {
          //  rackets[0].hp--;
          this.replaceTo(board.board.center());
          this.goToRandomPlayer(rackets);
          //  Game.changeLife(0, rackets[0].hp);
        }
      } else if (!Game.isSolo) {
        // rackets[index].hp--;
        this.replaceTo(board.board.center());
        this.goToRandomPlayer(rackets);
        //Game.changeLife(index, rackets[index].hp);
      } else {
        if (index === 0) {
          //  rackets[0].hp--;
          this.replaceTo(board.board.center());
          this.goToRandomPlayer(rackets);
          //  Game.changeLife(index, rackets[index].hp);
        }
      }
      this.calcNextCollision(rackets, walls, null);
      return;
    }
    this.moveTo(this.speed, timeRatio);
  }
}

class Racket extends Entity {
  public defaultSpeed = 1.5;
  public hp = 3;
  public dir!: Vector;

  constructor(public index: number, points: Point[], public color: string) {
    super(points);
    this.dir = this.point[2].vectorTo(this.point[1]).normalized();
    this.speed = new Vector(
      this.dir.x * this.defaultSpeed,
      this.dir.y * this.defaultSpeed
    );
  }

  update(walls: Wall[], timeRatio: number): void {
    if (this.index == Game.position) {
      if (Game.keyPressed.up && Game.keyPressed.down) {
      } else if (Game.keyPressed.up) {
        this.speed = new Vector(
          this.dir.x * this.defaultSpeed,
          this.dir.y * this.defaultSpeed
        );
        this.moveTo(this.speed, timeRatio);
        if (!Game.isSolo) {
          Game.socket.emit("up");
        }
      } else if (Game.keyPressed.down) {
        this.speed = new Vector(
          -this.dir.x * this.defaultSpeed,
          -this.dir.y * this.defaultSpeed
        );
        this.moveTo(this.speed, timeRatio);
        if (!Game.isSolo) {
          Game.socket.emit("down");
        }
      }
    }
    for (const wall of walls) {
      if (this.sat(wall)) {
        this.moveTo(new Vector(-this.speed.x, -this.speed.y), timeRatio);
      }
    }
  }
}

export default Game;
