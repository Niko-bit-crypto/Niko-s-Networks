const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const waveEl = document.getElementById('wave');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

let player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 35,
  w: 30,
  h: 18,
  speed: 6
};

let bullets = [];
let enemyBullets = [];
let enemies = [];
let stars = [];
let score = 0;
let lives = 3;
let wave = 1;
let isPlaying = false;
let enemyDir = 1;
let enemyStepDown = false;
let lastShootTime = 0;
let enemySpeed = 1;

const keys = {};

function initStars() {
  stars = [];
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: 0.5 + Math.random() * 1.5
    });
  }
}

function initEnemies() {
  enemies = [];
  const rows = 4;
  const cols = 8;
  const startX = 40;
  const startY = 40;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push({
        x: startX + c * 45,
        y: startY + r * 30,
        w: 26,
        h: 18,
        color: r === 0 ? '#ef4444' : r === 1 ? '#f97316' : r === 2 ? '#eab308' : '#10b981',
        points: (4 - r) * 10
      });
    }
  }
  enemySpeed = 0.8 + (wave - 1) * 0.3;
  enemyDir = 1;
}

function updateLives() {
  let h = '';
  for (let i = 0; i < lives; i++) h += '♥ ';
  livesEl.textContent = h.trim();
}

function startGame() {
  score = 0;
  lives = 3;
  wave = 1;
  scoreEl.textContent = score;
  waveEl.textContent = wave;
  updateLives();
  bullets = [];
  enemyBullets = [];
  initStars();
  initEnemies();
  player.x = canvas.width / 2 - player.w / 2;
  overlay.classList.add('hidden');
  isPlaying = true;
  requestAnimationFrame(gameLoop);
}

function nextWave() {
  wave++;
  waveEl.textContent = wave;
  bullets = [];
  enemyBullets = [];
  initEnemies();
}

function gameOver(won = false) {
  isPlaying = false;
  overlay.querySelector('h2').textContent = won ? 'GALAXY SAVED!' : 'MISSION FAILED';
  overlay.querySelector('p').textContent = `Final Score: ${score} | Wave: ${wave}`;
  startBtn.textContent = 'Play Again';
  overlay.classList.remove('hidden');
}

function shoot() {
  const now = performance.now();
  if (now - lastShootTime > 250) {
    bullets.push({
      x: player.x + player.w / 2 - 2,
      y: player.y,
      w: 4,
      h: 10,
      speed: 8
    });
    lastShootTime = now;
  }
}

function update() {
  // Move player
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
    player.x = Math.max(0, player.x - player.speed);
  }
  if (keys['ArrowRight'] || keys['d'] || keys['D']) {
    player.x = Math.min(canvas.width - player.w, player.x + player.speed);
  }
  if (keys[' ']) {
    shoot();
  }

  // Move stars
  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvas.height) s.y = 0;
  });

  // Move player bullets
  bullets.forEach(b => b.y -= b.speed);
  bullets = bullets.filter(b => b.y + b.h > 0);

  // Move enemy bullets
  enemyBullets.forEach(b => b.y += b.speed);
  enemyBullets = enemyBullets.filter(b => b.y < canvas.height);

  // Move enemies
  let hitWall = false;
  enemies.forEach(e => {
    e.x += enemySpeed * enemyDir;
    if (e.x + e.w >= canvas.width - 10 || e.x <= 10) {
      hitWall = true;
    }
  });

  if (hitWall) {
    enemyDir *= -1;
    enemies.forEach(e => {
      e.y += 15;
      if (e.y + e.h >= player.y) {
        gameOver(false);
      }
    });
  }

  // Enemy shooting
  if (Math.random() < 0.03 && enemies.length > 0) {
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    enemyBullets.push({
      x: randomEnemy.x + randomEnemy.w / 2 - 2,
      y: randomEnemy.y + randomEnemy.h,
      w: 4,
      h: 8,
      speed: 4
    });
  }

  // Bullet-Enemy Collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (
        b.x < e.x + e.w &&
        b.x + b.w > e.x &&
        b.y < e.y + e.h &&
        b.y + b.h > e.y
      ) {
        score += e.points;
        scoreEl.textContent = score;
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        break;
      }
    }
  }

  // Player hit check
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    if (
      eb.x < player.x + player.w &&
      eb.x + eb.w > player.x &&
      eb.y < player.y + player.h &&
      eb.y + eb.h > player.y
    ) {
      enemyBullets.splice(i, 1);
      lives--;
      updateLives();
      if (lives <= 0) {
        gameOver(false);
        return;
      }
    }
  }

  if (enemies.length === 0) {
    nextWave();
  }
}

function draw() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw stars
  ctx.fillStyle = '#94a3b8';
  stars.forEach(s => {
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });

  // Draw player
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(player.x + player.w / 2, player.y);
  ctx.lineTo(player.x + player.w, player.y + player.h);
  ctx.lineTo(player.x, player.y + player.h);
  ctx.closePath();
  ctx.fill();

  // Player bullets
  ctx.fillStyle = '#34d399';
  bullets.forEach(b => {
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });

  // Enemy bullets
  ctx.fillStyle = '#f43f5e';
  enemyBullets.forEach(eb => {
    ctx.fillRect(eb.x, eb.y, eb.w, eb.h);
  });

  // Enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.w, e.h);
    // Alien eyes
    ctx.fillStyle = '#020617';
    ctx.fillRect(e.x + 5, e.y + 4, 4, 4);
    ctx.fillRect(e.x + e.w - 9, e.y + 4, 4, 4);
  });
}

function gameLoop() {
  if (!isPlaying) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (!isPlaying && (e.key === ' ' || e.key === 'Enter')) {
    startGame();
  }
});

window.addEventListener('keyup', e => {
  keys[e.key] = false;
});

// Touch control for Space Invaders: touch left side to move left, right side to move right, tap to shoot
canvas.addEventListener('touchstart', e => {
  if (!isPlaying) {
    startGame();
    return;
  }
  if (e.touches.length > 0) {
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    if (touchX < rect.width * 0.4) {
      keys['ArrowLeft'] = true;
      keys['ArrowRight'] = false;
    } else if (touchX > rect.width * 0.6) {
      keys['ArrowRight'] = true;
      keys['ArrowLeft'] = false;
    } else {
      keys[' '] = true;
    }
  }
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', e => {
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;
  keys[' '] = false;
  e.preventDefault();
}, { passive: false });

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

startBtn.addEventListener('click', startGame);
initStars();
draw();
