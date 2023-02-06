import { Point } from './point.class';
import { Entity } from './entity.class';

export class Wall extends Entity {
    constructor(p1: Point, p2: Point) {
      let p0 = new Point(p1.x - 1, p1.y);
      let p3 = new Point(p2.x, p2.y - 1);
      super([p0, p1, p2, p3]);
    }
}