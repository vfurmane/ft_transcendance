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

class Game {
	private	isSolo = false;
	private	boardType = Form.HEX;
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
	private	color = ['blue', 'red', 'orange', 'white', 'pink', 'black']

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


	createRacket(isSolo,wall) {
		if (isSolo) {
			return ([new Racket(this.createRect(10, this.boardCanvas.height / 2, 10, 40))]);
		} else {
			let racket = [];
			let j = wall.length - 1;
			let wallDir = wall[j].point[0].vectorTo(wall[j].point[2]).normalized();
			let wallPerp = wallDir.perp().normalized();
			let wallCenter = wall[j].center();
			let racketCenter = new Point(wallCenter.x + (wallPerp.x * 5), wallCenter.y + (wallPerp.y * 5));
			let p3 = new Point((racketCenter.x - (wallDir.x * 40)), (racketCenter.y - (wallDir.y * 40)))
			let p0 = new Point((racketCenter.x + (wallDir.x * 40)), (racketCenter.y + (wallDir.y * 40)))
			let p1 = new Point((p0.x + (wallPerp.x * 10)), (p0.y + (wallPerp.y * 10)))
			let p2 = new Point((p3.x + (wallPerp.x * 10)), (p3.y + (wallPerp.y * 10)))
			if (this.player === undefined)
				racket.push(new Racket(0, [p0, p1, p2, p3], this.color[0]));
			else
				racket.push(new Racket(0, [p0, p1, p2, p3], this.player[0].color));
			for (let i = 0; i < wall.length - 1; i++) {
				let wallDir = wall[i].point[0].vectorTo(wall[i].point[2]).normalized();
				let wallPerp = wallDir.perp().normalized();
				let wallCenter = wall[i].center();
				let racketCenter = new Point(wallCenter.x + (wallPerp.x * 5), wallCenter.y + (wallPerp.y * 5));
				let p3 = new Point((racketCenter.x - (wallDir.x * 40)), (racketCenter.y - (wallDir.y * 40)))
				let p0 = new Point((racketCenter.x + (wallDir.x * 40)), (racketCenter.y + (wallDir.y * 40)))
				let p1 = new Point((p0.x + (wallPerp.x * 10)), (p0.y + (wallPerp.y * 10)))
				let p2 = new Point((p3.x + (wallPerp.x * 10)), (p3.y + (wallPerp.y * 10)))
				if (this.player === undefined)
					racket.push(new Racket(i + 1, [p0, p1, p2, p3], this.color[i + 1]));
				else
					racket.push(new Racket(i + 1, [p0, p1, p2, p3], this.player[i + 1].color));
			}
			return (racket);
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
		this.board = new Board(this.boardType, this.boardCanvas);
		if (this.boardType != Form.REC) {
			this.player = this.createRacket(this.isSolo, this.board.wall);
			this.ball = new Ball(this.createRegularPolygon(this.board.board.center(), (30), this.boardType));
		} else {
			this.player = this.createRacket(this.isSolo, [this.board.wall[1], this.board.wall[3]]);
			this.ball = new Ball(this.createRect(this.board.board.center().x, this.board.board.center().y, 10, 10));
		}
		if (this.isSolo)
			this.cible = new Target(this.createRect(this.boardCanvas.width * (2 / 3), this.boardCanvas.height / 2, 20, 20));
		window.addEventListener("keydown",function(e){
			Game.keyPressed[e.which] = true;
		});
		window.addEventListener("keyup",function(e){
			Game.keyPressed[e.which] = false;
		});
	}

	updateGame() {
		this.boardCanvas.width = window.innerWidth * 0.9
		this.boardCanvas.height = window.innerHeight * 0.9

		for (let p of this.player) {
			if (p.hp == 0) {
				if (this.boardType == Form.REC) {
					this.boardType = Form.HEX;
					this.player = undefined;
				} else {
					this.player.splice(p.index, 1);
					for (let i = 0; i < this.player.length; i++) {
						if (this.player[i].index > p.index) {
							this.player[i].index--;
						}
					}
					this.boardType--;
				}
				this.init(this.boardCanvasRef);
			}
		}

		this.boardContext.fillStyle = "#666666"
		this.board.board.draw(this.boardContext, 'gray');
		this.boardContext.font = "14px sherif"
		this.boardContext.fillStyle = "#000000"
		this.boardContext.fillText(Math.round(this.countUpdate / (Math.round((Date.now() - this.start) / 1000))) + " Print from class Board : " + this.boardCanvas.width + " " + this.boardCanvas.height, 0 , 10)
		this.boardContext.font = "50px sherif";
		this.boardContext.fillText(Game.point, this.boardCanvas.width / 2, 50)
		this.boardContext.fillText(Math.round((Date.now() - this.start) / 1000), this.boardCanvas.width / 2, 110)
		this.boardContext.font = "20px sherif";
		for (let i:number = 0; i < Game.live; i++) {
			this.boardContext.fillText("❤️", (this.boardCanvas.width / 2) + (25 * i), 160)
		}
		this.countUpdate++;
		this.ball.update(this.player, this.board.wall, this.board);
		for (let p of this.player)
			p.update(this.ball, this.board.wall);
		if (this.isSolo)
			this.cible.update(this.ball, this.boardCanvas);
		for (let wall of this.board.wall) {
			wall.draw(this.boardContext);
		}
		this.ball.draw(this.boardContext);
		for (let p of this.player) {
			p.draw(this.boardContext, p.color);
			p.printPoint(this.boardContext, 0, 'red');
			p.printPoint(this.boardContext, 3, 'green');
			this.boardContext.fillText(p.hp, this.boardCanvas.width / 1.2, 50 + (20 * p.index));
		}
		if (this.isSolo)
			this.cible.draw(this.boardContext);
		if (Game.live == 0) {
			Game.point = 0;
			Game.live = 3;
			this.start = Date.now();
		}
	}
}

class Board {
	private	board;
	private	wall;

