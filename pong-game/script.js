// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 6,
    dy: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballSize,
    dx: -5,
    dy: -3,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;
const winScore = 10;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');

    // Draw center line
    drawCenterLine();

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#00ff00');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#ff00ff');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffff00');

    // Draw scores
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Player: ${playerScore}`, 20, 30);
    ctx.fillText(`Computer: ${computerScore}`, canvas.width - 180, 30);
}

// Update game state
function update() {
    // Player movement - Mouse
    if (mouseY - paddleHeight / 2 > 0 && mouseY + paddleHeight / 2 < canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    }

    // Player movement - Arrow keys
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y + player.height < canvas.height) {
        player.y += player.speed;
    }

    // Computer AI
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    if (computerCenter < ballCenter - 35) {
        if (computer.y + computer.height < canvas.height) {
            computer.y += computer.speed;
        }
    } else if (computerCenter > ballCenter + 35) {
        if (computer.y > 0) {
            computer.y -= computer.speed;
        }
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Keep ball in bounds
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with paddles
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = Math.abs(ball.dx);
        // Add spin based on where the ball hits the paddle
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.dy = deltaY * 0.1;
        ball.x = player.x + player.width + ball.radius;
    }

    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -Math.abs(ball.dx);
        // Add spin based on where the ball hits the paddle
        const deltaY = ball.y - (computer.y + computer.height / 2);
        ball.dy = deltaY * 0.1;
        ball.x = computer.x - ball.radius;
    }

    // Ball out of bounds - score points
    if (ball.x + ball.radius < 0) {
        computerScore++;
        resetBall();
    }
    if (ball.x - ball.radius > canvas.width) {
        playerScore++;
        resetBall();
    }

    // Update score display
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;

    // Check for win condition
    if (playerScore >= winScore || computerScore >= winScore) {
        const winner = playerScore >= winScore ? 'Player' : 'Computer';
        setTimeout(() => {
            alert(`${winner} wins! Final score: Player ${playerScore} - Computer ${computerScore}`);
            resetGame();
        }, 100);
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 6;
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    resetBall();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
