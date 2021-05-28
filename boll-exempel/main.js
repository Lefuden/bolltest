class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.randomize();
    }

    randomize() {
        this.velX = random(-7, 7);
        this.velY = random(-7, 7);
        this.size = random(10, 30);
        this.color = randomColor();
    }

    draw(highlight = false) {
        ctx.beginPath();
        ctx.fillStyle = highlight ? 'rgb(255,255,255)' : this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {
        if ((this.x + this.size) >= width) {
          this.velX = -(this.velX);
        }
      
        if ((this.x - this.size) <= 0) {
          this.velX = -(this.velX);
        }
      
        if ((this.y + this.size) >= height) {
          this.velY = -(this.velY);
        }
      
        if ((this.y - this.size) <= 0) {
          this.velY = -(this.velY);
        }
      
        this.x += this.velX;
        this.y += this.velY;
    }
}

class World {
    constructor() {
        this.balls = [];
        this.running = true;
        this.collisions = true;
        this.sizechange = 0.05;
        this.selected = undefined;
    }

    update() {
        this.balls.forEach(b => {
            b.draw();
        });

        if (this.selected) {
            if (!this.balls.find((b) => b ===  this.selected)) {
                this.selected = undefined;
            } else {
                this.selected.draw(true);
            }
        }

        setEnabled(".randomize", this.selected !== undefined);
        setEnabled(".clear", this.balls.length !== 0);

        if (!this.running) {
            return;
        }

        this.balls.forEach(b => {
            b.update();
            b.size += this.sizechange;
        })
        
        if (this.collisions) {
            this.collisionDetect();
        }
    
        this.balls = this.balls.filter(b => b.size > 2);
    }

    collisionDetect() {
        for (let i=0; i<this.balls.length; i++) {
            for (let j=i+1; j<this.balls.length; j++) {
                let a = this.balls[i];
                let b = this.balls[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < a.size + b.size) {
                    a.size *= 0.8;
                    b.size *= 0.8;
                    a.velX = -a.velX;
                    a.velY = -a.velY;
                    b.velX = -b.velX;
                    b.velY = -b.velY;
                }
            }
        }
    }

    createBall(x, y) {
        this.balls.push(new Ball(x, y), new Ball(x + 100, y + 100), new Ball(x - 100, y + 100), new Ball(x + 100, y - 100), new Ball(x - 100, y - 100),
            new Ball(x - 200, y - 200), new Ball(x + 200, y + 200), new Ball(x - 100, y + 200), new Ball(x + 200, y - 100));
    }

    removeBall(x, y) {
        this.balls = this.balls.filter((b) => {
            const dx = x - b.x;
            const dy = y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance > b.size;
        });
    }

    findBall(x, y) {
        let ball = this.balls.find((b) => {
            const dx = x - b.x;
            const dy = y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < b.size;
        });
        return ball;
    }
}

// randomness helpers
function random(min, max) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}

function randomColor() {
    return 'rgb(' + random(30,255) + ',' + random(0,0) + ',' + random(30,255) +')';
}

// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (e.ctrlKey) {
        world.removeBall(x, y);
    } 
    else {
        let ball = world.findBall(x, y);
        if (ball === undefined) {
            if (world.selected === undefined) {

			for (var i=0; i<500; i++) {
			world.createBall(x, y);
			}
            }
            else {
                world.selected = undefined;
            }
        }
        else {
            world.selected = ball;
        }
    }
});

function setEnabled(selector, value) {
    let icon = document.querySelector(selector);
    let isEnabled = !icon.classList.contains("disabled");
    if (isEnabled !== value) {
        if (value) {
            icon.classList.remove("disabled");
        }
        else {
            icon.classList.add("disabled");
        }
    }
}

function toggleIcon(selector, classes, action) {
    let icon = document.querySelector(selector);
    classes.forEach(c => icon.classList.toggle(c));
    action();
}

let playPause = () => toggleIcon(
    ".playpause", 
    ["fa-pause", "fa-play"], 
    () => world.running = !world.running
)

let expandCompress = () => toggleIcon(
    ".expandcompress",
    ["fa-expand", "fa-compress"],
    () => world.sizechange = -world.sizechange
)

let hitNoHit = () => toggleIcon(
    ".hitnohit",
    ["fa-circle", "fa-circle-o"],
    () => world.collisions = !world.collisions
)

function removeAll() {
    let btn = document.querySelector(".clear");
    if (!btn.classList.contains("disabled")) {
        world.balls = [];
    }
}

function randomize() {
    if (world.selected !== undefined) {
        world.selected.randomize();
    }
}

function loop() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    world.update();
    requestAnimationFrame(loop);
}

// Start
let world = new World();
ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
ctx.fillRect(0, 0, width, height);
loop();
