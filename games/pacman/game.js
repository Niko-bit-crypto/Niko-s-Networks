// PAC-MAN CLASSIC - 1980s Retro Coin-Op
const canvas = document.getElementById('pacmanCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const levelEl = document.getElementById('level');
const livesDisplay = document.getElementById('lives-display');
const overlay = document.getElementById('overlay');
const overlayMsg = document.getElementById('overlay-msg');
const startBtn = document.getElementById('startBtn') || document.getElementById('start-btn');

const COLS = 19;
const ROWS = 21;
const TILE_SIZE = 20; // 19 * 20 = 380, 21 * 20 = 420

// 0: empty, 1: wall, 2: dot, 3: energizer, 4: ghost house, 5: ghost gate, 9: fruit spot
const ORIGINAL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,5,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,4,4,4,1,0,0,2,0,0,0,0], // Row 10: Tunnel Wrap Row!
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,9,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let map = [];
let score = 0;
let highScore = 0;
try {
  highScore = parseInt(localStorage.getItem('niko_pacman_high') || '0', 10);
  if (isNaN(highScore)) highScore = 0;
} catch (e) {
  highScore = 0;
}
let level = 1;
let lives = 3;
let isPlaying = false;
let isGameOver = false;
let totalDots = 0;
let dotsRemaining = 0;
let fruitActive = false;
let fruitTimer = 0;
let frightenedTimer = 0;
let ghostsEatenInFright = 0;

// Web Audio Synth for Authentic 80s Bleeps
let audioCtx = null;
function getAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.08, vol = 0.1) {
  try {
    const actx = getAudio();
    if (!actx) return;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, actx.currentTime);
    gain.gain.setValueAtTime(vol, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + duration);
  } catch (e) {}
}

let chompPitch = false;
function playChomp() {
  playTone(chompPitch ? 480 : 360, 'triangle', 0.06, 0.12);
  chompPitch = !chompPitch;
}

function playEnergizerSound() {
  playTone(180, 'square', 0.15, 0.15);
}

function playEatGhostSound() {
  try {
    const actx = getAudio();
    if (!actx) return;
    [400, 550, 700, 880].forEach((f, i) => {
      setTimeout(() => playTone(f, 'square', 0.07, 0.15), i * 50);
    });
  } catch (e) {}
}

function playDeathSound() {
  try {
    const actx = getAudio();
    if (!actx) return;
    for (let i = 0; i < 8; i++) {
      setTimeout(() => playTone(500 - i * 40, 'sawtooth', 0.08, 0.15), i * 60);
    }
  } catch (e) {}
}

// Pacman Object
let pacman = {
  x: 9 * TILE_SIZE + 10,
  y: 16 * TILE_SIZE + 10,
  speed: 2.2,
  dx: 0,
  dy: 0,
  nextDx: 0,
  nextDy: 0,
  radius: 8,
  mouthAngle: 0.2,
  mouthSpeed: 0.02,
  mouthMax: 0.35,
  rotation: 0
};

// Ghosts
const GHOST_DEFS = [
  { name: 'Blinky', color: '#ff0000', homeX: 9, homeY: 8, startX: 9, startY: 8, waitTime: 0 },
  { name: 'Pinky',  color: '#ffb8ff', homeX: 9, homeY: 10, startX: 9, startY: 10, waitTime: 90 },
  { name: 'Inky',   color: '#00ffff', homeX: 8, homeY: 10, startX: 8, startY: 10, waitTime: 220 },
  { name: 'Clyde',  color: '#ffb852', homeX: 10, homeY: 10, startX: 10, startY: 10, waitTime: 360 }
];

let ghosts = [];

function initGhosts() {
  ghosts = GHOST_DEFS.map(def => ({
    ...def,
    x: def.startX * TILE_SIZE + 10,
    y: def.startY * TILE_SIZE + 10,
    dx: 0,
    dy: -1,
    speed: 1.8,
    state: def.waitTime === 0 ? 'chase' : 'house',
    timer: def.waitTime,
    frightened: false,
    eaten: false
  }));
}

