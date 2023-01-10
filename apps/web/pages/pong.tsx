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
	private	playerNumber = 1;
	private	boardType = Form.REC;
	private	boardCanvasRef;
	private	boardCanvas;
	private	boardContext;
	private	board;
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
			wall.push(new Wall(new Point(0,0), new Point(this.boardCanvas.width,0))); // top wall
			wall.push(new Wall(new Point(0,this.boardCanvas.height), new Point(0,0))); // left wall
			wall.push(new Wall(new Point(this.boardCanvas.width,this.boardCanvas.height), new Point(0,this.boardCanvas.height))); // bot wall
			wall.push(new Wall(new Point(this.boardCanvas.width,0), new Point(this.boardCanvas.width,this.boardCanvas.height))); // right wall
		//	wall.push(new Wall(new Point(this.boardCanvas.width/2, 0), new Point(this.boardCanvas.width, this.boardCanvas.height / 2)));
		//	wall.push(new Wall(new Point(this.boardCanvas.width, this.boardCanvas.height/2), new Point(this.boardCanvas.width/2, this.boardCanvas.height)));
		//	wall.push(new Wall(new Point(this.boardCanvas.width/2, this.boardCanvas.height), new Point(0, this.boardCanvas.height / 2)));
		//	wall.push(new Wall(new Point(0, this.boardCanvas.height / 2), new Point(this.boardCanvas.width / 2, 0)));
		} else {

		}
		return (wall);
	}

	createRacket(n:number) {
		if (n == 1) {
			return ([new Racket(this.createRect(10, this.boardCanvas.height / 2, 40, 100))/*, new Racket(this.createRect(this.boardCanvas.width - 10, this.boardCanvas.height / 2 + 100, -40, -100)), new Racket([new Point(this.boardCanvas.width/2+100, 10), new Point(this.boardCanvas.width/2+100, 50), new Point(this.boardCanvas.width/2,50), new Point(this.boardCanvas.width/2,10)]), new Racket([new Point(this.boardCanvas.width/2, this.boardCanvas.height - 10), new Point(this.boardCanvas.width/2, this.boardCanvas.height - 50), new Point(this.boardCanvas.width/2 + 100,this.boardCanvas.height - 50), new Point(this.boardCanvas.width/2 + 100,this.boardCanvas.height - 10)])*/]);
		}
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
		this.boardCanvas.width = window.innerWidth * 0.9;
		this.boardCanvas.height = window.innerHeight * 0.9;
		this.board = new Entity(this.createRegularPolygon(new Point(10, 0), this.boardCanvas.height * 1, 3));
		this.wall = this.createWall(this.boardType);
		this.ball = new Ball(this.createRegularPolygon(new Point(this.boardCanvas.width / 2, this.boardCanvas.height / 2), 40, 4));
		this.player = this.createRacket(this.playerNumber);
		this.cible = new Target(this.createRect(this.boardCanvas.width * (2 / 3), this.boardCanvas.height / 2, 20, 20));
		window.addEventListener("keydown",function(e){
			Board.keyPressed[e.which] = true;
		});
		window.addEventListener("keyup",function(e){
			Board.keyPressed[e.which] = false;
		});
	}

	updateBoard() {
		this.boardCanvas.width = window.innerWidth * 0.9
		this.boardCanvas.height = window.innerHeight * 0.9

		this.boardContext.fillStyle = "#666666"
		this.boardContext.fillRect(0, 0, this.boardCanvas.width, this.boardCanvas.height)
		this.boardContext.font = "14px sherif"
		this.boardContext.fillStyle = "#000000"
		this.boardContext.fillText(Math.round(this.countUpdate / (Math.round((Date.now() - this.start) / 1000))) + " Print from class Board : " + this.boardCanvas.width + " " + this.boardCanvas.height, 0 , 10)
		this.boardContext.font = "50px sherif";
		this.boardContext.fillText(Board.point, this.boardCanvas.width / 2, 50)
		this.boardContext.fillText(Math.round((Date.now() - this.start) / 1000), this.boardCanvas.width / 2, 110)
		this.boardContext.font = "20px sherif";
		for (let i:number = 0; i < Board.live; i++) {
			this.boardContext.fillText("❤️", (this.boardCanvas.width / 2) + (25 * i), 160)
		}
		this.countUpdate++;
		this.ball.update(this.player, this.wall);
		for (let p of this.player)
			p.update(this.ball, this.wall);
		this.cible.update(this.ball, this.boardCanvas);
		for (let wall of this.wall) {
			wall.draw(this.boardContext);
		}
		this.ball.draw(this.boardContext);
		this.ball.printPoint(this.boardContext, 0, 'red');
		this.ball.printPoint(this.boardContext, this.ball.point.length -  1, 'green');
		for (let p of this.player) {
			p.draw(this.boardContext);
			p.printPoint(this.boardContext, 1, 'red');
			p.printPoint(this.boardContext, 2, 'green');
		}
		this.cible.draw(this.boardContext);
		if (Board.live == 0) {
			Board.point = 0;
			Board.live = 3;
			this.start = Date.now();
		}
		this.board.draw(this.boardContext);
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
		context.lineTo(this.point[n].x + 5, this.point[n].y);
		context.lineTo(this.point[n].x + 5, this.point[n].y + 5);
		context.lineTo(this.point[n].x, this.point[n].y + 5);
		context.closePath();
		context.strokeStyle = color 
		context.fillStyle = color;
		context.stroke();
		context.fill();
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
	constructor(p1, p2) {
		let p0 = new Point(p1.x - 1, p1.y);
		let p3 = new Point(p2.x, p2.y - 1);
		super([p0, p1, p2, p3]);
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

	update(ball:Ball, canvas) {
		if (this.sat(ball)/*this.collision(ball)*/) {
			Board.point++;
			this.replaceTo(new Point(this.randomVal(canvas.width / 2, (canvas.width - 30)), this.randomVal(30, ((canvas.height) - 30))));
		}
	}
}

class Ball extends Entity {
	private defaultSpeed:number = 8;

	constructor(points) {
		super(points);
		this.speed = new Vector(1 * this.defaultSpeed, 1 * this.defaultSpeed);
	}

	getFace(p1, p2) {
		for (let i = 0; i < (this.point.length - 2); i++) {
			if (this.point[i].intersect(this.point[i + 1], p1, p2) === null) {
				return (this.point[i].midSegment(this.point[i + 1]));
			}
		}
			return (this.point[this.point.length - 1].midSegment(this.point[0]));
	}

	update(rackets:Racket, walls) {
		for (let racket of rackets) {
			if (this.sat(racket)) {
				let angle = 0;
				let face = this.getFace(racket.point[2], racket.point[1]);
				let ratio = racket.point[2].intersect(racket.point[1], this.center(), face)
				if (ratio > 1)
					ratio = 1;
				if (ratio < 0)
					ratio = 0;
				console.log(ratio);
				angle = -(Math.PI/4 + (Math.PI/2 * (1 - ratio)));
				let norm = racket.point[2].vectorTo(racket.point[1]).normalized();
				[norm.x, norm.y] = [((norm.x * Math.cos(angle)) + (norm.y * Math.sin(angle))), (-(norm.x * Math.sin(angle)) + (norm.y * Math.cos(angle)))]
				this.speed = new Vector(norm.x * this.defaultSpeed, norm.y * this.defaultSpeed);	
				this.moveTo(this.speed);
				return ;
			}
		}
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
				if (Math.abs(angle2 - angle) > 0.001)
				{
					console.error("Picking second solution");
					[tmp.x, tmp.y] = [((this.speed.x * cosA) - (this.speed.y * -sinA)), ((this.speed.x * -sinA) + (this.speed.y * cosA))]
				}
				else
					console.error("Keeping first solution");
				console.error("Picked  vector: ", tmp);
				this.speed = tmp
				console.log("speedball",this.speed);
			//	(wall.point[0].vectorTo(wall.point[2])).perp().normalized().sub(this.speed);
			//	this.replaceTo(new Point(window.innerWidth / 4, window.innerHeight / 4));
			//	this.speed.x = 0;
			//	this.speed.y = 0;
				console.log("p0",this.point[0].x,this.point[0].y);
				this.moveTo(this.speed);
				this.moveTo(this.speed);
				console.log("p0",this.point[0].x,this.point[0].y);
				return ;
			}
		}
		this.moveTo(this.speed);
	}
}

