import { Point } from "./point.class";

export class Vector {
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
