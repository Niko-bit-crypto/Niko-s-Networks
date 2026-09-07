const tileContainer = document.getElementById('tileContainer');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const restartBtn = document.getElementById('restartBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const gameOverlay = document.getElementById('gameOverlay');
const overlayMsg = document.getElementById('overlayMsg');

let board = [];
let score = 0;
let best = parseInt(localStorage.getItem('unblocked_2048_best') || '0', 10);
bestEl.textContent = best;

const SIZE = 4;
const CELL_SIZE = 72.5;
const GAP = 10;

function init() {
  board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  score = 0;
  scoreEl.textContent = score;
  gameOverlay.classList.add('hidden');
  addRandomTile();
  addRandomTile();
  render();
}

function addRandomTile() {
  const emptyCells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return;
  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  tileContainer.innerHTML = '';
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = board[r][c];
      if (val !== 0) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${val}`;
        tile.textContent = val;
        tile.style.top = `${r * (CELL_SIZE + GAP)}px`;
        tile.style.left = `${c * (CELL_SIZE + GAP)}px`;
        tileContainer.appendChild(tile);
      }
    }
  }

  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem('unblocked_2048_best', best);
  }
}

function slideRow(row) {
  let arr = row.filter(val => val !== 0);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      scoreEl.textContent = score;
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter(val => val !== 0);
  while (arr.length < SIZE) arr.push(0);
  return arr;
}

function moveLeft() {
  let moved = false;
  for (let r = 0; r < SIZE; r++) {
    const oldRow = [...board[r]];
    const newRow = slideRow(board[r]);
    board[r] = newRow;
    if (oldRow.some((val, i) => val !== newRow[i])) moved = true;
  }
  return moved;
}

function rotateBoard() {
  const newBoard = [];
  for (let c = 0; c < SIZE; c++) {
    newBoard[c] = [];
    for (let r = SIZE - 1; r >= 0; r--) {
      newBoard[c].push(board[r][c]);
    }
  }
  board = newBoard;
}

function moveRight() {
  rotateBoard();
  rotateBoard();
  const moved = moveLeft();
  rotateBoard();
  rotateBoard();
  return moved;
}

function moveUp() {
  rotateBoard();
  rotateBoard();
  rotateBoard();
  const moved = moveLeft();
  rotateBoard();
  return moved;
}

function moveDown() {
  rotateBoard();
  const moved = moveLeft();
  rotateBoard();
  rotateBoard();
  rotateBoard();
  return moved;
}

function checkGameOver() {
  // Check empty
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return false;
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return false;
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
}

function handleInput(direction) {
  let moved = false;
  if (direction === 'left') moved = moveLeft();
  if (direction === 'right') moved = moveRight();
  if (direction === 'up') moved = moveUp();
  if (direction === 'down') moved = moveDown();

  if (moved) {
    addRandomTile();
    render();
    if (checkGameOver()) {
      overlayMsg.textContent = 'Game Over!';
      gameOverlay.classList.remove('hidden');
    }
  }
}

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleInput('left');
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleInput('right');
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') handleInput('up');
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') handleInput('down');
});

// Mobile Touch Swipe detection for 2048
let touchStartX2048 = 0;
let touchStartY2048 = 0;

document.addEventListener('touchstart', e => {
  if (e.touches.length > 0) {
    touchStartX2048 = e.touches[0].clientX;
    touchStartY2048 = e.touches[0].clientY;
  }
}, { passive: true });

document.addEventListener('touchend', e => {
  if (e.changedTouches.length > 0) {
    const dx = e.changedTouches[0].clientX - touchStartX2048;
    const dy = e.changedTouches[0].clientY - touchStartY2048;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 25) {
      if (absDx > absDy) {
        if (dx > 0) handleInput('right');
        else handleInput('left');
      } else {
        if (dy > 0) handleInput('down');
        else handleInput('up');
      }
    }
  }
}, { passive: true });

// Mobile Gamepad PostMessage Listener
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'arcade-key') {
    const key = e.data.key;
    if (e.data.action === 'keydown') {
      if (key === 'ArrowLeft' || key === 'a' || key === 'A') handleInput('left');
      if (key === 'ArrowRight' || key === 'd' || key === 'D') handleInput('right');
      if (key === 'ArrowUp' || key === 'w' || key === 'W') handleInput('up');
      if (key === 'ArrowDown' || key === 's' || key === 'S') handleInput('down');
      if (key === ' ' || key === 'Enter' || key === 'Start' || key === 'r' || key === 'R') init();
    }
  }
});

restartBtn.addEventListener('click', init);
tryAgainBtn.addEventListener('click', init);

init();
