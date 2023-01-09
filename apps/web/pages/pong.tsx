import React, { useRef, useEffect, useState } from 'react'

enum Axe{
	X = 1,
	Y = 2
}

enum Key{
	UP = 38,
	DOWN = 40
}

enum Form{
	REC = 2,
	TRI = 3,
	SQR = 4,
	PEN = 5,
	HEX = 6
}

class Board {
	private	boardType = Form.REC;
	private	boardCanvasRef;
	private	boardCanvas;
	private	boardContext;
	private	countUpdate:number = 0;
	public	static point:number = 0;
	public	static live:number = 3;
	private	ball: Ball;
	private	player: Racket;
	private	cible: Target;
	public static keyPressed: [] = [];
	private	start = Date.now();
	private	wall:Wall = [];

	constructor() {
	}

	createRegularPolygon(point:Point,side:number,n:number) {
		let points = [];
		let angle = (-(360 - ((n - 2)*180)/n) * (Math.PI / 180))
		points[0] = new Point(point.x, point.y);
		let vector = point.vectorTo(new Point(points[0].x, points[0].y - side));
		for (let i:number = 0; i < n - 1; i++) {
			points[i + 1] = new Point(points[i].x, points[i].y);
			[vector.x, vector.y] = [-((vector.x * Math.cos(angle)) + (vector.y * Math.sin(angle))), ((vector.x * Math.sin(angle)) - (vector.y * Math.cos(angle)))]
			points[i + 1].x += vector.x;
			points[i + 1].y += vector.y;
		}
		return (points);
	}

	createWall(n:number) {
		let wall = [];
		if (n == 2) {
			wall.push(new Wall(this.createRect(0,0,this.boardCanvas.width,0.001))); // top wall
			wall.push(new Wall(this.createRect(0,0,0.001,this.boardCanvas.height))); // left wall
			wall.push(new Wall(this.createRect(0,this.boardCanvas.height,this.boardCanvas.width,0.001))); // bot wall
			wall.push(new Wall(this.createRect(this.boardCanvas.width,0,-0.001,this.boardCanvas.height))); // right wall
		} else {
		}
		return (wall);
	}

	createRect(x:number,y:number,w:number,h:number) {
		let point = [];
		point[0] = new Point(x,y);
		point[1] = new Point(x+w,y);
		point[2] = new Point(x+w,y+h);
		point[3] = new Point(x,y+h);
		return point;
	}

	init(ref) {
		this.boardCanvasRef = ref;
		this.boardCanvas = this.boardCanvasRef.current;
		this.boardContext = this.boardCanvas.getContext('2d');
		this.wall = this.createWall(this.boardType);
		console.log(this.wall);
		this.ball = new Ball(this.createRegularPolygon(new Point(window.innerWidth / 4, window.innerHeight / 4), 40, 5));
		this.player = new Racket(this.createRect(10, window.innerHeight / 4, 40, 100));
		this.cible = new Target(this.createRect(window.innerWidth / 3, window.innerHeight / 4, 20, 20));
		window.addEventListener("keydown",function(e){
			Board.keyPressed[e.which] = true;
		});
		window.addEventListener("keyup",function(e){
			Board.keyPressed[e.which] = false;
		});
	}

	updateBoard() {
		this.boardCanvas.width = window.innerWidth / 2
		this.boardCanvas.height = window.innerHeight / 2

		this.boardContext.fillStyle = "#666666"
		this.boardContext.fillRect(0, 0, this.boardCanvas.width, this.boardCanvas.height)
		this.boardContext.font = "14px sherif"
		this.boardContext.fillStyle = "#000000"
		this.boardContext.fillText(this.countUpdate + " Print from class Board : " + this.boardCanvas.width + " " + this.boardCanvas.height, 0 , 10)
		this.boardContext.font = "50px sherif";
		this.boardContext.fillText(Board.point, window.innerWidth / 4, 50)
		this.boardContext.fillText(Math.round((Date.now() - this.start) / 1000), window.innerWidth / 4, 110)
		this.boardContext.font = "20px sherif";
		for (let i:number = 0; i < Board.live; i++) {
			this.boardContext.fillText("❤️", (window.innerWidth / 4) + (25 * i), 160)
		}
		this.countUpdate++;
		this.ball.update(this.player, this.wall);
		this.player.update(this.ball);
		this.cible.update(this.ball);
		this.ball.draw(this.boardContext);
		this.ball.printPoint(this.boardContext, 0, 'red');
		this.ball.printPoint(this.boardContext, this.ball.point.length -  1, 'green');
		this.player.printPoint(this.boardContext, 1, 'red');
		this.player.printPoint(this.boardContext, 2, 'green');
		this.player.draw(this.boardContext);
		this.cible.draw(this.boardContext);
		this.ball.printPos(this.boardContext);
		this.player.printPos(this.boardContext);
		if (Board.live == 0) {
			Board.point = 0;
			Board.live = 3;
			this.start = Date.now();
		}
	}
}

class Vector {
	public	x;
	public	y;

