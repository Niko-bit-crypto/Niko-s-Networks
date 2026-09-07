const canvas = document.getElementById('breakoutCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const stageEl = document.getElementById('stage');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayDesc = document.getElementById('overlayDesc');
const startBtn = document.getElementById('startBtn');

const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 16;
const BRICK_GAP = 8;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 12;

const ROW_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

let paddle = {
  width: 75,
  height: 12,
  x: canvas.width / 2 - 37.5,
  speed: 7
};

let ball = {
  x: canvas.width / 2,
  y: canvas.height - 40,
  radius: 6,
  dx: 3.5,
  dy: -3.5,
  speed: 4.5
};

let bricks = [];
let score = 0;
let lives = 3;
let stage = 1;
let isPlaying = false;
let rightPressed = false;
let leftPressed = false;

function initBricks() {
  bricks = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    bricks[r] = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks[r][c] = {
        x: BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_GAP),
        y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_GAP),
        status: 1,
        color: ROW_COLORS[r % ROW_COLORS.length]
      };
    }
  }
}

function updateLivesDisplay() {
  let hearts = '';
  for (let i = 0; i < lives; i++) hearts += '♥ ';
  livesEl.textContent = hearts.trim();
}

function resetBall() {
  ball.x = paddle.x + paddle.width / 2;
  ball.y = canvas.height - 30;
  ball.speed = 4.5 + (stage - 1) * 0.5;
  const angle = (Math.random() * Math.PI / 3) - (Math.PI / 6); // -30 to 30 deg
  ball.dx = ball.speed * Math.sin(angle);
  ball.dy = -ball.speed * Math.cos(angle);
}

function startGame() {
  score = 0;
  lives = 3;
  stage = 1;
  scoreEl.textContent = score;
  stageEl.textContent = stage;
  updateLivesDisplay();
  initBricks();
  paddle.x = canvas.width / 2 - paddle.width / 2;
  resetBall();
  overlay.classList.add('hidden');
  isPlaying = true;
  requestAnimationFrame(gameLoop);
}

function nextStage() {
  stage++;
  stageEl.textContent = stage;
  paddle.width = Math.max(50, paddle.width - 5);
  initBricks();
  resetBall();
}

function gameOver(win = false) {
  isPlaying = false;
  overlayTitle.textContent = win ? 'VICTORY!' : 'GAME OVER';
  overlayDesc.textContent = win ? `You crushed all stages! Score: ${score}` : `Final Score: ${score}`;
  startBtn.textContent = 'Play Again';
  overlay.classList.remove('hidden');
}

function collisionDetection() {
  let activeBricks = 0;
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const b = bricks[r][c];
      if (b.status === 1) {
        activeBricks++;
        if (
          ball.x > b.x &&
          ball.x < b.x + BRICK_WIDTH &&
          ball.y > b.y &&
          ball.y < b.y + BRICK_HEIGHT
        ) {
          ball.dy = -ball.dy;
          b.status = 0;
          score += 15 * stage;
          scoreEl.textContent = score;
        }
      }
    }
  }

  if (activeBricks === 0) {
    if (stage >= 3) {
      gameOver(true);
    } else {
      nextStage();
    }
  }
}

function update() {
  if (rightPressed && paddle.x < canvas.width - paddle.width) {
    paddle.x += paddle.speed;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collisions
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  } else if (ball.y + ball.radius > canvas.height - paddle.height - 4) {
    // Paddle collision
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      const angle = hitPoint * (Math.PI / 3);
      ball.dx = ball.speed * Math.sin(angle);
      ball.dy = -ball.speed * Math.cos(angle);
    } else if (ball.y > canvas.height) {
      lives--;
      updateLivesDisplay();
      if (lives <= 0) {
        gameOver(false);
        return;
      } else {
        resetBall();
      }
    }
  }

  collisionDetection();
}

function draw() {
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw bricks
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const b = bricks[r][c];
      if (b && b.status === 1) {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.strokeStyle = '#030712';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT);
      }
    }
  }

  // Draw paddle
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(paddle.x, canvas.height - paddle.height - 2, paddle.width, paddle.height);

  // Draw ball
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  if (!isPlaying) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') rightPressed = true;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') leftPressed = true;
  if (!isPlaying && (e.key === ' ' || e.key === 'Enter')) startGame();
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') rightPressed = false;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') leftPressed = false;
});

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, mouseX - paddle.width / 2));
});

startBtn.addEventListener('click', startGame);
initBricks();
draw();
