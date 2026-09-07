const canvas = document.getElementById('flappyCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

let bird = {
  x: 60,
  y: 200,
  radius: 12,
  velocity: 0,
  gravity: 0.28,
  jump: -6
};

let pipes = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('unblocked_flappy_high') || '0', 10);
let isPlaying = false;
let frameCount = 0;
const PIPE_WIDTH = 48;
const PIPE_GAP = 120;

function resetGame() {
  bird.y = 200;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
}

function spawnPipe() {
  const minHeight = 40;
  const maxHeight = canvas.height - PIPE_GAP - minHeight - 60; // 60 for ground
  const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - 60 - (topHeight + PIPE_GAP),
    passed: false
  });
}

function flap() {
  if (!isPlaying) {
    startGame();
    return;
  }
  bird.velocity = bird.jump;
}

function startGame() {
  resetGame();
  overlay.classList.add('hidden');
  isPlaying = true;
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  isPlaying = false;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('unblocked_flappy_high', highScore);
  }
  overlay.querySelector('h2').textContent = 'GAME OVER';
  overlay.querySelector('p').textContent = `Score: ${score}  |  Best: ${highScore}`;
  startBtn.textContent = 'Fly Again';
  overlay.classList.remove('hidden');
}

function update() {
  frameCount++;
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Floor & Ceiling
  if (bird.y + bird.radius >= canvas.height - 60) {
    bird.y = canvas.height - 60 - bird.radius;
    gameOver();
    return;
  }
  if (bird.y - bird.radius <= 0) {
    bird.y = bird.radius;
    bird.velocity = 0;
  }

  // Spawn pipe every 100 frames
  if (frameCount % 100 === 0) {
    spawnPipe();
  }

  // Update pipes
  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    p.x -= 2;

    // Check collision
    if (
      bird.x + bird.radius > p.x &&
      bird.x - bird.radius < p.x + PIPE_WIDTH
    ) {
      if (
        bird.y - bird.radius < p.top ||
        bird.y + bird.radius > canvas.height - 60 - p.bottom
      ) {
        gameOver();
        return;
      }
    }

    // Score point
    if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
      p.passed = true;
      score++;
    }
  }

  // Clean old pipes
  pipes = pipes.filter(p => p.x + PIPE_WIDTH > 0);
}

function draw() {
  // Sky background
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(80, 100, 24, 0, Math.PI * 2);
  ctx.arc(110, 95, 30, 0, Math.PI * 2);
  ctx.arc(140, 100, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(260, 150, 20, 0, Math.PI * 2);
  ctx.arc(285, 145, 25, 0, Math.PI * 2);
  ctx.arc(310, 150, 20, 0, Math.PI * 2);
  ctx.fill();

  // Draw pipes
  pipes.forEach(p => {
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;

    // Top pipe
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
    ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.top);

    // Top cap
    ctx.fillRect(p.x - 3, p.top - 16, PIPE_WIDTH + 6, 16);
    ctx.strokeRect(p.x - 3, p.top - 16, PIPE_WIDTH + 6, 16);

    // Bottom pipe
    const bottomY = canvas.height - 60 - p.bottom;
    ctx.fillRect(p.x, bottomY, PIPE_WIDTH, p.bottom);
    ctx.strokeRect(p.x, bottomY, PIPE_WIDTH, p.bottom);

    // Bottom cap
    ctx.fillRect(p.x - 3, bottomY, PIPE_WIDTH + 6, 16);
    ctx.strokeRect(p.x - 3, bottomY, PIPE_WIDTH + 6, 16);
  });

  // Ground
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(0, canvas.height - 60, canvas.width, 10);

  // Bird
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.velocity * 0.08)));

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(4, -4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(5, -4, 2, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(8, -2);
  ctx.lineTo(16, 2);
  ctx.lineTo(8, 6);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Score HUD
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.strokeText(score, canvas.width / 2, 50);
  ctx.fillText(score, canvas.width / 2, 50);
}

function gameLoop() {
  if (!isPlaying) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    e.preventDefault();
    flap();
  }
});

canvas.addEventListener('mousedown', e => {
  e.preventDefault();
  flap();
});

// Mobile touch tap
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  flap();
}, { passive: false });

// Mobile Gamepad PostMessage Listener
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'arcade-key') {
    if (e.data.action === 'keydown') {
      flap();
    }
  }
});

startBtn.addEventListener('click', startGame);
draw();