class Racket extends Entity {
	private defaultSpeed:number = 3;
	private dir;
	constructor(points) {
		super(points);
		this.dir = this.point[2].vectorTo(this.point[1]).normalized()
		this.speed = new Vector(this.dir.x * this.defaultSpeed, this.dir.y * this.defaultSpeed);
	}

	update(ball:Ball,walls) {
		if (Board.keyPressed[Key.UP] && Board.keyPressed[Key.DOWN]) {
		} else 
		if (Board.keyPressed[Key.UP]) {
			this.speed = new Vector(this.dir.x * this.defaultSpeed, this.dir.y * this.defaultSpeed)
			this.moveTo(this.speed);
		} else if (Board.keyPressed[Key.DOWN]) {
			this.speed = new Vector(-this.dir.x * this.defaultSpeed, -this.dir.y * this.defaultSpeed)
			this.moveTo(this.speed);
		}
/*		if (this.center().vectorTo(ball.point[0]).norm() > (new Point(this.center().x + this.dir.x * this.defaultSpeed, this.center().y + this.dir.y * this.defaultSpeed)).vectorTo(ball.point[0]).norm()) {
			this.speed = new Vector(this.dir.x * this.defaultSpeed, this.dir.y * this.defaultSpeed)
			this.moveTo(this.speed);
		}
		else {
			this.speed = new Vector(-this.dir.x * this.defaultSpeed, -this.dir.y * this.defaultSpeed)
			this.moveTo(this.speed);
		}
*/		for (let wall of walls) {
			if (this.sat(wall)) {
				this.moveTo(new Vector(-this.speed.x, -this.speed.y))
			}
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
