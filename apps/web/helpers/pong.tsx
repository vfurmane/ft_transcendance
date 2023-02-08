import { GameState, PlayerInterface } from 'types'
import { io } from 'socket.io-client'

import React, {
  useRef,
  useEffect,
} from "react";
import Router, { NextRouter, useRouter } from 'next/router';
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
  public ballWidth! : number;

  public board!: Board;
  public countUpdate: number = 0;
  public static point: number = 0;
  public static live: number = 3;
  public ball!: Ball;
  public player: Racket[] = [];
  public cible!: Target;
  public static keyPressed = { up: false, down: false };
  public start = Date.now();
  public color: string[] = ["blue", "red", "orange", "white", "pink", "black"];
  public static position : number;
  public static socket : any;
  public static scoreMax : number = 10;
  public static changeLife :  (index : number) => void;
 

  

  constructor(number_player:number, position:number, private router:NextRouter, changeLife : (index : number) => void) {
    this.boardType = number_player;
    Game.position = position;
    Game.changeLife = changeLife;
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

  createRacket(isSolo: boolean, wall: Wall[]) {
    this.ballWidth = this.board.wallSize * 0.00625;
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
          wallCenter.x + wallPerp.x * 10,
          wallCenter.y + wallPerp.y * 10
        );
        let p3 = new Point(
          racketCenter.x - wallDir.x * (this.board.wallSize * 0.05 ),
          racketCenter.y - wallDir.y * (this.board.wallSize * 0.05 )
        );
        let p0 = new Point(
          racketCenter.x + wallDir.x * (this.board.wallSize * 0.05),
          racketCenter.y + wallDir.y * (this.board.wallSize * 0.05)
        );
        let p1 = new Point(p0.x + wallPerp.x * (this.ballWidth), p0.y + wallPerp.y * (this.ballWidth));
        let p2 = new Point(p3.x + wallPerp.x * (this.ballWidth), p3.y + wallPerp.y * (this.ballWidth ));
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
    this.boardCanvasRef = ref;
    this.boardCanvas = this.boardCanvasRef.current;
    if (!this.boardCanvas) return;
    this.boardContext = this.boardCanvas.getContext("2d");
    this.boardCanvas.width = window.innerWidth * 0.6;
    this.boardCanvas.height = (window.innerWidth * 0.6) * (1 / 2);
    this.board = new Board(this.boardType, this.boardCanvas);
    this.ballWidth = this.board.wallSize * 0.00625;
    if (this.boardType != Form.REC) {
      this.player = this.createRacket(this.isSolo, this.board.wall);
      this.ball = new Ball(
        this.createRegularPolygon(
          this.board.board.center(),
          this.ballWidth,
          this.boardType
        ),
        this.player
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
          this.ballWidth,
          this.ballWidth
        ),
        this.player
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
    this.boardCanvas!.width = window.innerWidth * 0.6;
    this.boardCanvas!.height = (window.innerWidth * 0.6) * (1 / 2);
    let tmp = this.ballWidth;
    this.board = new Board(this.boardType, this.boardCanvas);
    if (this.boardType != Form.REC) {
      this.player = this.createRacket(this.isSolo, this.board.wall);
    } else {
      this.player = this.createRacket(this.isSolo, [
        this.board.wall[0],
        this.board.wall[2],
      ]);
    }
    if (this.isSolo)
      this.cible = new Target(
        this.createRect(
          this.boardCanvas!.width * (2 / 3),
          this.boardCanvas!.height / 2,
          20,
          20
        )
      );
      if (this.ballWidth !== tmp)
      {
        if (this.boardType !== Form.REC)
        {
          this.ball = new Ball(
            this.createRegularPolygon(
              this.ball.center(),
              this.ballWidth,
              this.boardType
            ),
            this.player
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
            this.player
          );
        }
      }
    if (!this.boardType) {
      return ;
    }
    this.boardContext!.fillStyle = "#666666";
    this.board.board.draw(this.boardContext, "#1e1e1e");
    this.boardContext!.font = "14px sherif";
    this.boardContext!.fillStyle = "#fff";

    // Draw the net (Line in the middle)
    if (this.player.length === 2)
    {
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
    this.ball.update(this.player, this.board.wall, this.board);
    for (let p of this.player) p.update(this.ball, this.board.wall);
    if (this.isSolo) this.cible.update(this.ball, this.boardCanvas);
    for (let wall of this.board.wall) {
      wall.draw(this.boardContext, undefined);
    }
    this.ball.draw(this.boardContext, undefined);
    for (let p of this.player) {
      p.draw(this.boardContext, p.color);
    }
    if (this.isSolo) this.cible.draw(this.boardContext);
    if (Game.live === 0) {
      Game.point = 0;
      Game.live = 3;
      this.start = Date.now();
    }
  }
}

class Board {
  public board!: Entity;
  public wall!: Wall[];
  public wallSize!: number;

  constructor(boardType: number, canvas: HTMLCanvasElement | null) {
    let height = 0;
    let size = 1;
    if (boardType == Form.HEX || boardType == Form.PEN) {
      height = canvas!.height / 4;
      size = 0.5;
    }
    this.wallSize = Math.min(canvas!.width * size, canvas!.height * size);
    if (boardType != Form.REC)
      this.board = new Entity(
        this.createRegularPolygon(
          new Point(0, height),
          this.wallSize,
          boardType
        )
      );
    else
      this.board = new Entity(
        this.createRect(
          0,
          0,
          (canvas!.width),
          (canvas!.height)
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
    return new Point((this.x + other?.x) / 2, (this.y + other?.y) / 2);
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

  moveTo(dir: Vector) {
    for (let point of this.point) {
      point.x += dir.x;
      point.y += dir.y;
    }
  }

  sat(other: Entity) {
    let lines: Vector[] = this.getPerps().concat(other.getPerps());
    let amax: number | null;
    let amin: number | null;
    let bmax: number | null;
    let bmin: number | null;
    let dot: number | null;

    for (let line of lines) {
      amax = null;
      amin = null;
      bmax = null;
      bmin = null;
      for (let point of this.point) {
        dot = line.product(point);
        if (amax === null || dot > amax) {
          amax = dot;
        }
        if (amin === null || dot < amin) {
          amin = dot;
        }
      }
      for (let point of other.point) {
        dot = line.product(point);
        if (bmax === null || dot > bmax) {
          bmax = dot;
        }
        if (bmin === null || dot < bmin) {
          bmin = dot;
        }
      }
      if (
        amin != null &&
        bmax != null &&
        bmin != null &&
        amax != null &&
        ((amin < bmax && amin > bmin) || (bmin < amax && bmin > amin))
      ) {
        continue;
      } else {
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
    let edges: Vector[] = [];
    for (let i: number = 0; i < this.point.length - 1; i++) {
      edges.push(this.point[i].vectorTo(this.point[i + 1]).perp());
    }
    edges.push(this.point.at(-1)!.vectorTo(this.point[0]).perp());
    return edges;
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

  constructor(points: Point[], player: Racket[]) {
    super(points);
    this.goToRandomPlayer(player);
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

  update(rackets: Racket[], walls: Wall[], board: Board) {
    if (!this.sat(board.board)) {
      this.replaceTo(board.board.center());
    }
    for (let racket of rackets) {
      if (this.sat(racket)) {
        let angle = 0;
        let face;
        if (rackets.length != 2) {
          face = this.getFace(rackets.indexOf(racket));
        } else {
          let index = rackets.indexOf(racket);
          if (index == 1) face = this.getFace(2);
          else face = this.getFace(0);
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
        this.moveTo(this.speed);
        return;
      }
    }
    for (let wall of walls) {
      if (this.sat(wall)) {
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
        this.moveTo(this.speed);
        this.moveTo(this.speed);
        let index = walls.indexOf(wall);
        if (rackets.length === 2) {
          if (index === 2) {
            rackets[1].hp--;
            this.replaceTo(board.board.center());
            this.goToRandomPlayer(rackets);
            Game.changeLife(1);
          } else if (index === 0) {
            rackets[0].hp--;
            this.replaceTo(board.board.center());
            this.goToRandomPlayer(rackets);
            Game.changeLife(0);
          }
        } else {
          rackets[index].hp--;
          this.replaceTo(board.board.center());
          this.goToRandomPlayer(rackets);
          Game.changeLife(index);
        }
        return;
      }
    }
    this.moveTo(this.speed);
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

  update(ball: Ball, walls: Wall[]) {
    if (this.index == Game.position) {
      if (Game.keyPressed.up && Game.keyPressed.down) {
      } else if (Game.keyPressed.up) {
        this.speed = new Vector(
          this.dir.x * this.defaultSpeed,
          this.dir.y * this.defaultSpeed
        );
        this.moveTo(this.speed);
        Game.socket.emit('up');
      } else if (Game.keyPressed.down) {
        this.speed = new Vector(
          -this.dir.x * this.defaultSpeed,
          -this.dir.y * this.defaultSpeed
        );
        this.moveTo(this.speed);
        Game.socket.emit('down');
      }
    }
  }
}


export default Game;
