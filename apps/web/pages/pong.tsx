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

	constructor() {
	}

	createRegularPolygon(point:Point,side:number,n:number) {
		let points = [];
		let angle = (-(360 - ((n - 2)*180)/n) * (Math.PI / 180))
		points[n - 1] = new Point(point.x, point.y - side);
		let vector = point.vectorTo(points[n-1]);
		for (let i:number = n - 1; i > 0; i--) {
			points[i - 1] = (new Point(points[i].x, points[i].y));
			[vector.x, vector.y] = [-((vector.x * Math.cos(angle)) + (vector.y * Math.sin(angle))), ((vector.x * Math.sin(angle)) - (vector.y * Math.cos(angle)))]
			points[i - 1].x += vector.x;
			points[i - 1].y += vector.y;
		}
		return (points);
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
		this.test = new Ball(this.createRegularPolygon(new Point(window.innerWidth / 5, window.innerHeight / 5), 10, 42));
		console.log(this.test.point);
		this.test.draw(this.boardContext);
		this.ball = new Ball(this.createRect(window.innerWidth / 4, window.innerHeight / 4, 40, 40));
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
		this.test.draw(this.boardContext);
		this.test.printPoint(this.boardContext, 0, 'red');
		this.test.printPoint(this.boardContext, this.test.point.length - 1, 'green');
		this.countUpdate++;
		this.ball.update(this.player);
		this.player.update(this.ball);
		this.cible.update(this.ball);
		this.ball.draw(this.boardContext);
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
}

class Entity {
	private	point:Point = [];
	private	xspeed;
	private	yspeed;

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

class Target extends Entity {
	private	speed:number = 0;

	constructor(x:number,y:number,w:number,h:number) {
		super(x,y,w,h);
		this.xspeed = this.speed;
		this.yspeed = this.speed;
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
	private	speed:number = 1;

	constructor(x:number,y:number,w:number,h:number) {
		super(x,y,w,h);
		this.xspeed = this.speed;
		this.yspeed = this.speed;
	}

	DontHitWallX() {
		return (((this.point[0].x + this.xspeed) < ((window.innerWidth / 2) - 40)) && ((this.point[0].x + this.xspeed) > 0))
	}

	DontHitWallY() {
		return (((this.point[0].y + this.yspeed) < ((window.innerHeight / 2) - 40)) && ((this.point[0].y + this.yspeed) > 0))
	}

	update(racket:Racket) {
		if (this.sat(racket)) {
			this.xspeed = -this.xspeed;
			this.moveTo(new Vector(this.xspeed, this.yspeed));
			if (this.xspeed > 0) {
				this.xspeed += racket.speed;
			} else {
				this.xspeed -= racket.speed;
			}
		} else {
			if (this.xspeed > 0) {
				this.xspeed = this.speed;
			} else {
				this.xspeed = -this.speed;
			}
			if (this.yspeed > 0) {
				this.yspeed = this.speed;
			} else {
				this.yspeed = -this.speed;
			}
			if (this.getx() + this.xspeed <= 0) {
				Board.live--;
				this.replaceTo(new Point(window.innerWidth / 4, window.innerHeight / 4));
			}
			if (this.DontHitWallX()) {
			} else {
				this.xspeed = -this.xspeed;
			}
			if (this.DontHitWallY()) {
			} else {
				this.yspeed = -this.yspeed;
			}
			this.moveTo(new Vector(this.xspeed, this.yspeed));
		}
	}
}

class Racket extends Entity {
	private speed:number = 1;

	constructor(x:number,y:number,w:number,h:number) {
		super(x,y,w,h);
		this.xspeed = this.speed;
		this.yspeed = 0;
	}

	update(ball:Ball) {
		if (Board.keyPressed[Key.UP] && Board.keyPressed[Key.DOWN]) {
		} else 
		if (Board.keyPressed[Key.UP]) {
			this.moveTo(new Vector(0, -this.speed))
		} else if (Board.keyPressed[Key.DOWN]) {
			this.moveTo(new Vector(0, this.speed))
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
