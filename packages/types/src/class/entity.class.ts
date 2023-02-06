import { Vector } from './vector.class'
import { Point } from './point.class'

export class Entity {
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