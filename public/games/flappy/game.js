const canvas = document.getElementById('flappyCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

// Tuned physics: faster horizontal tempo, quicker gravity pull, and lower snappy jump
let bird = {
  x: 70,
  y: 200,
  radius: 12,
  velocity: 0,
  gravity: 0.40, // Up from 0.28: faster, snappy fall & rapid responsiveness
  jump: -5.0     // Tuned from -6.0: lower jump arc for tight pipe maneuvering
};

let pipes = [];
let score = 0;
let highScore = 0;
try {
  highScore = parseInt(localStorage.getItem('unblocked_flappy_high') || '0', 10);
  if (isNaN(highScore)) highScore = 0;
} catch (e) {
  highScore = 0;
}

let isPlaying = false;
let frameCount = 0;
const PIPE_WIDTH = 50;
const PIPE_GAP = 118;
const BASE_SPEED = 3.0; // Up from 2.0: faster overall game speed
const SPAWN_INTERVAL = 68; // Pipes appear briskly and evenly spaced

function resetGame() {
  bird.y = 200;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
}

function spawnPipe() {
  const minHeight = 45;
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
  // Crisp, fast, low jump
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
    try {
      localStorage.setItem('unblocked_flappy_high', highScore);
    } catch (e) {}
  }
  overlay.querySelector('h2').textContent = 'GAME OVER';
  overlay.querySelector('p').textContent = `Score: ${score}  |  Best: ${highScore}`;
  startBtn.textContent = 'Fly Again';
  overlay.classList.remove('hidden');
}

function getCurrentSpeed() {
  // Starts fast at 3.0 and gradually scales up
  return Math.min(4.4, BASE_SPEED + Math.floor(score / 5) * 0.15);
}

function update() {
  frameCount++;
  const speed = getCurrentSpeed();

  // Bird physics
  bird.velocity += bird.gravity;
  if (bird.velocity > 9) bird.velocity = 9; // Cap terminal velocity
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

  // Spawn pipe briskly
  if (frameCount % SPAWN_INTERVAL === 0) {
    spawnPipe();
  }

  // Update pipes
  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    p.x -= speed;

    // Check collision with hitbox tolerance
    if (
      bird.x + bird.radius - 2 > p.x &&
      bird.x - bird.radius + 2 < p.x + PIPE_WIDTH
    ) {
      if (
        bird.y - bird.radius + 2 < p.top ||
        bird.y + bird.radius - 2 > canvas.height - 60 - p.bottom
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
  const speed = getCurrentSpeed();

  // Sky background
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background clouds (subtly drifting)
  const cloudOffset1 = (frameCount * 0.4) % (canvas.width + 100);
  const cloudOffset2 = (frameCount * 0.25) % (canvas.width + 120);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  const c1x = canvas.width - cloudOffset1;
  ctx.arc(c1x, 85, 22, 0, Math.PI * 2);
  ctx.arc(c1x + 25, 80, 28, 0, Math.PI * 2);
  ctx.arc(c1x + 50, 85, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  const c2x = canvas.width - cloudOffset2;
  ctx.arc(c2x, 140, 18, 0, Math.PI * 2);
  ctx.arc(c2x + 22, 135, 24, 0, Math.PI * 2);
  ctx.arc(c2x + 44, 140, 18, 0, Math.PI * 2);
  ctx.fill();

  // Draw pipes
  pipes.forEach(p => {
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2.5;

    // Top pipe
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
    ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.top);

    // Top pipe highlight & shadow line
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(p.x + 4, 0, 5, p.top);
    ctx.fillStyle = '#166534';
    ctx.fillRect(p.x + PIPE_WIDTH - 6, 0, 4, p.top);

    // Top cap
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(p.x - 3, p.top - 18, PIPE_WIDTH + 6, 18);
    ctx.strokeRect(p.x - 3, p.top - 18, PIPE_WIDTH + 6, 18);

    // Bottom pipe
    const bottomY = canvas.height - 60 - p.bottom;
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(p.x, bottomY, PIPE_WIDTH, p.bottom);
    ctx.strokeRect(p.x, bottomY, PIPE_WIDTH, p.bottom);

    // Bottom pipe highlight & shadow line
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(p.x + 4, bottomY, 5, p.bottom);
    ctx.fillStyle = '#166534';
    ctx.fillRect(p.x + PIPE_WIDTH - 6, bottomY, 4, p.bottom);

    // Bottom cap
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(p.x - 3, bottomY, PIPE_WIDTH + 6, 18);
    ctx.strokeRect(p.x - 3, bottomY, PIPE_WIDTH + 6, 18);
  });

  // Animated Ground (Scrolling gives high-speed feel)
  const groundOffset = (frameCount * speed) % 20;
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

  // Top grass line
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, canvas.height - 60, canvas.width, 10);
  ctx.fillStyle = '#15803d';
  ctx.fillRect(0, canvas.height - 52, canvas.width, 3);

  // Scrolling ground dirt chevrons
  ctx.fillStyle = '#ca8a04';
  for (let x = -20 - groundOffset; x < canvas.width + 20; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, canvas.height - 48);
    ctx.lineTo(x + 10, canvas.height - 48);
    ctx.lineTo(x + 4, canvas.height - 36);
    ctx.lineTo(x - 6, canvas.height - 36);
    ctx.closePath();
    ctx.fill();
  }

  // Bird
  ctx.save();
  ctx.translate(bird.x, bird.y);

  // Responsive dynamic tilt based on velocity
  const tiltAngle = Math.min(Math.PI / 3.5, Math.max(-Math.PI / 4, bird.velocity * 0.12));
  ctx.rotate(tiltAngle);

  // Bird body
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Wing (flaps up when climbing, drops down when falling)
  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (bird.velocity < 0) {
    // Wing flapping up
    ctx.ellipse(-3, -2, 7, 4, -0.4, 0, Math.PI * 2);
  } else {
    // Wing coasting/falling
    ctx.ellipse(-3, 2, 7, 4, 0.3, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(4, -4, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(6, -4, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(7, -2);
  ctx.lineTo(16, 2);
  ctx.lineTo(7, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 1;
  ctx.stroke();

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