	constructor(x:number,y:number) {
		this.x = x;
		this.y = y;
	}

	product(other) {
		return ((this.x * other.x) + (this.y * other.y));
	}

	perp() {
		return (new Vector(-this.y, this.x));
	}

	norm() {
		return (Math.sqrt((this.x * this.x) + (this.y * this.y)));
	}

	normalized() {
		return (new Vector(this.x / this.norm(), this.y / this.norm()));
	}

	add(other) {
		return (new Vector(this.x + other.x, this.y + other.y));
	}

	sub(other) {
		return (new Vector(this.x - other.x, this.y - other.y));
	}

	crossProduct(other) {
		return ((this.x * other.y) - (this.y * other.x))
	}
}

class Point {
	public	x;
	public	y;

	constructor(x:number,y:number) {
		this.x = x;
		this.y = y;
	}

	vectorTo(other:Point) {
		return (new Vector((other.x - this.x), (other.y - this.y)));
	}

	midSegment(other:Point) {
		return (new Point((this.x + other.x)/2, (this.y + other.y)/2));
	}

	intersect(to1,from2,to2) {
		let from1 = new Point(this.x, this.y);
		let v1 = from1.vectorTo(to1);
		let v2 = from2.vectorTo(to2);
		console.log(from1, to1, from2, to2, v1, v2);
		let vectorcentreraquettecentreball = from1.vectorTo(from2);
		let cp = vectorcentreraquettecentreball.crossProduct(v2);
		let othercp = v1.crossProduct(v2);
		if (othercp == 0) {
			return (null);
		}
		return (cp / othercp);
	}
}

class Entity {
	private	point:Point = [];
	private	speed:Vector;

	constructor(points) {
		let i = 0;
		for (let point of points) {
			this.point[i] = point;
			i++;
		}
	}

	printPoint(context, n:number, color) {
		context.beginPath();
		context.moveTo(this.point[n].x, this.point[n].y);
		context.lineTo(this.point[n].x + 2, this.point[n].y);
		context.lineTo(this.point[n].x + 2, this.point[n].y + 2);
		context.lineTo(this.point[n].x, this.point[n].y + 2);
		context.closePath();
		context.strokeStyle = color 
		context.stroke();
	}

	getx() {
		return (this.point[0].x);
	}

	gety() {
		return (this.point[0].y);
	}

	center() {
		if (this.point.length % 2) {
			let tmp = this.point[0].midSegment(this.point[1]);
			return (tmp.midSegment(this.point[Math.ceil(this.point.length/2)]));
		} else {
			return (this.point[0].midSegment(this.point[this.point.length/2]));
		}
	}

	replaceTo(point:Point) {
		let edges = this.getEdges();
		this.point[0] = point;
		for (let i = 0; i < this.point.length - 1; i++) {
			this.point[i + 1].x = this.point[i].x + edges[i].x;
			this.point[i + 1].y = this.point[i].y + edges[i].y;
		}
	}

	moveTo(dir:Vector) {
		for (let point of this.point) {
			point.x += dir.x;
			point.y += dir.y;
		}
	}

	sat(other:Entity) {
		let lines = this.getPerps().concat(other.getPerps());
		let amax;
		let amin;
		let bmax;
		let bmin;
		let dot;

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
			if ((amin < bmax && amin > bmin) || (bmin < amax && bmin > amin)) {
				continue;
			} else {
				return false;
			}
		}
		return true;
	}

	draw(context){
		context.beginPath();
		context.moveTo(this.getx(), this.gety());
		for (let point of this.point) {
			context.lineTo(point.x, point.y);
		}
		context.closePath();
		context.strokeStyle = 'white'
		context.stroke();
		context.fillStyle = 'white'
		context.fill();
	}

	printPos(context) {
		context.font = "14px sherif"
		context.fillStyle = "#000";
	}

	getEdges() {
		let edges = [];
		for (let i:number = 0; i < this.point.length - 1; i++) {
			edges.push(this.point[i].vectorTo(this.point[i + 1]));
		}
		edges.push(this.point.at(-1).vectorTo(this.point[0]));
		return (edges);
	}

	getPerps() {
		let edges = [];
		for (let i:number = 0; i < this.point.length - 1; i++) {
			edges.push((this.point[i].vectorTo(this.point[i + 1])).perp());
		}
		edges.push(this.point.at(-1).vectorTo(this.point[0]).perp());
		return (edges);
	}
}

class Wall extends Entity {
	constructor(points) {
		super(points);
	}
}

class Target extends Entity {
	private	speed:number = 0;

	constructor(points) {
		super(points);
	}

	draw(context){
		context.beginPath();
		context.moveTo(this.getx(), this.gety());
		for (let point of this.point) {
			context.lineTo(point.x, point.y);
		}
		context.closePath();
		context.strokeStyle = 'red'
		context.stroke();
		context.fillStyle = 'red'
		context.fill();
	}

