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

	init(ref) {
		this.boardCanvasRef = ref;
		this.boardCanvas = this.boardCanvasRef.current;
		this.boardContext = this.boardCanvas.getContext('2d');
		this.ball = new Ball(window.innerWidth / 4, window.innerHeight / 4, 40, 40);
		this.player = new Racket(10, window.innerHeight / 4, 40, 100);
		this.cible = new Target(window.innerWidth / 3, window.innerHeight / 4, 20, 20);
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
		this.ball.update(this.player);
		this.player.update();
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

class Point {
	public	x;
	public	y;

	constructor(x:number,y:number) {
		this.x = x;
		this.y = y;
	}
}

class Entity {
	private	x;
	private	y;
	private	width;
	private	height;
	private	xspeed;
	private	yspeed;

	constructor(x:number,y:number,w:number,h:number) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}

	draw(context){
		context.fillStyle = "#fff";
		context.fillRect(this.x,this.y,this.width,this.height);
	}

	printPos(context) {
		context.font = "14px sherif"
		context.fillStyle = "#000";
		context.fillText("x=" + this.x + " y=" + this.y + " x'=" + (this.x + this.width) + " y'=" + (this.y + this.height), this.x, this.y)
	}

	collision(other:Entity) {
		if ((other.x >= this.x + this.xspeed + this.width) || (other.x + other.width <= this.x + this.xspeed) || (other.y >= this.y + this.yspeed + this.height) || (other.y + other.height <= this.y + this.yspeed)) {
			return (0);
		} else if ((other.x >= this.x + this.width) || (other.x + other.width <= this.x)) {
			return (Axe.X);
		} else if ((other.y >= this.y + this.height) || (other.y + other.height <= this.y)) {
			return (Axe.Y);
		}
		return (1);
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
		context.fillStyle = "#f00";
		context.fillRect(this.x,this.y,this.width,this.height);
	}

	randomVal(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	update(ball:Ball) {
		if (this.collision(ball)) {
			Board.point++;
			this.x = this.randomVal(window.innerWidth / 4, (window.innerWidth / 2 - 30))
			this.y = this.randomVal(30, ((window.innerHeight / 2) - 30))
		}
	}
}


class Ball extends Entity {
	private	speed:number = 4;

	constructor(x:number,y:number,w:number,h:number) {
		super(x,y,w,h);
		this.xspeed = this.speed;
		this.yspeed = this.speed;
	}

	DontHitWallX() {
		return (((this.x + this.xspeed) < ((window.innerWidth / 2) - this.width)) && ((this.x + this.xspeed) > 0))
	}

	DontHitWallY() {
		return (((this.y + this.yspeed) < ((window.innerHeight / 2) - this.height)) && ((this.y + this.yspeed) > 0))
	}

	update(racket:Racket) {
		let axe:number;
		if (axe = this.collision(racket)) {
			if (axe == Axe.X) {
				this.xspeed = -this.xspeed;
				if (this.xspeed > 0) {
					this.xspeed += racket.speed;
				} else {
					this.xspeed -= racket.speed;
				}
			} else {
				this.yspeed = -this.yspeed;
				if (this.yspeed > 0) {
					this.yspeed += racket.speed;
				} else {
					this.yspeed -= racket.speed;
				}
			}
			this.x += this.xspeed;
			this.y += this.yspeed;
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
			if (this.x + this.xspeed <= 0) {
				Board.live--;
				this.x = window.innerWidth / 4;
				this.y = window.innerHeight / 4;
			}
			if (this.DontHitWallX()) {
				this.x += this.xspeed;
			} else {
				this.xspeed = -this.xspeed;
				this.x += this.xspeed;
			}
			if (this.DontHitWallY()) {
				this.y += this.yspeed;
			} else {
				this.yspeed = -this.yspeed;
				this.y += this.yspeed;
			}
		}
	}
}

class Racket extends Entity {
	private speed:number = 4;

	constructor(x:number,y:number,w:number,h:number) {
		super(x,y,w,h);
		this.xspeed = this.speed;
		this.yspeed = 0;
	}

	update() {
		if (Board.keyPressed[Key.UP] && Board.keyPressed[Key.DOWN]) {
		} else 
		if (Board.keyPressed[Key.UP]) {
			this.y -= this.speed;
		} else if (Board.keyPressed[Key.DOWN]) {
			this.y += this.speed;
		}
		if (this.y < 0)
			this.y = 0;
		if (this.y + this.height > (window.innerHeight / 2)) {
			this.y = ((window.innerHeight / 2) - this.height);
		}
	}
}

const Canvas = props => {
	const canvasRef = useRef(null);
	let game = new Board();
	function handleResize() {
		game.updateBoard();
		requestAnimationFrame(handleResize)
	}

	useEffect(() => {
		game.init(canvasRef);
		handleResize();
		window.addEventListener('resize', handleResize)
	}, [])

	return <canvas width='1500' height='1500' ref={canvasRef}/>
}

export default Canvas
