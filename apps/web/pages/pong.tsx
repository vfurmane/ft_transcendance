import { GameState, PlayerInterface } from "types";
import { io, Socket } from "socket.io-client";

import React, { useRef, useEffect } from "react";
import Router, { NextRouter, useRouter } from "next/router";
import { time } from "console";
import { useWebsocketContext } from "../components/Websocket";

enum Axe {
  X = 1,
  Y = 2,
}

enum Key {
  UP = 38,
  DOWN = 40,
}

enum Form {
  REC = 2,
  TRI = 3,
  SQR = 4,
  PEN = 5,
  HEX = 6,
}

class Game {
  public isSolo: boolean = false;
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
    number_player: number,
    position: number,
    private router: NextRouter
  ) {
    this.boardType = number_player;
    Game.position = position;
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

  createRacket(isSolo: boolean, wall: Wall[]) {
    if (isSolo) {
      return [
        new Racket(
          0,
          this.createRect(10, this.boardCanvas!.height / 2, 10, 40),
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

  init(ref: React.RefObject<HTMLCanvasElement> | undefined, socket : Socket) {
    if (ref === undefined) return;
    Game.socket.on("refresh", (state: GameState) => {
      Game.count = 0;
      if (!this.board) {
        return;
      }
      console.log("=-=-=-=-=-=REFRESHING=-=-=-=-=-=" + (Date.now() - this.start))
      this.refresh(state);
    });
    Game.socket.on("endGame", () => {
        console.error("Fin de partie");
        Game.socket.off("endGame")
        Game.socket.off("refresh")
        this.router.replace("/");
    });
    this.boardCanvasRef = ref;
    this.boardCanvas = this.boardCanvasRef.current;
    if (!this.boardCanvas) return;
    this.boardContext = this.boardCanvas.getContext("2d");
    this.boardCanvas.width = 1920; //window.innerWidth * 0.9;
    this.boardCanvas.height = 1080; //window.innerHeight * 0.9;
    this.board = new Board(this.boardType, this.boardCanvas);
    if (this.boardType != Form.REC) {
      this.player = this.createRacket(this.isSolo, this.board.wall);
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
      this.player = this.createRacket(this.isSolo, [
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
    if (this.isSolo)
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
    // console.log("START AT :" + Date.now())
    this.boardCanvas!.width = 1920; //window.innerWidth * 0.9;
    this.boardCanvas!.height = 1080; //window.innerHeight * 0.9;
    const time = Math.round(Date.now() - this.start);

    if (!this.boardType) {
      return;
    }
    // for (let p of this.player) {
    //   if (p.hp == 0) {
    //     if (this.boardType == Form.REC) {
    //       this.boardType = 0;
    //       return ;
    //     } else {
    //       this.player.splice(p.index, 1);
    //       for (let i = 0; i < this.player.length; i++) {
    //         if (this.player[i].index > p.index) {
    //           this.player[i].index--;
    //         }
    //       }
    //       this.boardType--;
    //     }
    //     this.init(this.boardCanvasRef);
    //   }
    // }
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
      player.update(this.ball, this.board.wall, timeRatio)
    );
    if (this.isSolo) this.cible.update(this.ball, this.boardCanvas);
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
    if (this.isSolo) this.cible.draw(this.boardContext);
    if (Game.live == 0) {
      Game.point = 0;
      Game.live = 3;
      this.start = Date.now();
    }
    this.lastUpdate = Date.now() - this.start;
  }
}

class Board {
  public board!: Entity;
  public wall!: Wall[];

  constructor(boardType: number, canvas: HTMLCanvasElement | null) {
    let height = 0;
    let size = 1;
    if (boardType == Form.HEX || boardType == Form.PEN) {
      height = canvas!.height / 4;
      size = 0.5;
    }
    if (boardType != Form.REC)
      this.board = new Entity(
        this.createRegularPolygon(
          new Point(0, height),
          canvas!.height * size,
          boardType
        )
      );
    else
      this.board = new Entity(
        this.createRect(
          0,
          0,
          (canvas!.height / 4) * 4,
          (canvas!.height / 4) * 3
        )
      );
    this.wall = this.createWall(this.board);
  }

  createRegularPolygon(point: Point, side: number, n: number) {
    let points: Point[] = [];
    let angle: number = -(360 - ((n - 2) * 180) / n) * (Math.PI / 180);
    points[0] = new Point(point.x, point.y);
    let vector: Vector = point.vectorTo(
      new Point(points[0].x, points[0].y - side)
    );
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

  createRect(x: number, y: number, w: number, h: number) {
    let point: Point[] = [];
    point[0] = new Point(x, y);
    point[1] = new Point(x + w, y);
    point[2] = new Point(x + w, y + h);
    point[3] = new Point(x, y + h);
    return point;
  }

  createWall(board: Entity) {
    let wall: Wall[] = [];
    wall.push(new Wall(board.point[board.point.length - 1], board.point[0]));
    for (let i = 0; i < board.point.length - 1; i++) {
      wall.push(new Wall(board.point[i], board.point[i + 1]));
    }
    return wall;
  }
}

class Vector {
  constructor(public x: number, public y: number) {}

  product(other: Vector | Point) {
    return this.x * other.x + this.y * other.y;
  }

  perp() {
    return new Vector(-this.y, this.x);
  }

  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalized() {
    return new Vector(this.x / this.norm(), this.y / this.norm());
  }

  add(other: Vector | Point) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  sub(other: Vector | Point) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  crossProduct(other: Vector) {
    return this.x * other.y - this.y * other.x;
  }
}

class Point {
  constructor(public x: number, public y: number) {}

  vectorTo(other: Point) {
    return new Vector(other.x - this.x, other.y - this.y);
  }

  midSegment(other: Point) {
    return new Point((this.x + other.x) / 2, (this.y + other.y) / 2);
  }

  intersect(to1: Point, from2: Point, to2: Point) {
    let from1 = new Point(this.x, this.y);
    let v1 = from1.vectorTo(to1);
    let v2 = from2.vectorTo(to2);
    let vectorcentreraquettecentreball = from1.vectorTo(from2);
    let cp = vectorcentreraquettecentreball.crossProduct(v2);
    let othercp = v1.crossProduct(v2);
    if (othercp === 0) {
      return 0;
    }
    return cp / othercp;
  }
}

class Entity {
  public speed!: Vector;

  constructor(public point: Point[]) {}

  getSpeed() {
    return this.speed;
  }

  printPoint(
    context: CanvasRenderingContext2D | null,
    n: number,
    color: string
  ) {
    context!.beginPath();
    context!.moveTo(this.point[n].x, this.point[n].y);
    context!.lineTo(this.point[n].x + 5, this.point[n].y);
    context!.lineTo(this.point[n].x + 5, this.point[n].y + 5);
    context!.lineTo(this.point[n].x, this.point[n].y + 5);
    context!.closePath();
    context!.strokeStyle = color;
    context!.fillStyle = color;
    context!.stroke();
    context!.fill();
  }

  getx() {
    return this.point[0].x;
  }

  gety() {
    return this.point[0].y;
  }

  center() {
    if (this.point.length == 3) {
      return new Point(
        (this.point[0].x + this.point[1].x + this.point[2].x) / 3,
        (this.point[0].y + this.point[1].y + this.point[2].y) / 3
      );
    }
    if (this.point.length % 2) {
      let tmp = this.point[0].midSegment(this.point[1]);
      return tmp.midSegment(this.point[Math.ceil(this.point.length / 2)]);
    } else {
      return this.point[0].midSegment(this.point[this.point.length / 2]);
    }
  }

  replaceTo(point: Point) {
    let edges = this.getEdges();
    this.point[0] = point;
    for (let i = 0; i < this.point.length - 1; i++) {
      this.point[i + 1].x = this.point[i].x + edges[i].x;
      this.point[i + 1].y = this.point[i].y + edges[i].y;
    }
  }

  moveTo(dir: Vector, ratio: number) {
    for (let point of this.point) {
      point.x += dir.x * ratio;
      point.y += dir.y * ratio;
    }
  }

  sat(other: Entity) {
    let lines: Vector[] = [...this.getPerps(), ...other.getPerps()];
    let amax: number;
    let amin: number;
    let bmax: number;
    let bmin: number;
    let dot: number;

    for (let line of lines) {
      amax = line.product(this.point[0]);
      amin = amax;
      bmax = line.product(other.point[0]);
      bmin = bmax;
      for (let point of this.point) {
        dot = line.product(point);
        if (dot > amax) {
          amax = dot;
        } else if (dot < amin) {
          amin = dot;
        }
      }
      for (let point of other.point) {
        dot = line.product(point);
        if (dot > bmax) {
          bmax = dot;
        } else if (dot < bmin) {
          bmin = dot;
        }
      }
      if (!((amin < bmax && amin > bmin) || (bmin < amax && bmin > amin))) {
        return false;
      }
    }
    return true;
  }

  draw(context: CanvasRenderingContext2D | null, color: string | undefined) {
    if (color === undefined) color = "white";
    context!.beginPath();
    context!.moveTo(this.getx(), this.gety());
    for (let point of this.point) {
      context!.lineTo(point.x, point.y);
    }
    context!.closePath();
    context!.strokeStyle = color;
    context!.stroke();
    context!.fillStyle = color;
    context!.fill();
  }

  printPos(context: CanvasRenderingContext2D | null) {
    context!.font = "14px sherif";
    context!.fillStyle = "#000";
  }

  getEdges() {
    let edges: Vector[] = [];
    for (let i: number = 0; i < this.point.length - 1; i++) {
      edges.push(this.point[i].vectorTo(this.point[i + 1]));
    }
    edges.push(this.point.at(-1)!.vectorTo(this.point[0]));
    return edges;
  }

  getPerps() {
    const lengthM1 = this.point.length - 1;
    return this.point.map((point, index, array) =>
      index !== lengthM1
        ? point.vectorTo(array[index + 1]).perp()
        : point.vectorTo(array[0]).perp()
    );
  }
}

class Wall extends Entity {
  constructor(p1: Point, p2: Point) {
    let p0 = new Point(p1.x - 1, p1.y);
    let p3 = new Point(p2.x, p2.y - 1);
    super([p0, p1, p2, p3]);
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
  public nextCollision: { wall: number; wallIndex: number; racket: number } = {
    wall: 0,
    wallIndex: 0,
    racket: 0,
  };

  constructor(points: Point[], player: Racket[], walls: Wall[]) {
    super(points);
    this.goToRandomPlayer(player);
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

    // if (!this.sat(board.board)) {
    //   this.replaceTo(board.board.center());
    //   this.moveTo(this.speed, timeRatio);
    //   this.calcNextCollision(rackets, walls, null);
    //   return ;
    // }
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
      } else {
        rackets[index].hp--;
        this.replaceTo(board.board.center());
        this.goToRandomPlayer(rackets);
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

  update(ball: Ball, walls: Wall[], timeRatio: number) {
    if (this.index == Game.position) {
      if (Game.keyPressed.up && Game.keyPressed.down) {
      } else if (Game.keyPressed.up) {
        this.speed = new Vector(
          this.dir.x * this.defaultSpeed,
          this.dir.y * this.defaultSpeed
        );
        this.moveTo(this.speed, timeRatio);
        Game.socket.emit("up");
      } else if (Game.keyPressed.down) {
        this.speed = new Vector(
          -this.dir.x * this.defaultSpeed,
          -this.dir.y * this.defaultSpeed
        );
        this.moveTo(this.speed, timeRatio);
        Game.socket.emit("down");
      }
    } //else {
    //   if (
    //     this.center().vectorTo(ball.point[0]).norm() >
    //     new Point(
    //       this.center().x + this.dir.x * this.defaultSpeed,
    //       this.center().y + this.dir.y * this.defaultSpeed
    //     )
    //       .vectorTo(ball.point[0])
    //       .norm()
    //   ) {
    //     this.speed = new Vector(
    //       this.dir.x * this.defaultSpeed,
    //       this.dir.y * this.defaultSpeed
    //     );
    //     this.moveTo(this.speed);
    //   } else {
    //     this.speed = new Vector(
    //       -this.dir.x * this.defaultSpeed,
    //       -this.dir.y * this.defaultSpeed
    //     );
    //     this.moveTo(this.speed);
    //   }
    // }
    // for (let wall of walls) {
    //   if (this.sat(wall)) {
    //     this.moveTo(new Vector(-this.speed.x, -this.speed.y));
    //   }
    // }
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
        game.init(canvasRef, websockets.pong);
        const intervalId = setInterval(handleResize, 4, game);
        return () => {
          console.log("CLEARED INTERVAL");
          clearInterval(intervalId);
        };
      }
      else
      {
        console.error("Cannot play pong")
        router.replace("/")
      }
    }, [websockets.pong?.connected]);
  }

  return <canvas width="1500" height="1500" ref={canvasRef} />;
};

// type Props = {
// 	ref: React.RefObject<HTMLCanvasElement> | undefined
//   }

export default Canvas;