function resetLevel(newMap = true) {
  if (newMap) {
    map = ORIGINAL_MAP.map(row => [...row]);
    totalDots = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] === 2 || map[r][c] === 3) totalDots++;
      }
    }
    dotsRemaining = totalDots;
    fruitActive = false;
    fruitTimer = 0;
  }

  pacman.x = 9 * TILE_SIZE + 10;
  pacman.y = 16 * TILE_SIZE + 10;
  pacman.dx = 0;
  pacman.dy = 0;
  pacman.nextDx = 0;
  pacman.nextDy = 0;
  pacman.rotation = 0;

  initGhosts();
  frightenedTimer = 0;
  ghostsEatenInFright = 0;
}

function updateHUD() {
  scoreEl.textContent = String(score).padStart(2, '0');
  highScoreEl.textContent = String(highScore).padStart(2, '0');
  levelEl.textContent = level;

  livesDisplay.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    const life = document.createElement('div');
    life.className = 'life-icon';
    livesDisplay.appendChild(life);
  }
}

function isWall(col, row, isGhost = false, ghostEaten = false) {
  // Handle tunnel wrap
  if (row === 10 && (col < 0 || col >= COLS)) return false;
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true;

  const tile = map[row][col];
  if (tile === 1) return true;
  if (tile === 5) {
    // Gate: eaten ghosts or ghosts exiting house can pass
    if (isGhost) return false;
    return true; // Pacman cannot pass
  }
  if (tile === 4 && !isGhost) return true;
  return false;
}

function canMove(x, y, dx, dy, isGhost = false, ghostEaten = false) {
  const nextX = x + dx * 10;
  const nextY = y + dy * 10;
  const col = Math.floor(nextX / TILE_SIZE);
  const row = Math.floor(nextY / TILE_SIZE);
  return !isWall(col, row, isGhost, ghostEaten);
}

function updatePacman() {
  // Check if we can turn in next direction
  if (pacman.nextDx !== 0 || pacman.nextDy !== 0) {
    const col = Math.floor(pacman.x / TILE_SIZE);
    const row = Math.floor(pacman.y / TILE_SIZE);
    const centerX = col * TILE_SIZE + 10;
    const centerY = row * TILE_SIZE + 10;

    // Turn alignment tolerance
    const distToCenter = Math.hypot(pacman.x - centerX, pacman.y - centerY);
    if (distToCenter < 5 && canMove(centerX, centerY, pacman.nextDx, pacman.nextDy)) {
      pacman.x = centerX;
      pacman.y = centerY;
      pacman.dx = pacman.nextDx;
      pacman.dy = pacman.nextDy;
      pacman.nextDx = 0;
      pacman.nextDy = 0;
    }
  }

  // Move along current direction
  if (canMove(pacman.x, pacman.y, pacman.dx, pacman.dy)) {
    pacman.x += pacman.dx * pacman.speed;
    pacman.y += pacman.dy * pacman.speed;

    // Chomp mouth animation
    pacman.mouthAngle += pacman.mouthSpeed;
    if (pacman.mouthAngle >= pacman.mouthMax || pacman.mouthAngle <= 0.05) {
      pacman.mouthSpeed = -pacman.mouthSpeed;
    }

    // Direction rotation for drawing
    if (pacman.dx === 1) pacman.rotation = 0;
    else if (pacman.dx === -1) pacman.rotation = Math.PI;
    else if (pacman.dy === 1) pacman.rotation = Math.PI / 2;
    else if (pacman.dy === -1) pacman.rotation = -Math.PI / 2;
  }

  // Wrap around tunnel at row 10
  if (pacman.y > 9 * TILE_SIZE && pacman.y < 11 * TILE_SIZE) {
    if (pacman.x < -10) pacman.x = COLS * TILE_SIZE + 8;
    else if (pacman.x > COLS * TILE_SIZE + 10) pacman.x = -8;
  }

  // Eating dots / power pellets
  const col = Math.floor(pacman.x / TILE_SIZE);
  const row = Math.floor(pacman.y / TILE_SIZE);
  if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
    const tile = map[row][col];
    if (tile === 2) {
      // Normal dot
      map[row][col] = 0;
      score += 10;
      dotsRemaining--;
      playChomp();

      // Trigger fruit spawn
      if (dotsRemaining === Math.floor(totalDots * 0.7) || dotsRemaining === Math.floor(totalDots * 0.3)) {
        fruitActive = true;
        fruitTimer = 500; // ~8 seconds
      }
    } else if (tile === 3) {
      // Power Pellet / Energizer
      map[row][col] = 0;
      score += 50;
      dotsRemaining--;
      frightenedTimer = 480; // 8 seconds
      ghostsEatenInFright = 0;
      ghosts.forEach(g => {
        if (g.state !== 'house' && !g.eaten) {
          g.frightened = true;
          // Reverse direction on frightened
          g.dx = -g.dx;
          g.dy = -g.dy;
        }
      });
      playEnergizerSound();
    } else if (tile === 9 && fruitActive) {
      // Fruit eaten
      fruitActive = false;
      score += 100 * level;
      playEatGhostSound();
    }

    if (score > highScore) {
      highScore = score;
      try {
        localStorage.setItem('niko_pacman_high', highScore);
      } catch (e) {}
    }
  }

  // Level Clear!
  if (dotsRemaining <= 0) {
    level++;
    levelClear();
  }
}