	constructor(boardType, canvas) {
		let height = 0;
		let size = 1;
		if (boardType == Form.HEX || boardType == Form.PEN) {
			height = canvas.height / 4;
			size = 0.5;
		}
		if (boardType != Form.REC)
			this.board = new Entity(this.createRegularPolygon(new Point(0, height), canvas.height * size, boardType));
		else
			this.board = new Entity(this.createRect(0, 0, (canvas.height / 4) * 4, (canvas.height / 4) * 3));
		this.wall = this.createWall(this.board);
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

	createRect(x:number,y:number,w:number,h:number) {
		let point = [];
		point[0] = new Point(x,y);
		point[1] = new Point(x+w,y);
		point[2] = new Point(x+w,y+h);
		point[3] = new Point(x,y+h);
		return point;
	}

	createWall(board:Entity) {
		let wall = [];
		for (let i = 0; i < board.point.length - 1; i++) {
			wall.push(new Wall(board.point[i], board.point[i + 1]));
		}
		wall.push(new Wall(board.point[board.point.length - 1], board.point[0]));
		return (wall);
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
		if (othercp === 0) {
			return (0);
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

	draw(context,color){
		if (color === undefined)
			color = 'white'
		context.beginPath();
		context.moveTo(this.getx(), this.gety());
		for (let point of this.point) {
			context.lineTo(point.x, point.y);
		}
		context.closePath();
		context.strokeStyle = color
		context.stroke();
		context.fillStyle = color
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
			Game.point++;
			this.replaceTo(new Point(this.randomVal(canvas.width / 2, (canvas.width - 30)), this.randomVal(30, ((canvas.height) - 30))));
		}
	}
}

class Ball extends Entity {
	private defaultSpeed:number = 6;

	constructor(points) {
		super(points);
		let dir = (new Vector(Math.random() - Math.random(), Math.random() - Math.random())).normalized();
		this.speed = new Vector(dir.x * this.defaultSpeed, dir.y * this.defaultSpeed);
	}

	isParallel(from1, to1, from2, to2)
	{
		let v1 = from1.vectorTo(to1);
		let v2 = from2.vectorTo(to2);
		return (v1.crossProduct(v2));
	}

	getFace(n) {
		if (n) {
			return (this.point[n - 1].midSegment(this.point[n]));
		}
		return (this.point[this.point.length - 1].midSegment(this.point[0]));
	}

	update(rackets:Racket, walls,board) {
		for (let racket of rackets) {
			if (this.sat(racket)) {
				let angle = 0;
				let face;
				if (rackets.length != 2)
					face = this.getFace(rackets.indexOf(racket));
				else {
					let index = rackets.indexOf(racket);
					if (index == 1)
						face = this.getFace(2);
					else
						face = this.getFace(0);
				}
				let ratio = racket.point[2].intersect(racket.point[1], this.center(), face)
				if (ratio > 1)
					ratio = 1;
				if (ratio < 0)
					ratio = 0;
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
					[tmp.x, tmp.y] = [((this.speed.x * cosA) - (this.speed.y * -sinA)), ((this.speed.x * -sinA) + (this.speed.y * cosA))]
				}
				this.speed = tmp
				this.moveTo(this.speed);
				this.moveTo(this.speed);
				let index = walls.indexOf(wall);
				if (rackets.length === 2) {
					if (index === 1) {
						rackets[1].hp--;
						this.replaceTo(board.board.center());
					} else if (index === 3) {
						rackets[0].hp--;
						this.replaceTo(board.board.center());
					}
				} else {
					if (index === walls.length - 1)
						index = 0;
					else
						index++;
					rackets[index].hp--;
					this.replaceTo(board.board.center());
				}
				return ;
			}
		}
		this.moveTo(this.speed);
	}
}

class Racket extends Entity {
	private defaultSpeed:number = 3;
	private hp = 3;
	private index;
	private dir;
	private	color;

