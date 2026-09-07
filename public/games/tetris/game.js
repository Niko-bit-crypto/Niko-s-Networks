const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');

const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('start-btn');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

const SHAPES = {
  I: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
  J: [[1,0,0], [1,1,1], [0,0,0]],
  L: [[0,0,1], [1,1,1], [0,0,0]],
  O: [[1,1], [1,1]],
  S: [[0,1,1], [1,1,0], [0,0,0]],
  T: [[0,1,0], [1,1,1], [0,0,0]],
  Z: [[1,1,0], [0,1,1], [0,0,0]]
};

const COLORS = {
  I: '#06b6d4',
  J: '#3b82f6',
  L: '#f97316',
  O: '#eab308',
  S: '#22c55e',
  T: '#a855f7',
  Z: '#ef4444'
};

let board = [];
let currentPiece = null;
let nextPiece = null;
let holdPiece = null;
let canHold = true;
let score = 0;
let lines = 0;
let level = 1;
let dropInterval = 800;
let lastDrop = 0;
let isPlaying = false;
let animationFrameId = null;

function createBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function getRandomPiece() {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  return {
    type,
    matrix: SHAPES[type],
    x: Math.floor(COLS / 2) - Math.ceil(SHAPES[type][0].length / 2),
    y: 0
  };
}

function rotate(matrix) {
  return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
}

function collides(b, piece, offsetX = 0, offsetY = 0) {
  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (piece.matrix[r][c]) {
        const newX = piece.x + c + offsetX;
        const newY = piece.y + r + offsetY;
        if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
        if (newY >= 0 && b[newY][newX]) return true;
      }
    }
  }
  return false;
}

function merge(b, piece) {
  piece.matrix.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) {
        const boardY = piece.y + r;
        const boardX = piece.x + c;
        if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
          b[boardY][boardX] = piece.type;
        }
      }
    });
  });
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell !== 0)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800];
    score += (points[cleared] || 1000) * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 800 - (level - 1) * 70);

    scoreEl.textContent = score;
    linesEl.textContent = lines;
    levelEl.textContent = level;
  }
}

function spawnPiece() {
  currentPiece = nextPiece || getRandomPiece();
  nextPiece = getRandomPiece();
  canHold = true;
  drawPreview(nextCtx, nextPiece, nextCanvas.width, nextCanvas.height);

  if (collides(board, currentPiece)) {
    gameOver();
  }
}

function drawPreview(pCtx, piece, width, height) {
  pCtx.fillStyle = '#0f172a';
  pCtx.fillRect(0, 0, width, height);
  if (!piece) return;

  const size = 16;
  const matrix = piece.matrix;
  const offX = (width - matrix[0].length * size) / 2;
  const offY = (height - matrix.length * size) / 2;

  pCtx.fillStyle = COLORS[piece.type];
  matrix.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) {
        pCtx.fillRect(offX + c * size + 1, offY + r * size + 1, size - 2, size - 2);
      }
    });
  });
}

function drop() {
  if (!collides(board, currentPiece, 0, 1)) {
    currentPiece.y++;
  } else {
    merge(board, currentPiece);
    clearLines();
    spawnPiece();
  }
}

function hardDrop() {
  while (!collides(board, currentPiece, 0, 1)) {
    currentPiece.y++;
    score += 2;
  }
  scoreEl.textContent = score;
  drop();
}

function hold() {
  if (!canHold) return;
  canHold = false;
  if (!holdPiece) {
    holdPiece = { type: currentPiece.type, matrix: SHAPES[currentPiece.type] };
    spawnPiece();
  } else {
    const temp = holdPiece;
    holdPiece = { type: currentPiece.type, matrix: SHAPES[currentPiece.type] };
    currentPiece = {
      type: temp.type,
      matrix: temp.matrix,
      x: Math.floor(COLS / 2) - Math.ceil(temp.matrix[0].length / 2),
      y: 0
    };
  }
  drawPreview(holdCtx, holdPiece, holdCanvas.width, holdCanvas.height);
}

function drawGhost() {
  let ghostY = currentPiece.y;
  while (!collides(board, { ...currentPiece, y: ghostY }, 0, 1)) {
    ghostY++;
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  currentPiece.matrix.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) {
        ctx.fillRect((currentPiece.x + c) * BLOCK_SIZE + 1, (ghostY + r) * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines
  ctx.strokeStyle = '#1a2236';
  ctx.lineWidth = 0.5;
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
  }

  // Board
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) {
        ctx.fillStyle = COLORS[board[r][c]];
        ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
      }
    }
  }

  // Ghost & Current Piece
  if (currentPiece) {
    drawGhost();
    ctx.fillStyle = COLORS[currentPiece.type];
    currentPiece.matrix.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          ctx.fillRect((currentPiece.x + c) * BLOCK_SIZE + 1, (currentPiece.y + r) * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        }
      });
    });
  }
}

function update(time = 0) {
  if (!isPlaying) return;
  const deltaTime = time - lastDrop;
  if (deltaTime > dropInterval) {
    drop();
    lastDrop = time;
  }
  draw();
  animationFrameId = requestAnimationFrame(update);
}

function startGame() {
  createBoard();
  score = 0;
  lines = 0;
  level = 1;
  holdPiece = null;
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
  drawPreview(holdCtx, null, holdCanvas.width, holdCanvas.height);
  nextPiece = getRandomPiece();
  spawnPiece();
  overlay.classList.add('hidden');
  isPlaying = true;
  lastDrop = performance.now();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(update);
}

function gameOver() {
  isPlaying = false;
  overlay.querySelector('h2').textContent = 'GAME OVER';
  overlay.querySelector('p').textContent = `Final Score: ${score}`;
  startBtn.textContent = 'Try Again';
  overlay.classList.remove('hidden');
}

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }

  if (!isPlaying) {
    if (e.key === ' ' || e.key === 'Enter') startGame();
    return;
  }

  if (e.key === 'ArrowLeft') {
    if (!collides(board, currentPiece, -1, 0)) currentPiece.x--;
  } else if (e.key === 'ArrowRight') {
    if (!collides(board, currentPiece, 1, 0)) currentPiece.x++;
  } else if (e.key === 'ArrowDown') {
    drop();
    score += 1;
    scoreEl.textContent = score;
  } else if (e.key === 'ArrowUp') {
    const rotated = rotate(currentPiece.matrix);
    if (!collides(board, { ...currentPiece, matrix: rotated })) {
      currentPiece.matrix = rotated;
    }
  } else if (e.key === ' ') {
    hardDrop();
  } else if (e.key === 'c' || e.key === 'C') {
    hold();
  }
  draw();
});

startBtn.addEventListener('click', startGame);
draw();