	randomVal(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	update(ball:Ball) {
		if (this.sat(ball)/*this.collision(ball)*/) {
			Board.point++;
			this.replaceTo(new Point(this.randomVal(window.innerWidth / 4, (window.innerWidth / 2 - 30)), this.randomVal(30, ((window.innerHeight / 2) - 30))));
		}
	}
}

class Ball extends Entity {
	private defaultSpeed:number = 1;

	constructor(points) {
		super(points);
		this.speed = new Vector(2, 0);
	}

	DontHitWallX() {
		return (((this.point[0].x + this.speed.x) < ((window.innerWidth / 2) - 40)) && ((this.point[0].x + this.speed.x) > 0))
	}

	DontHitWallY() {
		return (((this.point[0].y + this.speed.y) < ((window.innerHeight / 2) - 40)) && ((this.point[0].y + this.speed.y) > 0))
	}

	getFace(p1, p2) {
		for (let i = 0; i < (this.point.length - 2); i++) {
			if (this.point[i].intersect(this.point[i + 1], p1, p2) === null) {
				return (this.point[i].midSegment(this.point[i + 1]));
			}
		}
			return (this.point[this.point.length - 1].midSegment(this.point[0]));
	}

	update(racket:Racket, walls) {
		if (this.sat(racket)) {
			let angle = 0;
			let face = this.getFace(racket.point[2], racket.point[1]);
			let ratio = racket.point[2].intersect(racket.point[1], this.center(), face)
			console.log(this.center());
			console.log(this.point[2]);
			console.log(this.point[3]);
	//		console.log(this.point[0]);
	//		console.log(this.point[5]);
			console.log(face);
			console.log(ratio);
			if (ratio > 1)
				ratio = 1;
			if (ratio < 0)
				ratio = 0;
			angle = -(Math.PI/4 + (Math.PI/2 * (1 - ratio)));
			let norm = racket.point[2].vectorTo(racket.point[1]).normalized();
			[norm.x, norm.y] = [((norm.x * Math.cos(angle)) + (norm.y * Math.sin(angle))), (-(norm.x * Math.sin(angle)) + (norm.y * Math.cos(angle)))]
			this.speed = new Vector(norm.x * this.speed.norm(), norm.y * this.speed.norm());	
			this.moveTo(this.speed);
		} else {
			for (let wall of walls) {
				if (this.sat(wall)) {
					let wallVector = wall.point[0].vectorTo(wall.point[2]);
					let Norm = wallVector.norm() * this.speed.norm();
					let angle = Math.acos(wallVector.product(this.speed)/Norm);
					let tmp = new Vector(this.speed.x, this.speed.y);
					let isAcute = angle <= (Math.PI / 2);
					let outAngle = isAcute ?  angle * 2 : (Math.PI - angle) * 2;
					let cosA = Math.cos(outAngle);
					let sinA = Math.sin(outAngle);
					[tmp.x, tmp.y] = [((this.speed.x * cosA) - (this.speed.y * sinA)), ((this.speed.x * sinA) + (this.speed.y * cosA))]
					let angle2 = Math.acos(wallVector.product(tmp)/Norm);
					if ((Math.abs(angle2 - angle) > 0.01)
						|| (Math.abs(angle2 - (Math.PI / 2)) < 0.001 && (((this.speed.x > 0 && tmp.x > 0) || (this.speed.x < 0 && tmp.x < 0))
							&&  ((this.speed.x > 0 && tmp.x > 0) || (this.speed.x < 0 && tmp.x < 0)))))
					{
						[tmp.x, tmp.y] = [((this.speed.x * cosA) - (this.speed.y * -sinA)), ((this.speed.x * -sinA) + (this.speed.y * cosA))]
					}
					this.speed = tmp//(wall.point[0].vectorTo(wall.point[2])).perp().normalized().sub(this.speed);
			//		this.replaceTo(new Point(window.innerWidth / 4, window.innerHeight / 4));
			//		this.speed.x = 0;
			//		this.speed.y = 0;
				}
			}
			this.moveTo(this.speed);
		}
	}
}

class Racket extends Entity {
	constructor(points) {
		super(points);
		this.speed = new Vector(0, 1);
	}

	update(ball:Ball) {
		if (Board.keyPressed[Key.UP] && Board.keyPressed[Key.DOWN]) {
		} else 
		if (Board.keyPressed[Key.UP]) {
			this.moveTo(new Vector(0, -this.speed.y))
		} else if (Board.keyPressed[Key.DOWN]) {
			this.moveTo(new Vector(0, this.speed.y))
		}
		if (this.gety() < 0)
			this.replaceTo(new Point(this.getx(), 0))
		if (this.gety() + 100 > (window.innerHeight / 2)) {
			this.replaceTo(new Point(this.getx(), ((window.innerHeight / 2) - 100)));
		}
	}
}

const Canvas = props => {
	const canvasRef = useRef(null);
	let game = new Board();
	function handleResize() {
		game.updateBoard();
		requestAnimationFrame(handleResize);
	}

	useEffect(() => {
		game.init(canvasRef);
		handleResize();
		window.addEventListener('resize', handleResize);
	}, [])

	return <canvas width='1500' height='1500' ref={canvasRef}/>
}

export default Canvas