function levelClear() {
  isPlaying = false;
  overlay.querySelector('.marquee-title').textContent = 'LEVEL CLEAR!';
  overlayMsg.textContent = `BONUS POINTS AWARDED! PREPARE FOR LEVEL ${level}`;
  startBtn.textContent = `START LEVEL ${level}`;
  overlay.classList.remove('hidden');
  resetLevel(true);
}

function updateGhosts() {
  if (frightenedTimer > 0) {
    frightenedTimer--;
    if (frightenedTimer === 0) {
      ghosts.forEach(g => {
        g.frightened = false;
      });
    }
  }

  if (fruitActive) {
    fruitTimer--;
    if (fruitTimer <= 0) fruitActive = false;
  }

  ghosts.forEach(g => {
    // Ghost house timer
    if (g.state === 'house') {
      g.timer--;
      // Bounce up and down in house
      g.y += g.dy * 0.8;
      if (g.y < 10 * TILE_SIZE + 4) g.dy = 1;
      if (g.y > 10 * TILE_SIZE + 16) g.dy = -1;

      if (g.timer <= 0) {
        g.state = 'leaving';
        g.x = 9 * TILE_SIZE + 10;
      }
      return;
    }

    // Ghost leaving house through door (row 9, col 9)
    if (g.state === 'leaving') {
      g.y -= 1.5;
      if (g.y <= 8 * TILE_SIZE + 10) {
        g.y = 8 * TILE_SIZE + 10;
        g.state = 'chase';
        g.dx = Math.random() < 0.5 ? -1 : 1;
        g.dy = 0;
      }
      return;
    }

    // Ghost returning to house when eaten
    if (g.eaten) {
      const targetX = 9 * TILE_SIZE + 10;
      const targetY = 8 * TILE_SIZE + 10;
      const dist = Math.hypot(g.x - targetX, g.y - targetY);
      if (dist < 8) {
        g.eaten = false;
        g.frightened = false;
        g.state = 'leaving';
        return;
      }
    }

    const currentSpeed = g.eaten ? 3.0 : g.frightened ? 1.2 : 1.7 + level * 0.08;

    // Corridor intersection movement
    const col = Math.floor(g.x / TILE_SIZE);
    const row = Math.floor(g.y / TILE_SIZE);
    const centerX = col * TILE_SIZE + 10;
    const centerY = row * TILE_SIZE + 10;
    const distToCenter = Math.hypot(g.x - centerX, g.y - centerY);

    if (distToCenter < 3) {
      // At intersection, pick best direction to target
      let targetX = pacman.x;
      let targetY = pacman.y;

      if (g.eaten) {
        targetX = 9 * TILE_SIZE + 10;
        targetY = 8 * TILE_SIZE + 10;
      } else if (g.frightened) {
        // Random target
        targetX = Math.random() * canvas.width;
        targetY = Math.random() * canvas.height;
      } else {
        // Individual Ghost Personalities
        if (g.name === 'Blinky') {
          targetX = pacman.x;
          targetY = pacman.y;
        } else if (g.name === 'Pinky') {
          targetX = pacman.x + pacman.dx * 60;
          targetY = pacman.y + pacman.dy * 60;
        } else if (g.name === 'Inky') {
          targetX = pacman.x + (pacman.x - ghosts[0].x);
          targetY = pacman.y + (pacman.y - ghosts[0].y);
        } else if (g.name === 'Clyde') {
          const d = Math.hypot(g.x - pacman.x, g.y - pacman.y);
          if (d > 120) {
            targetX = pacman.x;
            targetY = pacman.y;
          } else {
            targetX = 20;
            targetY = canvas.height - 20;
          }
        }
      }

      const dirs = [
        { dx: 0, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 0 }
      ];

      // Exclude 180 reverse unless stuck
      let validDirs = dirs.filter(d => {
        if (d.dx === -g.dx && d.dy === -g.dy) return false;
        return canMove(centerX, centerY, d.dx, d.dy, true, g.eaten);
      });

      if (validDirs.length === 0) {
        validDirs = dirs.filter(d => canMove(centerX, centerY, d.dx, d.dy, true, g.eaten));
      }

      if (validDirs.length > 0) {
        // Sort by distance to target
        validDirs.sort((a, b) => {
          const distA = Math.hypot((centerX + a.dx * TILE_SIZE) - targetX, (centerY + a.dy * TILE_SIZE) - targetY);
          const distB = Math.hypot((centerX + b.dx * TILE_SIZE) - targetX, (centerY + b.dy * TILE_SIZE) - targetY);
          return distA - distB;
        });

        g.x = centerX;
        g.y = centerY;
        g.dx = validDirs[0].dx;
        g.dy = validDirs[0].dy;
      }
    }

    g.x += g.dx * currentSpeed;
    g.y += g.dy * currentSpeed;

    // Tunnel wrap for ghosts
    if (g.y > 9 * TILE_SIZE && g.y < 11 * TILE_SIZE) {
      if (g.x < -10) g.x = COLS * TILE_SIZE + 8;
      else if (g.x > COLS * TILE_SIZE + 10) g.x = -8;
    }

    // Ghost collision with Pac-Man
    const distToPac = Math.hypot(g.x - pacman.x, g.y - pacman.y);
    if (distToPac < 14) {
      if (g.frightened && !g.eaten) {
        // Eat ghost!
        g.eaten = true;
        g.frightened = false;
        ghostsEatenInFright++;
        const pts = 200 * Math.pow(2, ghostsEatenInFright - 1);
        score += pts;
        playEatGhostSound();
      } else if (!g.eaten && g.state !== 'house' && g.state !== 'leaving') {
        // Pacman caught!
        pacmanDeath();
      }
    }
  });
}

