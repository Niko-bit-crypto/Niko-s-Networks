const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const p1ScoreEl = document.getElementById('playerScore');
const p2ScoreEl = document.getElementById('aiScore');
const modeBtn = document.getElementById('modeBtn');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const WINNING_SCORE = 7;

let is2Player = false;
let isPlaying = false;
let p1Score = 0;
let p2Score = 0;

let p1 = {
  x: 20,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  speed: 7,
  dy: 0
};

let p2 = {
  x: canvas.width - 20 - PADDLE_WIDTH,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  speed: 5.5,
  dy: 0
};

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 5,
  vy: 3,
  speed: 6
};

const keys = {};

function resetBall(servingPlayer = 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 6;
  const angle = (Math.random() * Math.PI / 4) - (Math.PI / 8); // -22.5 to 22.5 deg
  const dir = servingPlayer === 1 ? -1 : 1;
  ball.vx = dir * ball.speed * Math.cos(angle);
  ball.vy = ball.speed * Math.sin(angle);
}

function resetGame() {
  p1Score = 0;
  p2Score = 0;
  p1ScoreEl.textContent = '0';
  p2ScoreEl.textContent = '0';
  p1.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
  p2.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
  resetBall(Math.random() > 0.5 ? 1 : 2);
}

function startGame() {
  resetGame();
  overlay.classList.add('hidden');
  isPlaying = true;
  requestAnimationFrame(gameLoop);
}

function gameOver(winner) {
  isPlaying = false;
  overlay.querySelector('h2').textContent = winner + ' WINS!';
  overlay.querySelector('p').textContent = `Final Score: ${p1Score} - ${p2Score}`;
  startBtn.textContent = 'Play Again';
  overlay.classList.remove('hidden');
}

function update() {
  // Player 1 movement
  if (keys['w'] || keys['W']) {
    p1.y -= p1.speed;
  }
  if (keys['s'] || keys['S']) {
    p1.y += p1.speed;
  }

  // Player 2 or AI movement
  if (is2Player) {
    if (keys['ArrowUp']) p2.y -= p2.speed;
    if (keys['ArrowDown']) p2.y += p2.speed;
  } else {
    // Smooth AI tracking
    const targetY = ball.y - PADDLE_HEIGHT / 2;
    if (p2.y < targetY - 4) {
      p2.y += p2.speed;
    } else if (p2.y > targetY + 4) {
      p2.y -= p2.speed;
    }
  }

  // Clamp paddles
  p1.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, p1.y));
  p2.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, p2.y));

  // Ball movement
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Top/Bottom bounce
  if (ball.y <= 0 || ball.y + BALL_SIZE >= canvas.height) {
    ball.vy *= -1;
  }

  // Paddle 1 collision
  if (
    ball.x <= p1.x + PADDLE_WIDTH &&
    ball.x + BALL_SIZE >= p1.x &&
    ball.y + BALL_SIZE >= p1.y &&
    ball.y <= p1.y + PADDLE_HEIGHT &&
    ball.vx < 0
  ) {
    const hitOffset = (ball.y + BALL_SIZE / 2) - (p1.y + PADDLE_HEIGHT / 2);
    const normalizedHit = hitOffset / (PADDLE_HEIGHT / 2);
    ball.speed = Math.min(12, ball.speed + 0.3);
    const angle = normalizedHit * (Math.PI / 3); // max 60 deg
    ball.vx = ball.speed * Math.cos(angle);
    ball.vy = ball.speed * Math.sin(angle);
  }

  // Paddle 2 collision
  if (
    ball.x + BALL_SIZE >= p2.x &&
    ball.x <= p2.x + PADDLE_WIDTH &&
    ball.y + BALL_SIZE >= p2.y &&
    ball.y <= p2.y + PADDLE_HEIGHT &&
    ball.vx > 0
  ) {
    const hitOffset = (ball.y + BALL_SIZE / 2) - (p2.y + PADDLE_HEIGHT / 2);
    const normalizedHit = hitOffset / (PADDLE_HEIGHT / 2);
    ball.speed = Math.min(12, ball.speed + 0.3);
    const angle = normalizedHit * (Math.PI / 3);
    ball.vx = -ball.speed * Math.cos(angle);
    ball.vy = ball.speed * Math.sin(angle);
  }

  // Scoring
  if (ball.x < 0) {
    p2Score++;
    p2ScoreEl.textContent = p2Score;
    if (p2Score >= WINNING_SCORE) {
      gameOver(is2Player ? 'PLAYER 2' : 'AI');
      return;
    }
    resetBall(1);
  } else if (ball.x > canvas.width) {
    p1Score++;
    p1ScoreEl.textContent = p1Score;
    if (p1Score >= WINNING_SCORE) {
      gameOver('PLAYER 1');
      return;
    }
    resetBall(2);
  }
}

function draw() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Center dotted line
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Paddles
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(p1.x, p1.y, PADDLE_WIDTH, PADDLE_HEIGHT);

  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(p2.x, p2.y, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Ball
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  if (!isPlaying) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Mouse tracking for P1
canvas.addEventListener('mousemove', e => {
  if (!isPlaying) return;
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  p1.y = mouseY - PADDLE_HEIGHT / 2;
});

// Touch tracking for mobile
const handleTouchPong = (e) => {
  if (e.touches.length > 0) {
    if (!isPlaying) {
      startGame();
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const touchY = (e.touches[0].clientY - rect.top) * scaleY;
    p1.y = touchY - PADDLE_HEIGHT / 2;
  }
  e.preventDefault();
};

canvas.addEventListener('touchstart', handleTouchPong, { passive: false });
canvas.addEventListener('touchmove', handleTouchPong, { passive: false });

window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (!isPlaying && (e.key === ' ' || e.key === 'Enter')) {
    startGame();
  }
});

window.addEventListener('keyup', e => {
  keys[e.key] = false;
});

// Mobile Gamepad PostMessage Listener
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'arcade-key') {
    const key = e.data.key;
    const isDown = e.data.action === 'keydown';
    keys[key] = isDown;
    if (isDown && !isPlaying && (key === ' ' || key === 'Enter' || key === 'Start')) {
      startGame();
    }
  }
});

modeBtn.addEventListener('click', () => {
  is2Player = !is2Player;
  modeBtn.textContent = is2Player ? 'Mode: 2P (Local)' : 'Mode: 1P (vs AI)';
});

startBtn.addEventListener('click', startGame);
draw();
