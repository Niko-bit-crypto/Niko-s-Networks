const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySubtitle = document.getElementById('overlay-subtitle');
const startBtn = document.getElementById('start-btn');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let snake = [];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;
let score = 0;
let highScore = parseInt(localStorage.getItem('snake_unblocked_high') || '0', 10);
let gameInterval = null;
let isRunning = false;
let gameSpeed = 100;

highScoreEl.textContent = highScore;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  dx = 1;
  dy = 0;
  nextDx = 1;
  nextDy = 0;
  score = 0;
  scoreEl.textContent = score;
  spawnFood();
}

function spawnFood() {
  let valid = false;
  while (!valid) {
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);
    valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
  }
}

function startGame() {
  resetGame();
  overlay.classList.add('hidden');
  isRunning = true;
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameOver() {
  isRunning = false;
  clearInterval(gameInterval);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snake_unblocked_high', highScore);
    highScoreEl.textContent = highScore;
  }
  overlayTitle.textContent = 'GAME OVER';
  overlaySubtitle.textContent = `You scored ${score} points!`;
  startBtn.textContent = 'Play Again';
  overlay.classList.remove('hidden');
}

function gameLoop() {
  dx = nextDx;
  dy = nextDy;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Wall collisions
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    gameOver();
    return;
  }

  // Self collisions
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  // Check food eating
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  // Clear
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle grid lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= canvas.width; i += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Food
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Snake
  snake.forEach((seg, index) => {
    if (index === 0) {
      ctx.fillStyle = '#34d399';
    } else {
      ctx.fillStyle = '#10b981';
    }
    ctx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
  });
}

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }

  if (!isRunning && (e.key === ' ' || e.key === 'Enter')) {
    startGame();
    return;
  }

  if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dy !== 1) {
    nextDx = 0;
    nextDy = -1;
  } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dy !== -1) {
    nextDx = 0;
    nextDy = 1;
  } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dx !== 1) {
    nextDx = -1;
    nextDy = 0;
  } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dx !== -1) {
    nextDx = 1;
    nextDy = 0;
  }
});

// Touch swipe controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
  if (e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
  if (!isRunning) {
    startGame();
  }
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', e => {
  if (e.changedTouches.length > 0) {
    const dxTouch = e.changedTouches[0].clientX - touchStartX;
    const dyTouch = e.changedTouches[0].clientY - touchStartY;
    const absDx = Math.abs(dxTouch);
    const absDy = Math.abs(dyTouch);

    if (Math.max(absDx, absDy) > 20) {
      if (absDx > absDy) {
        // Horizontal swipe
        if (dxTouch > 0 && dx !== -1) {
          nextDx = 1;
          nextDy = 0;
        } else if (dxTouch < 0 && dx !== 1) {
          nextDx = -1;
          nextDy = 0;
        }
      } else {
        // Vertical swipe
        if (dyTouch > 0 && dy !== -1) {
          nextDx = 0;
          nextDy = 1;
        } else if (dyTouch < 0 && dy !== 1) {
          nextDx = 0;
          nextDy = -1;
        }
      }
    }
  }
  e.preventDefault();
}, { passive: false });

// Mobile Gamepad PostMessage Listener
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'arcade-key') {
    const key = e.data.key;
    if (e.data.action === 'keydown') {
      if (!isRunning && (key === ' ' || key === 'Enter' || key === 'Start')) {
        startGame();
        return;
      }
      if ((key === 'ArrowUp' || key === 'w' || key === 'W') && dy !== 1) {
        nextDx = 0;
        nextDy = -1;
      } else if ((key === 'ArrowDown' || key === 's' || key === 'S') && dy !== -1) {
        nextDx = 0;
        nextDy = 1;
      } else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && dx !== 1) {
        nextDx = -1;
        nextDy = 0;
      } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && dx !== -1) {
        nextDx = 1;
        nextDy = 0;
      }
    }
  }
});

startBtn.addEventListener('click', startGame);
draw();
