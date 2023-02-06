import { Vector } from './vector.class'

export class Point {
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