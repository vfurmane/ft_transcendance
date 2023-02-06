import { GameState, PlayerInterface, Form, Vector, Point, Entity, Wall, Board } from "types";
import React, { useRef, useEffect } from "react";
import { NextRouter, useRouter } from "next/router";
import { useWebsocketContext } from "../components/Websocket";

class Game {
  public static isSolo: boolean = false;
  public boardType = Form.REC;
  public boardCanvasRef!: React.RefObject<HTMLCanvasElement>;
  public boardCanvas!: HTMLCanvasElement | null;
  public boardContext!: CanvasRenderingContext2D | null;
  public board!: Board;
  public countUpdate: number = 0;
  public static point: number = 0;
  public static live: number = 3;
  public ball!: Ball;
  public player: Racket[] = [];
  public cible!: Target;
  public static keyPressed = { up: false, down: false };
  public start = Date.now();
  public lastUpdate: number = 0;
  public color: string[] = ["blue", "red", "orange", "white", "pink", "black"];
  public static position: number;
  public static socket: any;
  public static count: number;

  constructor(
    number_player: number|undefined,
    position: number|undefined,
    private router: NextRouter
  ) {
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
  }

  createRegularPolygon(point: Point, side: number, n: number) {
    let points: Point[] = [];
    let angle = -(360 - ((n - 2) * 180) / n) * (Math.PI / 180);
    points[0] = new Point(point.x, point.y);
    let vector = point.vectorTo(new Point(points[0].x, points[0].y - side));
    for (let i: number = 0; i < n - 1; i++) {
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

  refresh(state: any) {
    if (!this.boardType) {
      return;
    }
    if (this.boardType == Form.REC) {
      this.player = this.updatePlayer(state.players, [
        this.board.wall[0],
        this.board.wall[2],
      ]);
    } else {
      this.player = this.updatePlayer(state.players, this.board.wall);
    }
    if (this.boardType == Form.REC) {
      this.ball = new Ball(
        this.createRegularPolygon(
          new Point(state.ball.point.x, state.ball.point.y),
          10,
          4
        ),
        this.player,
        this.board.wall
      );
    } else {
      this.ball = new Ball(
        this.createRegularPolygon(
          new Point(state.ball.point.x, state.ball.point.y),
          30,
          this.boardType
        ),
        this.player,
        this.board.wall
      );
    }
    this.ball.speed = new Vector(state.ball.dir.x, state.ball.dir.y);
    this.ball.calcNextCollision(this.player, this.board.wall, null);
  }

  updatePlayer(player: PlayerInterface[], wall: Wall[]) {
    let racket: Racket[] = [];
    for (let i = 0; i < wall.length; i++) {
      let wallDir = wall[i].point[0].vectorTo(wall[i].point[2]).normalized();
      let wallPerp = wallDir.perp().normalized();
      let racketCenter = player[i].point;
      let p3 = new Point(
        racketCenter.x - wallDir.x * 40,
        racketCenter.y - wallDir.y * 40
      );
      let p0 = new Point(
        racketCenter.x + wallDir.x * 40,
        racketCenter.y + wallDir.y * 40
      );
      let p1 = new Point(p0.x + wallPerp.x * 10, p0.y + wallPerp.y * 10);
      let p2 = new Point(p3.x + wallPerp.x * 10, p3.y + wallPerp.y * 10);
      if (this.player === undefined)
        racket.push(new Racket(i, [p0, p1, p2, p3], this.color[i]));
      else racket.push(new Racket(i, [p0, p1, p2, p3], this.player[i].color));
      racket[i].hp = player[i].hp;
    }
    return racket;
  }

  createRacket(wall: Wall[]) {
    if (Game.isSolo) {
      return [
        new Racket(
          0,
          this.createRect(10, this.boardCanvas!.height / 2, 10, 80),
          this.color[0]
        ),
      ];
    } else {
      let racket: Racket[] = [];
      for (let i = 0; i < wall.length; i++) {
        let wallDir = wall[i].point[0].vectorTo(wall[i].point[2]).normalized();
        let wallPerp = wallDir.perp().normalized();
        let wallCenter = wall[i].center();
        let racketCenter = new Point(
          wallCenter.x + wallPerp.x * 5,
          wallCenter.y + wallPerp.y * 5
        );
        let p3 = new Point(
          racketCenter.x - wallDir.x * 40,
          racketCenter.y - wallDir.y * 40
        );
        let p0 = new Point(
          racketCenter.x + wallDir.x * 40,
          racketCenter.y + wallDir.y * 40
        );
        let p1 = new Point(p0.x + wallPerp.x * 10, p0.y + wallPerp.y * 10);
        let p2 = new Point(p3.x + wallPerp.x * 10, p3.y + wallPerp.y * 10);
        if (this.player.length === 0)
          racket.push(new Racket(i, [p0, p1, p2, p3], this.color[i]));
        else racket.push(new Racket(i, [p0, p1, p2, p3], this.player[i].color));
      }
      return racket;
    }
  }

  createRect(x: number, y: number, w: number, h: number) {
    let point: Point[] = [];
    point[0] = new Point(x, y);
    point[1] = new Point(x + w, y);
    point[2] = new Point(x + w, y + h);
    point[3] = new Point(x, y + h);
    return point;
  }

  init(ref: React.RefObject<HTMLCanvasElement> | undefined) {
    if (ref === undefined) return;
    if (!Game.isSolo) {
      Game.socket.on("refresh", (state: GameState, time: number) => {
        Game.count = 0;
        if (!this.board) {
          return;
        }
        this.refresh(state);
      });
      Game.socket.on("endGame", () => {
          Game.socket.off("endGame")
          Game.socket.off("refresh")
          this.router.replace("/");
      });
    }
    this.boardCanvasRef = ref;
    this.boardCanvas = this.boardCanvasRef.current;
    if (!this.boardCanvas) return;
    this.boardContext = this.boardCanvas.getContext("2d");
    this.boardCanvas.width = 640; //window.innerWidth * 0.9;
    this.boardCanvas.height = 480; //window.innerHeight * 0.9;
    this.board = new Board(this.boardType, this.boardCanvas);
    if (this.boardType != Form.REC) {
      this.player = this.createRacket(this.board.wall);
      this.ball = new Ball(
        this.createRegularPolygon(
          this.board.board.center(),
          30,
          this.boardType
        ),
        this.player,
        this.board.wall
      );
    } else {
      this.player = this.createRacket([
        this.board.wall[0],
        this.board.wall[2],
      ]);
      this.ball = new Ball(
        this.createRect(
          this.board.board.center().x,
          this.board.board.center().y,
          10,
          10
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
    this.boardCanvas!.width = 640; //window.innerWidth * 0.9;
    this.boardCanvas!.height = 480; //window.innerHeight * 0.9;
    const time = Math.round(Date.now() - this.start);

    if (!this.boardType) {
      return;
    }
    if (Game.isSolo) {
      if (!this.player[0].hp) {
        this.boardType = 0;
        return ;
      }
    }
    this.boardContext!.fillStyle = "#666666";
    this.board.board.draw(this.boardContext, "gray");
    this.boardContext!.font = "14px sherif";
    this.boardContext!.fillStyle = "#000000";
    this.boardContext!.fillText(
      Math.round(this.countUpdate / (time / 1000)) +
        " Print from class Board : " +
        this.boardCanvas!.width +
        " " +
        this.boardCanvas!.height,
      0,
      10
    );
    this.boardContext!.font = "50px sherif";
    this.boardContext!.fillText(
      Game.point.toString(),
      this.boardCanvas!.width * 0.333,
      50
    );
    this.boardContext!.fillText(
      Math.round(time * 0.001).toString(),
      this.boardCanvas!.width * 0.333,
      110
    );
    this.countUpdate++;
    let timeRatio = (Date.now() - this.start - this.lastUpdate) / 17;
    this.ball.update(this.player, this.board.wall, this.board, timeRatio);
    this.player.forEach((player) =>
      player.update(this.board.wall, timeRatio)
    );
    if (Game.isSolo) this.cible.update(this.ball, this.boardCanvas);
    this.board.wall.forEach((wall) => {
      wall.draw(this.boardContext, undefined);
    });
    this.ball.draw(this.boardContext, undefined);
    for (let p of this.player) {
      p.draw(this.boardContext, p.color);
      p.printPoint(this.boardContext, 0, "red");
      p.printPoint(this.boardContext, 3, "green");
      this.boardContext!.fillText(
        p.hp.toString(),
        this.boardCanvas!.width / 2,
        50 + 20 * p.index
      );
    }
    if (Game.isSolo) this.cible.draw(this.boardContext);
    if (Game.live == 0) {
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

  draw(context: CanvasRenderingContext2D | null) {
    context!.beginPath();
    context!.moveTo(this.getx(), this.gety());
    for (let point of this.point) {
      context!.lineTo(point.x, point.y);
    }
    context!.closePath();
    context!.strokeStyle = "red";
    context!.stroke();
    context!.fillStyle = "red";
    context!.fill();
  }

  randomVal(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  update(ball: Ball, canvas: HTMLCanvasElement | null) {
    if (this.sat(ball)) {
      Game.point++;
      this.replaceTo(
        new Point(
          this.randomVal(canvas!.width / 2, canvas!.width - 30),
          this.randomVal(30, canvas!.height - 30)
        )
      );
    }
  }
}

class Ball extends Entity {
  public defaultSpeed: number = 3;
  public nextCollision: { wall: number; wallIndex: number; racket: number } = { wall: 0, wallIndex: 0, racket: 0 };

  constructor(points: Point[], player: Racket[], walls: Wall[]) {
    super(points);
    let dir = player[0].point[1]
      .midSegment(player[0].point[2])
      .vectorTo(player[0].point[0].midSegment(player[0].point[3]))
      .normalized();
    this.speed = new Vector(
      dir.x * this.defaultSpeed,
      dir.y * this.defaultSpeed
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
      let ratio = face.intersect(ballTo, racket.point[2], racket.point[1]);
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
        let ratio = face.intersect(ballTo, wall.point[2], wall.point[1]);
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

  isParallel(from1: Point, to1: Point, from2: Point, to2: Point) {
    let v1 = from1.vectorTo(to1);
    let v2 = from2.vectorTo(to2);
    return v1.crossProduct(v2);
  }

  getFace(n: number) {
    if (n) {
      return this.point[n - 1].midSegment(this.point[n]);
    }
    return this.point[this.point.length - 1].midSegment(this.point[0]);
  }

  goToRandomPlayer(player: Racket[]) {
    let random = Math.floor(Math.random() * 10000) % player.length;
    let dir = player[random].point[1]
      .midSegment(player[random].point[2])
      .vectorTo(player[random].point[0].midSegment(player[random].point[3]))
      .normalized();
    this.speed = new Vector(
      dir.x * this.defaultSpeed,
      dir.y * this.defaultSpeed
    );
  }

  update(rackets: Racket[], walls: Wall[], board: Board, timeRatio: number) {
    this.nextCollision.wall -= 1 * timeRatio;
    this.nextCollision.racket -= 1 * timeRatio;

    if (
      this.nextCollision.wall > this.nextCollision.racket &&
      this.nextCollision.racket < 1
    ) {
      for (let racket of rackets) {
        if (this.sat(racket)) {
          let angle = 0;
          let face;
          const index = rackets.indexOf(racket);
          if (rackets.length != 2) {
            face = this.getFace(index);
          } else {
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
          let norm = racket.point[2].vectorTo(racket.point[1]).normalized();
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
      let wallVector = wall.point[0].vectorTo(wall.point[2]);
      let Norm = wallVector.norm() * this.speed.norm();
      let angle = Math.acos(wallVector.product(this.speed) / Norm);
      let tmp = new Vector(this.speed.x, this.speed.y);
      let isAcute = angle <= Math.PI / 2;
      let outAngle = isAcute ? angle * 2 : (Math.PI - angle) * 2;
      let cosA = Math.cos(outAngle);
      let sinA = Math.sin(outAngle);
      [tmp.x, tmp.y] = [
        this.speed.x * cosA - this.speed.y * sinA,
        this.speed.x * sinA + this.speed.y * cosA,
      ];
      let angle2 = Math.acos(wallVector.product(tmp) / Norm);
      if (Math.abs(angle2 - angle) > 0.001) {
        [tmp.x, tmp.y] = [
          this.speed.x * cosA - this.speed.y * -sinA,
          this.speed.x * -sinA + this.speed.y * cosA,
        ];
      }
      this.speed = tmp;
      this.moveTo(this.speed, timeRatio);
      this.moveTo(this.speed, timeRatio);
      let index = this.nextCollision.wallIndex;
      if (rackets.length === 2) {
        if (index === 2) {
          rackets[1].hp--;
          this.replaceTo(board.board.center());
          this.goToRandomPlayer(rackets);
          this.calcNextCollision(rackets, walls, null);
        } else if (index === 0) {
          rackets[0].hp--;
          this.replaceTo(board.board.center());
          this.goToRandomPlayer(rackets);
          this.calcNextCollision(rackets, walls, null);
        } else {
          this.calcNextCollision(rackets, walls, this.nextCollision.wallIndex);
        }
      } else if (!Game.isSolo) {
        rackets[index].hp--;
        this.replaceTo(board.board.center());
        this.goToRandomPlayer(rackets);
        this.calcNextCollision(rackets, walls, null);
      } else {
        if (index === 0) {
          rackets[0].hp--;
          this.replaceTo(board.board.center());
          this.goToRandomPlayer(rackets);
        }
        this.calcNextCollision(rackets, walls, null);
      }
      return;
    }
    this.moveTo(this.speed, timeRatio);
  }
}

class Racket extends Entity {
  public defaultSpeed: number = 1.5;
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

  update(walls: Wall[], timeRatio: number) {
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
    for (let wall of walls) {
      if (this.sat(wall)) {
        this.moveTo(new Vector(-this.speed.x, -this.speed.y), timeRatio);
      }
    }
  }
}

function handleResize(game: Game) {
  game.updateGame();
}

const Canvas = () => {
  let router = useRouter();
  const canvasRef = useRef(null);
  const websockets = useWebsocketContext();

  if (canvasRef) {
    let game = new Game(
      Number(router.query.number_player),
      Number(router.query.position),
      router
    );

    useEffect(() => {
      if (websockets.pong?.connected)
      {
        Game.socket = websockets.pong
        game.init(canvasRef);
        const intervalId = setInterval(handleResize, 4, game);
        return () => {
          clearInterval(intervalId);
        };
      } else {
        game.init(canvasRef);
        const intervalId = setInterval(handleResize, 4, game);
        return () => {
          clearInterval(intervalId);  
        };
      }
    }, [websockets.pong?.connected]);
  }

  return <canvas width="1500" height="1500" ref={canvasRef} />;
};

// type Props = {
// 	ref: React.RefObject<HTMLCanvasElement> | undefined
//   }

export default Canvas;