	constructor(index, points, color) {
		super(points);
		this.index = index;
		this.color = color;
		this.dir = this.point[2].vectorTo(this.point[1]).normalized()
		this.speed = new Vector(this.dir.x * this.defaultSpeed, this.dir.y * this.defaultSpeed);
	}

	update(ball:Ball,walls) {
		if (this.index == 10) {
			if (Game.keyPressed[Key.UP] && Game.keyPressed[Key.DOWN]) {
			} else 
			if (Game.keyPressed[Key.UP]) {
				this.speed = new Vector(this.dir.x * this.defaultSpeed, this.dir.y * this.defaultSpeed)
				this.moveTo(this.speed);
			} else if (Game.keyPressed[Key.DOWN]) {
				this.speed = new Vector(-this.dir.x * this.defaultSpeed, -this.dir.y * this.defaultSpeed)
				this.moveTo(this.speed);
			}
		} else {
			if (this.center().vectorTo(ball.point[0]).norm() > (new Point(this.center().x + this.dir.x * this.defaultSpeed, this.center().y + this.dir.y * this.defaultSpeed)).vectorTo(ball.point[0]).norm()) {
				this.speed = new Vector(this.dir.x * this.defaultSpeed, this.dir.y * this.defaultSpeed)
				this.moveTo(this.speed);
			}
			else {
				this.speed = new Vector(-this.dir.x * this.defaultSpeed, -this.dir.y * this.defaultSpeed)
				this.moveTo(this.speed);
			}
		}
		for (let wall of walls) {
			if (this.sat(wall)) {
				this.moveTo(new Vector(-this.speed.x, -this.speed.y))
			}
		}
	}
}

const Canvas = props => {
	const canvasRef = useRef(null);
	let game = new Game();
	function handleResize() {
		game.updateGame();
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
