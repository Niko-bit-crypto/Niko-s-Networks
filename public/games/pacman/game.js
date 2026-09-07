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

function playRespawnSound() {
  try {
    const actx = getAudio();
    if (!actx) return;
    [440, 554.37, 659.25, 880].forEach((f, i) => {
      setTimeout(() => playTone(f, 'triangle', 0.08, 0.12), i * 50);
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
  { name: 'Blinky', color: '#ff0000', startX: 9, startY: 8, waitTime: 0 },
  { name: 'Pinky',  color: '#ffb8ff', startX: 9, startY: 10, waitTime: 60 },
  { name: 'Inky',   color: '#00ffff', startX: 8, startY: 10, waitTime: 180 },
  { name: 'Clyde',  color: '#ffb852', startX: 10, startY: 10, waitTime: 300 }
];

let ghosts = [];
let floatingScores = [];

function addFloatingScore(x, y, text) {
  floatingScores.push({ x, y, text, timer: 60 });
}

function initGhosts() {
  ghosts = GHOST_DEFS.map(def => ({
    ...def,
    x: def.startX * TILE_SIZE + 10,
    y: def.startY * TILE_SIZE + 10,
    dx: def.waitTime === 0 ? -1 : 0,
    dy: 0,
    speed: 1.8,
    state: def.waitTime === 0 ? 'chase' : 'house',
    timer: def.waitTime,
    frightened: false,
    eaten: false,
    eatenTimer: 0,
    respawnGlow: 0
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
  floatingScores = [];
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

function isWalkableForGhost(col, row, eaten = false, exiting = false) {
  // Row 10 is the warp tunnel
  if (row === 10) {
    if (col < 0 || col >= COLS) return true;
  }
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;

  const tile = map[row][col];
  if (tile === 1) return false; // Wall
  if (tile === 5) {
    // Gate: only ghosts entering (eaten) or exiting can cross
    return eaten || exiting;
  }
  if (tile === 4) {
    // Inside house: only allowed if eaten or entering
    return eaten || exiting;
  }
  return true;
}

function isWalkableForPac(col, row) {
  // Row 10 warp tunnel
  if (row === 10) {
    if (col < 0 || col >= COLS) return true;
  }
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  const tile = map[row][col];
  // Walls, gate, and house interior are impassable for Pac-Man
  return tile !== 1 && tile !== 5 && tile !== 4;
}

function updatePacman() {
  // 1. Instant 180 reverse in corridors
  if (pacman.nextDx !== 0 && pacman.nextDx === -pacman.dx) {
    pacman.dx = pacman.nextDx;
    pacman.nextDx = 0;
  } else if (pacman.nextDy !== 0 && pacman.nextDy === -pacman.dy) {
    pacman.dy = pacman.nextDy;
    pacman.nextDy = 0;
  }

  // 2. Current tile center
  const c = Math.floor(pacman.x / TILE_SIZE);
  const r = Math.floor(pacman.y / TILE_SIZE);
  const centerX = c * TILE_SIZE + 10;
  const centerY = r * TILE_SIZE + 10;

  // Check if reached/crossed tile center
  let reachedCenter = false;
  if (pacman.dx > 0 && pacman.x <= centerX && (pacman.x + pacman.dx * pacman.speed) >= centerX) reachedCenter = true;
  else if (pacman.dx < 0 && pacman.x >= centerX && (pacman.x + pacman.dx * pacman.speed) <= centerX) reachedCenter = true;
  else if (pacman.dy > 0 && pacman.y <= centerY && (pacman.y + pacman.dy * pacman.speed) >= centerY) reachedCenter = true;
  else if (pacman.dy < 0 && pacman.y >= centerY && (pacman.y + pacman.dy * pacman.speed) <= centerY) reachedCenter = true;
  else if (pacman.dx === 0 && pacman.dy === 0) reachedCenter = true;

  if (reachedCenter) {
    pacman.x = centerX;
    pacman.y = centerY;

    // Try turning to buffered next direction
    if (pacman.nextDx !== 0 || pacman.nextDy !== 0) {
      if (isWalkableForPac(c + pacman.nextDx, r + pacman.nextDy)) {
        pacman.dx = pacman.nextDx;
        pacman.dy = pacman.nextDy;
        pacman.nextDx = 0;
        pacman.nextDy = 0;
      }
    }

    // If forward path is blocked by wall, stop
    if (!isWalkableForPac(c + pacman.dx, r + pacman.dy)) {
      pacman.dx = 0;
      pacman.dy = 0;
    }
  }

  // Move along current direction
  if (pacman.dx !== 0 || pacman.dy !== 0) {
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
  if (r === 10) {
    if (pacman.x < -10) pacman.x = COLS * TILE_SIZE + 8;
    else if (pacman.x > COLS * TILE_SIZE + 10) pacman.x = -8;
  }

  // Eating dots / power pellets
  const currentC = Math.floor(pacman.x / TILE_SIZE);
  const currentR = Math.floor(pacman.y / TILE_SIZE);
  if (currentC >= 0 && currentC < COLS && currentR >= 0 && currentR < ROWS) {
    const tile = map[currentR][currentC];
    if (tile === 2) {
      // Normal dot
      map[currentR][currentC] = 0;
      score += 10;
      dotsRemaining--;
      playChomp();

      // Trigger fruit spawn
      if (dotsRemaining === Math.floor(totalDots * 0.7) || dotsRemaining === Math.floor(totalDots * 0.3)) {
        fruitActive = true;
        fruitTimer = 500; // ~8 seconds
      }
    } else if (tile === 3) {
      // Power Pellet / Energizer!
      map[currentR][currentC] = 0;
      score += 50;
      dotsRemaining--;
      frightenedTimer = 480; // 8 seconds of vulnerability
      ghostsEatenInFright = 0;
      ghosts.forEach(g => {
        if (g.state !== 'house' && g.state !== 'entering' && !g.eaten) {
          g.frightened = true;
          // Reverse direction immediately on frightened
          g.dx = -g.dx;
          g.dy = -g.dy;
        }
      });
      playEnergizerSound();
    } else if (tile === 9 && fruitActive) {
      // Fruit eaten
      fruitActive = false;
      score += 100 * level;
      addFloatingScore(pacman.x, pacman.y, `+${100 * level}`);
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
  // Power pellet countdown
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
    // Respawn flash glow counter
    if (g.respawnGlow > 0) g.respawnGlow--;

    // 1. Ghost inside house: waiting and bobbing
    if (g.state === 'house') {
      g.timer--;
      // Gentle bob up and down
      if (!g.dy) g.dy = 1;
      g.y += g.dy * 0.7;
      if (g.y < 10 * TILE_SIZE + 5) g.dy = 1;
      if (g.y > 10 * TILE_SIZE + 15) g.dy = -1;

      if (g.timer <= 0) {
        g.state = 'leaving';
        g.x = 9 * TILE_SIZE + 10; // Center in front of door
      }
      return;
    }

    // 2. Ghost leaving house through pink door (row 9, col 9)
    if (g.state === 'leaving') {
      g.x = 9 * TILE_SIZE + 10;
      g.y -= 1.6;
      if (g.y <= 8 * TILE_SIZE + 10) {
        g.y = 8 * TILE_SIZE + 10;
        g.state = 'chase';
        // Pick left or right into the maze
        g.dx = Math.random() < 0.5 ? -1 : 1;
        g.dy = 0;
      }
      return;
    }

    // 3. Eaten ghost eyes entering the house door to respawn
    if (g.state === 'entering') {
      g.x = 9 * TILE_SIZE + 10;
      g.y += 2.0;
      if (g.y >= 10 * TILE_SIZE + 10) {
        // REGAINS BODY & RESPAWNS!
        g.y = 10 * TILE_SIZE + 10;
        g.eaten = false;
        g.frightened = false;
        g.state = 'house';
        g.timer = 60; // Wait 1 second in house before emerging
        g.respawnGlow = 45; // Visual respawn burst
        playRespawnSound();
      }
      return;
    }

    // Safety fallback: if eyes are lost for too long, teleport back to house
    if (g.eaten) {
      g.eatenTimer++;
      if (g.eatenTimer > 600) {
        g.x = 9 * TILE_SIZE + 10;
        g.y = 10 * TILE_SIZE + 10;
        g.eaten = false;
        g.frightened = false;
        g.eatenTimer = 0;
        g.state = 'house';
        g.timer = 50;
        playRespawnSound();
        return;
      }
    }

    // Determine speed
    const currentSpeed = g.eaten ? 3.6 : g.frightened ? 1.15 : 1.7 + Math.min(level * 0.08, 0.6);

    // Current tile
    const c = Math.floor(g.x / TILE_SIZE);
    const r = Math.floor(g.y / TILE_SIZE);
    const centerX = c * TILE_SIZE + 10;
    const centerY = r * TILE_SIZE + 10;

    // Check if ghost reaches or crosses tile center
    let reachedCenter = false;
    if (g.dx > 0 && g.x <= centerX && (g.x + g.dx * currentSpeed) >= centerX) reachedCenter = true;
    else if (g.dx < 0 && g.x >= centerX && (g.x + g.dx * currentSpeed) <= centerX) reachedCenter = true;
    else if (g.dy > 0 && g.y <= centerY && (g.y + g.dy * currentSpeed) >= centerY) reachedCenter = true;
    else if (g.dy < 0 && g.y >= centerY && (g.y + g.dy * currentSpeed) <= centerY) reachedCenter = true;
    else if (g.dx === 0 && g.dy === 0) reachedCenter = true;

    if (reachedCenter) {
      g.x = centerX;
      g.y = centerY;

      // If eaten ghost reaches house door entrance at (9, 8), transition to entering
      if (g.eaten && c === 9 && r === 8) {
        g.state = 'entering';
        g.dx = 0;
        g.dy = 1;
        return;
      }

      // Target selection
      let targetX = pacman.x;
      let targetY = pacman.y;

      if (g.eaten) {
        // Eaten eyes head straight for the ghost house door
        targetX = 9 * TILE_SIZE + 10;
        targetY = 8 * TILE_SIZE + 10;
      } else if (g.frightened) {
        // Frightened ghosts wander unpredictably
        targetX = Math.floor(Math.random() * COLS) * TILE_SIZE + 10;
        targetY = Math.floor(Math.random() * ROWS) * TILE_SIZE + 10;
      } else {
        // Personality-based chasing
        if (g.name === 'Blinky') {
          // Direct chaser
          targetX = pacman.x;
          targetY = pacman.y;
        } else if (g.name === 'Pinky') {
          // Ambusher: 4 tiles ahead of Pac-Man
          targetX = pacman.x + pacman.dx * 80;
          targetY = pacman.y + pacman.dy * 80;
        } else if (g.name === 'Inky') {
          // Flanker
          targetX = pacman.x + (pacman.x - ghosts[0].x);
          targetY = pacman.y + (pacman.y - ghosts[0].y);
        } else if (g.name === 'Clyde') {
          // Coward: chases when far, flees to bottom-left corner when close
          const dist = Math.hypot(g.x - pacman.x, g.y - pacman.y);
          if (dist > 140) {
            targetX = pacman.x;
            targetY = pacman.y;
          } else {
            targetX = 1 * TILE_SIZE + 10;
            targetY = 19 * TILE_SIZE + 10;
          }
        }
      }

      // Candidate directions: Up, Left, Down, Right
      const dirs = [
        { dx: 0, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 0 }
      ];

      // Exclude 180-degree reverse unless dead end
      let validDirs = dirs.filter(d => {
        if (d.dx === -g.dx && d.dy === -g.dy) return false;
        return isWalkableForGhost(c + d.dx, r + d.dy, g.eaten, false);
      });

      if (validDirs.length === 0) {
        // Dead end: allow reverse
        validDirs = dirs.filter(d => isWalkableForGhost(c + d.dx, r + d.dy, g.eaten, false));
      }

      if (validDirs.length > 0) {
        if (g.frightened && !g.eaten) {
          // Random turn at intersections for frightened ghosts
          const pick = validDirs[Math.floor(Math.random() * validDirs.length)];
          g.dx = pick.dx;
          g.dy = pick.dy;
        } else {
          // Sort by distance to target
          validDirs.sort((a, b) => {
            const ax = (c + a.dx) * TILE_SIZE + 10;
            const ay = (r + a.dy) * TILE_SIZE + 10;
            const bx = (c + b.dx) * TILE_SIZE + 10;
            const by = (r + b.dy) * TILE_SIZE + 10;
            const distA = Math.hypot(ax - targetX, ay - targetY);
            const distB = Math.hypot(bx - targetX, by - targetY);
            return distA - distB;
          });
          g.dx = validDirs[0].dx;
          g.dy = validDirs[0].dy;
        }
      }
    }

    // Move ghost
    g.x += g.dx * currentSpeed;
    g.y += g.dy * currentSpeed;

    // Warp tunnel row 10
    if (r === 10) {
      if (g.x < -10) g.x = COLS * TILE_SIZE + 8;
      else if (g.x > COLS * TILE_SIZE + 10) g.x = -8;
    }

    // Collision with Pac-Man
    const distToPac = Math.hypot(g.x - pacman.x, g.y - pacman.y);
    if (distToPac < 15) {
      if (g.frightened && !g.eaten) {
        // EAT THE GHOST!
        g.eaten = true;
        g.frightened = false;
        g.eatenTimer = 0;
        ghostsEatenInFright++;
        const pts = 200 * Math.pow(2, Math.min(ghostsEatenInFright - 1, 3));
        score += pts;
        addFloatingScore(g.x, g.y, `+${pts}`);
        playEatGhostSound();
      } else if (!g.eaten && !g.frightened && g.state !== 'house' && g.state !== 'leaving' && g.state !== 'entering') {
        // Pac-Man caught by ghost!
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
      // Respawn sparkle/glow ring
      if (g.respawnGlow > 0) {
        ctx.save();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 10 + (45 - g.respawnGlow) * 0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      let ghostColor = g.color;
      if (g.frightened) {
        // Flashing near end of frightened duration
        if (frightenedTimer < 140 && Math.floor(frightenedTimer / 12) % 2 === 0) {
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

  // Floating Score Popups (e.g. +200, +400, +800)
  floatingScores = floatingScores.filter(s => {
    s.y -= 0.4;
    s.timer--;
    ctx.save();
    ctx.font = 'bold 10px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = `rgba(0, 255, 255, ${Math.max(0, s.timer / 60)})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.text, s.x, s.y);
    ctx.restore();
    return s.timer > 0;
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
