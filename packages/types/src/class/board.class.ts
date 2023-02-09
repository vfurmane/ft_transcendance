import { Entity } from "./entity.class";
import { Point } from "./point.class";
import { Vector } from "./vector.class";
import { Wall } from "./wall.class";
import { Form } from "../enums/pong.enums";

export class Board {
  public board!: Entity;
  public wall!: Wall[];
  public wallSize!: number;


  constructor(boardType: number, canvas: any) {
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
        this.createRect(0, 0, canvas!.width, canvas!.height)
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
