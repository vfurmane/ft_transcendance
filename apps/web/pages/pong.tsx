import React, { useRef, useEffect, useState } from 'react'

class Board {
	private	boardCanvasRef;
	private	boardCanvas;
	private	boardContext;
	private	countUpdate:number = 0;
	private	ball: Ball;

	constructor(){}
	init(ref) {
		this.boardCanvasRef = ref;
		this.boardCanvas = this.boardCanvasRef.current;
		this.boardContext = this.boardCanvas.getContext('2d');
		this.ball = new Ball(window.innerWidth / 4, window.innerHeight / 4, 40, 40);
	}
	updateBoard() {
		this.boardCanvas.width = window.innerWidth / 2
		this.boardCanvas.height = window.innerHeight / 2

		this.boardContext.fillStyle = "#666666"
		this.boardContext.fillRect(0, 0, this.boardCanvas.width, this.boardCanvas.height)
		this.boardContext.fillStyle = "#000000"
		this.boardContext.fillText(this.countUpdate + " Print from class Board : " + this.boardCanvas.width + " " + this.boardCanvas.height, 0 , 10)
		this.countUpdate++;
		this.ball.update();
		this.ball.draw(this.boardContext);
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
}

class Ball extends Entity {
	private	speed:number = 25;

	constructor(x:number,y:number,w:number,h:number) {
		super(x,y,w,h);
		this.xspeed = this.speed;
		this.yspeed = this.speed;
	}
	update() {
		if ((this.x + this.xspeed < (window.innerWidth / 2) - this.width) && (this.x + this.xspeed > 0)) {
			this.x += this.xspeed;
		} else {
			this.xspeed = -this.xspeed;
		}
		if ((this.y + this.yspeed < (window.innerHeight / 2) - this.height) && (this.y + this.yspeed > 0)) {
			this.y += this.yspeed;
		} else {
			this.yspeed = -this.yspeed;
		}
	}
}

class Racket extends Entity {
	private speed:number = 10;

	constructor(x:number,y:number,w:number,h:number) {
		super(x,y,w,h);
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