function pacmanDeath() {
  playDeathSound();
  lives--;
  updateHUD();

  if (lives <= 0) {
    gameOver();
  } else {
    // Reset positions for current life
    resetLevel(false);
  }
}

function gameOver() {
  isPlaying = false;
  isGameOver = true;
  overlay.querySelector('.marquee-title').textContent = 'GAME OVER';
  overlayMsg.textContent = `FINAL SCORE: ${score} | HIGH SCORE: ${highScore}`;
  startBtn.textContent = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

function draw() {
  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Maze Walls & Pellets
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = map[r][c];
      const px = c * TILE_SIZE;
      const py = r * TILE_SIZE;

      if (tile === 1) {
        // Wall - Retro Neon Blue
        ctx.fillStyle = '#001155';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      } else if (tile === 2) {
        // Small Dot
        ctx.fillStyle = '#ffb8ae';
        ctx.beginPath();
        ctx.arc(px + 10, py + 10, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (tile === 3) {
        // Power Pellet / Energizer (Pulsing)
        const pulse = Math.abs(Math.sin(Date.now() * 0.006));
        ctx.fillStyle = '#ffe600';
        ctx.beginPath();
        ctx.arc(px + 10, py + 10, 5 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (tile === 5) {
        // Ghost Gate
        ctx.fillStyle = '#ff77bc';
        ctx.fillRect(px, py + 8, TILE_SIZE, 4);
      }
    }
  }

  // Fruit Bonus (Cherry)
  if (fruitActive) {
    const fx = 9 * TILE_SIZE + 10;
    const fy = 12 * TILE_SIZE + 10;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍒', fx, fy);
  }

  // Draw Pac-Man
  ctx.save();
  ctx.translate(pacman.x, pacman.y);
  ctx.rotate(pacman.rotation);

  ctx.fillStyle = '#ffe600';
  ctx.beginPath();
  const mouth = pacman.mouthAngle;
  ctx.arc(0, 0, pacman.radius, mouth, Math.PI * 2 - mouth);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(0, -5, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Draw Ghosts
  ghosts.forEach(g => {
    ctx.save();
    ctx.translate(g.x, g.y);

    if (g.eaten) {
      // Just eyes
      drawGhostEyes(ctx, g.dx, g.dy);
    } else {
      let ghostColor = g.color;
      if (g.frightened) {
        // Flashing near end of frightened duration
        if (frightenedTimer < 120 && Math.floor(frightenedTimer / 15) % 2 === 0) {
          ghostColor = '#ffffff';
        } else {
          ghostColor = '#1d4ed8';
        }
      }

      // Ghost Body
      ctx.fillStyle = ghostColor;
      ctx.beginPath();
      ctx.arc(0, -2, 8, Math.PI, 0, false);
      ctx.lineTo(8, 6);
      // Wavy bottom skirt
      ctx.lineTo(5, 4);
      ctx.lineTo(2, 6);
      ctx.lineTo(-2, 4);
      ctx.lineTo(-5, 6);
      ctx.lineTo(-8, 4);
      ctx.lineTo(-8, -2);
      ctx.closePath();
      ctx.fill();

      if (g.frightened) {
        // Scared face
        ctx.fillStyle = '#ffb8ae';
        ctx.fillRect(-4, -4, 2, 2);
        ctx.fillRect(2, -4, 2, 2);
        // Squiggly mouth
        ctx.strokeStyle = '#ffb8ae';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-5, 2);
        ctx.lineTo(-2, 0);
        ctx.lineTo(0, 2);
        ctx.lineTo(2, 0);
        ctx.lineTo(5, 2);
        ctx.stroke();
      } else {
        drawGhostEyes(ctx, g.dx, g.dy);
      }
    }

    ctx.restore();
  });
}

function drawGhostEyes(context, dx, dy) {
  // Sclera
  context.fillStyle = '#ffffff';
  context.beginPath();
  context.arc(-3.5 + dx, -3 + dy, 3, 0, Math.PI * 2);
  context.arc(3.5 + dx, -3 + dy, 3, 0, Math.PI * 2);
  context.fill();

  // Pupil
  context.fillStyle = '#0011ff';
  context.beginPath();
  context.arc(-3.5 + dx * 1.5, -3 + dy * 1.5, 1.6, 0, Math.PI * 2);
  context.arc(3.5 + dx * 1.5, -3 + dy * 1.5, 1.6, 0, Math.PI * 2);
  context.fill();
}

function gameLoop() {
  if (isPlaying) {
    updatePacman();
    updateGhosts();
    updateHUD();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

function setDirection(dx, dy) {
  pacman.nextDx = dx;
  pacman.nextDy = dy;
}

// Keyboard controls
window.addEventListener('keydown', e => {
  getAudio();
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    e.preventDefault();
    setDirection(0, -1);
  } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    e.preventDefault();
    setDirection(0, 1);
  } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    e.preventDefault();
    setDirection(-1, 0);
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    e.preventDefault();
    setDirection(1, 0);
  } else if (e.key === ' ' || e.key === 'Enter') {
    if (!isPlaying) startGame();
  }
});

// Mobile swipe controls
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
  getAudio();
  if (e.touches && e.touches[0]) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

canvas.addEventListener('touchend', e => {
  if (!isPlaying) {
    startGame();
    return;
  }
  if (e.changedTouches && e.changedTouches[0]) {
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (Math.max(absX, absY) > 15) {
      if (absX > absY) {
        setDirection(diffX > 0 ? 1 : -1, 0);
      } else {
        setDirection(0, diffY > 0 ? 1 : -1);
      }
    }
  }
}, { passive: true });

// Niko's Nightclub Virtual Touch Gamepad postMessage listener
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'arcade-key') {
    getAudio();
    const { key, action } = e.data;
    if (action === 'keydown') {
      if (key === 'ArrowUp' || key === 'w') setDirection(0, -1);
      else if (key === 'ArrowDown' || key === 's') setDirection(0, 1);
      else if (key === 'ArrowLeft' || key === 'a') setDirection(-1, 0);
      else if (key === 'ArrowRight' || key === 'd') setDirection(1, 0);
      else if (key === ' ' || key === 'Enter') {
        if (!isPlaying) startGame();
      }
    }
  }
});

function startGame() {
  getAudio();
  if (isGameOver) {
    score = 0;
    level = 1;
    lives = 3;
    isGameOver = false;
  }
  resetLevel(true);
  overlay.classList.add('hidden');
  isPlaying = true;
  updateHUD();
}

startBtn.addEventListener('click', startGame);

resetLevel(true);
updateHUD();
draw();
requestAnimationFrame(gameLoop);
