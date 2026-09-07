const canvas = document.getElementById('runnerCanvas');
const ctx = canvas.getContext('2d');
const distEl = document.getElementById('dist');
const speedEl = document.getElementById('speed');
const bestDistEl = document.getElementById('bestDist');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

const GROUND_Y = canvas.height - 30;

let dino = {
  x: 50,
  y: GROUND_Y - 40,
  w: 24,
  h: 40,
  vy: 0,
  jumpStrength: -11,
  gravity: 0.6,
  isGrounded: true,
  isDucking: false
};

let obstacles = [];
let clouds = [];
let distance = 0;
let baseSpeed = 5;
let currentSpeed = baseSpeed;
let isPlaying = false;
let frameCount = 0;
let bestDistance = parseInt(localStorage.getItem('unblocked_runner_best') || '0', 10);
bestDistEl.textContent = bestDistance;

function resetGame() {
  dino.y = GROUND_Y - 40;
  dino.h = 40;
  dino.vy = 0;
  dino.isGrounded = true;
  dino.isDucking = false;
  obstacles = [];
  clouds = [
    { x: 100, y: 30, w: 50 },
    { x: 320, y: 50, w: 60 },
    { x: 480, y: 25, w: 40 }
  ];
  distance = 0;
  currentSpeed = baseSpeed;
  frameCount = 0;
}

function spawnObstacle() {
  const isBird = Math.random() < 0.25 && distance > 200;
  if (isBird) {
    obstacles.push({
      type: 'bird',
      x: canvas.width,
      y: GROUND_Y - 45 - (Math.random() > 0.5 ? 20 : 0),
      w: 26,
      h: 18
    });
  } else {
    const isDouble = Math.random() < 0.3;
    obstacles.push({
      type: 'cactus',
      x: canvas.width,
      y: GROUND_Y - 36,
      w: isDouble ? 28 : 16,
      h: 36
    });
  }
}

function jump() {
  if (dino.isGrounded && !dino.isDucking) {
    dino.vy = dino.jumpStrength;
    dino.isGrounded = false;
  }
}

function duck(active) {
  if (active) {
    if (!dino.isDucking) {
      dino.isDucking = true;
      dino.h = 24;
      if (dino.isGrounded) {
        dino.y = GROUND_Y - 24;
      }
    }
  } else {
    if (dino.isDucking) {
      dino.isDucking = false;
      dino.h = 40;
      if (dino.isGrounded) {
        dino.y = GROUND_Y - 40;
      }
    }
  }
}

function startGame() {
  resetGame();
  overlay.classList.add('hidden');
  isPlaying = true;
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  isPlaying = false;
  if (distance > bestDistance) {
    bestDistance = distance;
    bestDistEl.textContent = bestDistance;
    localStorage.setItem('unblocked_runner_best', bestDistance);
  }
  overlay.querySelector('h2').textContent = 'GAME OVER';
  overlay.querySelector('p').textContent = `Distance: ${distance}m | Record: ${bestDistance}m`;
  startBtn.textContent = 'Run Again';
  overlay.classList.remove('hidden');
}

function update() {
  frameCount++;
  distance += 1;
  distEl.textContent = distance;

  // Speed scaling
  currentSpeed = baseSpeed + Math.min(6, Math.floor(distance / 250) * 0.5);
  speedEl.textContent = (currentSpeed / baseSpeed).toFixed(1);

  // Physics
  dino.vy += dino.gravity;
  dino.y += dino.vy;

  const currentHeight = dino.isDucking ? 24 : 40;
  if (dino.y >= GROUND_Y - currentHeight) {
    dino.y = GROUND_Y - currentHeight;
    dino.vy = 0;
    dino.isGrounded = true;
  }

  // Clouds
  clouds.forEach(c => {
    c.x -= currentSpeed * 0.2;
    if (c.x + c.w < 0) {
      c.x = canvas.width + Math.random() * 80;
      c.y = 20 + Math.random() * 40;
    }
  });

  // Obstacles spawning
  const minInterval = Math.max(50, 110 - Math.floor(distance / 300) * 5);
  if (frameCount % minInterval === 0 && Math.random() > 0.2) {
    spawnObstacle();
  }

  // Obstacle movement & collisions
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.x -= currentSpeed;

    // Collision box check
    const dBox = {
      x: dino.x + 3,
      y: dino.y + 3,
      w: dino.w - 6,
      h: dino.h - 6
    };

    if (
      dBox.x < obs.x + obs.w &&
      dBox.x + dBox.w > obs.x &&
      dBox.y < obs.y + obs.h &&
      dBox.y + dBox.h > obs.y
    ) {
      gameOver();
      return;
    }
  }

  obstacles = obstacles.filter(obs => obs.x + obs.w > 0);
}

function draw() {
  // Clear
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground line
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();

  // Clouds
  ctx.fillStyle = '#1e293b';
  clouds.forEach(c => {
    ctx.beginPath();
    ctx.roundRect(c.x, c.y, c.w, 14, 7);
    ctx.fill();
  });

  // Dino
  ctx.fillStyle = '#10b981';
  ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
  // Dino eye
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(dino.x + (dino.isDucking ? 16 : 14), dino.y + 6, 4, 4);

  // Obstacles
  obstacles.forEach(obs => {
    if (obs.type === 'bird') {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(obs.x + 4, obs.y + 4, 4, 4);
    } else {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      // Cactus arms
      ctx.fillRect(obs.x - 3, obs.y + 8, 4, 10);
      ctx.fillRect(obs.x + obs.w - 1, obs.y + 12, 4, 10);
    }
  });
}

function gameLoop() {
  if (!isPlaying) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
    e.preventDefault();
  }
  if (!isPlaying && (e.key === ' ' || e.key === 'Enter')) {
    startGame();
    return;
  }
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    jump();
  } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    duck(true);
  }
});

window.addEventListener('keyup', e => {
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    duck(false);
  }
});

// Mobile touch controls: tap to jump, swipe down to duck
let runnerTouchY = 0;
canvas.addEventListener('touchstart', e => {
  if (e.touches.length > 0) {
    runnerTouchY = e.touches[0].clientY;
  }
  if (!isPlaying) {
    startGame();
    return;
  }
  jump();
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  if (!isPlaying) return;
  if (e.touches.length > 0) {
    const dy = e.touches[0].clientY - runnerTouchY;
    if (dy > 30) {
      duck(true);
    }
  }
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', e => {
  duck(false);
  e.preventDefault();
}, { passive: false });

// Mobile Gamepad PostMessage Listener
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'arcade-key') {
    const key = e.data.key;
    const isDown = e.data.action === 'keydown';
    if (isDown) {
      if (!isPlaying && (key === ' ' || key === 'Enter' || key === 'Start')) {
        startGame();
        return;
      }
      if (key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W' || key === 'Jump') {
        jump();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S' || key === 'Duck') {
        duck(true);
      }
    } else {
      if (key === 'ArrowDown' || key === 's' || key === 'S' || key === 'Duck') {
        duck(false);
      }
    }
  }
});

startBtn.addEventListener('click', startGame);
draw();
