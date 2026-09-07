import fs from 'fs';
import path from 'path';

// Read bundled games HTML
const gamesPath = path.resolve('src/data/bundledGamesHtml.js');
let gamesContent = fs.readFileSync(gamesPath, 'utf8');

// Extract the BUNDLED_GAMES_HTML object
const startIdx = gamesContent.indexOf('{');
const endIdx = gamesContent.lastIndexOf('}');
if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find games object in bundledGamesHtml.js');
  process.exit(1);
}

const gamesJsonStr = gamesContent.slice(startIdx, endIdx + 1);
let gamesObj;
try {
  // Use Function to evaluate JS object cleanly
  gamesObj = new Function(`return ${gamesJsonStr}`)();
} catch (e) {
  console.error('Failed to parse games object:', e);
  process.exit(1);
}

// Read games list metadata
const gamesListMeta = [
  { id: 'snake', title: 'Snake Classic', category: 'Classic', desc: 'Slither, eat food, and grow without crashing.', color: '#39ff14', icon: '🐍' },
  { id: 'tetris', title: 'Tetris Classic', category: 'Arcade', desc: 'Rotate and stack falling tetrominoes.', color: '#00f0ff', icon: '🧱' },
  { id: 'pong', title: 'Retro Pong', category: 'Retro', desc: '1P vs AI or 2P local table tennis.', color: '#00f0ff', icon: '🏓' },
  { id: 'breakout', title: 'Brick Breaker', category: 'Arcade', desc: 'Smash through multi-layered brick walls.', color: '#ffe600', icon: '💥' },
  { id: '2048', title: '2048 Puzzle', category: 'Puzzle', desc: 'Slide and combine tiles to reach 2048.', color: '#ff007f', icon: '🔢' },
  { id: 'flappy', title: 'Flappy Bird', category: 'Arcade', desc: 'Flap through pipes with tight timing.', color: '#ffe600', icon: '🐦' },
  { id: 'runner', title: 'Dino Runner', category: 'Retro', desc: 'Duck and leap past desert obstacles.', color: '#39ff14', icon: '🦖' },
  { id: 'space-invaders', title: 'Space Defenders', category: 'Arcade', desc: 'Blast waves of descending alien invaders.', color: '#ff007f', icon: '👾' },
  { id: 'pacman', title: 'Pac-Man Classic', category: 'Arcade', desc: 'Chomp energy dots and dodge retro ghosts.', color: '#ffe600', icon: '🟡' },
];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Niko's Nightclub - 80's Retro Arcade</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      background-color: #07040d;
      background-image: linear-gradient(90deg, #ff007f10 1px, transparent 1px), linear-gradient(#00f0ff10 1px, transparent 1px);
      background-size: 24px 24px;
      color: #f1f5f9;
      font-family: 'Courier New', Courier, monospace, system-ui, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }
    .crt-overlay {
      position: fixed; inset: 0; pointer-events: none; z-index: 40;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%) 0 0 / 100% 4px;
    }
    header {
      background: #130826;
      border-bottom: 4px solid #000;
      padding: 12px 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px #ff007f;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-box {
      width: 36px; height: 36px; background: #ff007f; border: 2px solid #000;
      box-shadow: 3px 3px #000; display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .logo-title {
      font-size: 16px; font-weight: 900; color: #ffe600; text-shadow: 0 0 8px #ffe600;
      letter-spacing: 2px;
    }
    .logo-sub {
      font-size: 10px; color: #00f0ff; letter-spacing: 1px;
    }
    .search-input {
      background: #000; border: 2px solid #334155; color: #fff; padding: 6px 12px;
      font-size: 12px; font-family: inherit; outline: none; width: 160px;
    }
    .search-input:focus { border-color: #00f0ff; box-shadow: 0 0 8px #00f0ff; }
    .filters {
      display: flex; gap: 6px; padding: 12px 16px; overflow-x: auto;
    }
    .filter-btn {
      background: #170c2d; border: 2px solid #000; box-shadow: 2px 2px #000;
      color: #94a3b8; padding: 4px 10px; font-size: 11px; font-family: inherit;
      cursor: pointer; font-weight: bold; transition: all 0.1s;
    }
    .filter-btn.active, .filter-btn:hover {
      background: #00f0ff; color: #000; border-color: #000;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .card {
      background: #130b24; border: 3px solid #000; box-shadow: 4px 4px #000;
      cursor: pointer; transition: transform 0.1s, box-shadow 0.1s;
      display: flex; flex-direction: column; overflow: hidden;
    }
    .card:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px #ff007f;
    }
    .card:active {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px #000;
    }
    .card-banner {
      height: 90px; display: flex; align-items: center; justify-content: center;
      font-size: 44px; position: relative; border-bottom: 2px solid #000;
    }
    .card-cat {
      position: absolute; top: 6px; right: 6px; font-size: 9px; font-weight: bold;
      background: #000; padding: 2px 6px; border: 1px solid #334155;
    }
    .card-body {
      padding: 12px; display: flex; flex-direction: column; gap: 6px; flex: 1;
    }
    .card-title {
      font-size: 14px; font-weight: bold; color: #fff;
    }
    .card-desc {
      font-size: 11px; color: #94a3b8; line-height: 1.4; flex: 1;
    }
    .play-btn {
      margin-top: 8px; background: #ffe600; color: #000; font-weight: 900;
      border: 2px solid #000; padding: 6px; text-align: center; font-size: 11px;
      box-shadow: 2px 2px #000;
    }
    #gameScreen {
      position: fixed; inset: 0; background: #07040d; z-index: 50;
      display: none; flex-direction: column;
    }
    .game-topbar {
      background: #130826; border-bottom: 3px solid #000; padding: 8px 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      box-shadow: 0 3px #ff007f;
    }
    .btn {
      background: #ff007f; color: #fff; border: 2px solid #000; font-family: inherit;
      padding: 6px 12px; font-size: 11px; font-weight: bold; cursor: pointer;
      box-shadow: 2px 2px #000;
    }
    .btn:hover { background: #ff3399; }
    .btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px #000; }
    .btn-green { background: #39ff14; color: #000; }
    .btn-green:hover { background: #5cff3d; }
    .btn-cyan { background: #00f0ff; color: #000; }
    .btn-cyan:hover { background: #40f3ff; }
    .iframe-wrapper {
      flex: 1; position: relative; width: 100%; height: 100%; min-height: 250px;
    }
    iframe {
      width: 100%; height: 100%; border: none; display: block;
    }
    .touch-gamepad {
      background: #140b28; border-top: 3px solid #000; padding: 8px 12px;
      display: flex; align-items: center; justify-content: space-around;
      user-select: none; touch-action: none; flex-shrink: 0; box-shadow: 0 -2px #ff007f;
    }
    .dpad-container { display: flex; align-items: center; justify-content: center; }
    .dpad-cross {
      position: relative; width: 110px; height: 110px; background: #0a0517;
      border: 2px solid #000; border-radius: 50%;
    }
    .dpad-btn {
      position: absolute; background: #251545; color: #00f0ff; border: 2px solid #000;
      font-size: 14px; font-weight: bold; cursor: pointer; display: flex;
      align-items: center; justify-content: center; touch-action: none;
    }
    .dpad-btn:active { background: #00f0ff; color: #000; }
    .dpad-up { top: 2px; left: 35px; width: 40px; height: 38px; }
    .dpad-down { bottom: 2px; left: 35px; width: 40px; height: 38px; }
    .dpad-left { left: 2px; top: 35px; width: 38px; height: 40px; }
    .dpad-right { right: 2px; top: 35px; width: 38px; height: 40px; }
    .dpad-center {
      position: absolute; top: 38px; left: 38px; width: 34px; height: 34px;
      background: #130728; border-radius: 50%; border: 2px solid #000;
    }
    .sys-container { display: flex; flex-direction: column; gap: 6px; }
    .sys-btn { font-size: 10px; padding: 6px 10px; }
    .btn-yellow { background: #ffe600; color: #000; }
    .btn-yellow:hover { background: #ffea33; }
    .action-container { display: flex; align-items: center; gap: 12px; }
    .action-btn {
      width: 54px; height: 54px; border-radius: 50%; border: 3px solid #000;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      cursor: pointer; touch-action: none; box-shadow: 2px 2px #000;
    }
    .action-btn:active { transform: scale(0.95); }
    .action-a { background: #ff007f; color: #fff; box-shadow: 0 0 10px rgba(255,0,127,0.5); }
    .action-b { background: #00f0ff; color: #000; box-shadow: 0 0 10px rgba(0,240,255,0.4); }
    .btn-letter { font-size: 16px; font-weight: bold; line-height: 1; }
    .btn-label { font-size: 7px; font-weight: bold; text-transform: uppercase; line-height: 1; }
    footer {
      text-align: center; padding: 24px; font-size: 11px; color: #64748b;
    }
  </style>
</head>
<body>
  <div class="crt-overlay"></div>

  <!-- ARCADE VIEW -->
  <div id="arcadeScreen">
    <header>
      <div class="logo">
        <div class="logo-box">🕹️</div>
        <div>
          <div class="logo-title">NIKO'S NIGHTCLUB</div>
          <div class="logo-sub">UNBLOCKED 80'S RETRO ARCADE</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <input type="text" id="searchInput" class="search-input" placeholder="Search games...">
        <button class="btn btn-cyan" id="arcadeFullscreenBtn" style="padding:6px 10px;display:flex;align-items:center;gap:4px;">&#x2197; FULL TAB</button>
      </div>
    </header>

    <div class="filters">
      <button class="filter-btn active" data-cat="ALL">ALL</button>
      <button class="filter-btn" data-cat="Arcade">ARCADE</button>
      <button class="filter-btn" data-cat="Classic">CLASSIC</button>
      <button class="filter-btn" data-cat="Retro">RETRO</button>
      <button class="filter-btn" data-cat="Puzzle">PUZZLE</button>
    </div>

    <div class="grid" id="gamesGrid"></div>

    <footer>
      Niko's Nightclub &bull; Google Sites Edition &bull; 100% In-Memory Offline Play
    </footer>
  </div>

  <!-- GAME ACTIVE VIEW -->
  <div id="gameScreen">
    <div class="game-topbar">
      <button class="btn" id="backBtn">&larr; BACK TO ARCADE</button>
      <span id="activeGameTitle" style="font-size: 13px; font-weight: bold; color: #ffe600;">PLAYING</span>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-yellow" id="toggleGamepadBtn">&#128241; PAD: ON</button>
        <button class="btn btn-green" id="restartBtn">&#8635; RESTART</button>
        <button class="btn btn-cyan" id="fullscreenBtn">&#x2197; FULL TAB</button>
      </div>
    </div>
    <div class="iframe-wrapper" id="frameWrapper">
      <iframe id="gameIframe" allow="autoplay; fullscreen; keyboard"></iframe>
    </div>
    <!-- RETRO TOUCH GAMEPAD -->
    <div id="touchGamepad" class="touch-gamepad">
      <div class="dpad-container">
        <div class="dpad-cross">
          <button class="dpad-btn dpad-up" data-key="ArrowUp" data-code="ArrowUp">&#9650;</button>
          <button class="dpad-btn dpad-left" data-key="ArrowLeft" data-code="ArrowLeft">&#9664;</button>
          <button class="dpad-btn dpad-right" data-key="ArrowRight" data-code="ArrowRight">&#9654;</button>
          <button class="dpad-btn dpad-down" data-key="ArrowDown" data-code="ArrowDown">&#9660;</button>
          <div class="dpad-center"></div>
        </div>
      </div>
      <div class="sys-container">
        <button class="btn btn-yellow sys-btn" id="gpStartBtn">&#9658; START</button>
        <button class="btn sys-btn" id="gpResetBtn">&#8635; RESET</button>
      </div>
      <div class="action-container">
        <button class="action-btn action-b" id="gpBtnB" data-key="ArrowDown" data-code="ArrowDown">
          <span class="btn-letter">B</span>
          <span class="btn-label" id="gpLabelB">DUCK</span>
        </button>
        <button class="action-btn action-a" id="gpBtnA" data-key=" " data-code="Space">
          <span class="btn-letter">A</span>
          <span class="btn-label" id="gpLabelA">JUMP</span>
        </button>
      </div>
    </div>
  </div>

  <script>
    const GAMES_DATA = ${JSON.stringify(gamesListMeta)};
    const GAMES_HTML = ${JSON.stringify(gamesObj).replace(/</g, '\\u003c')};

    let currentCat = 'ALL';
    let searchQuery = '';
    let activeGameId = null;

    const grid = document.getElementById('gamesGrid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const arcadeScreen = document.getElementById('arcadeScreen');
    const gameScreen = document.getElementById('gameScreen');
    const gameIframe = document.getElementById('gameIframe');
    const activeGameTitle = document.getElementById('activeGameTitle');
    const backBtn = document.getElementById('backBtn');
    const restartBtn = document.getElementById('restartBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const arcadeFullscreenBtn = document.getElementById('arcadeFullscreenBtn');

    function renderGames() {
      grid.innerHTML = '';
      const filtered = GAMES_DATA.filter(g => {
        const matchesCat = currentCat === 'ALL' || g.category.toUpperCase() === currentCat.toUpperCase();
        const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">NO GAMES FOUND</div>';
        return;
      }

      filtered.forEach(g => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openGame(g.id, g.title);

        const bannerBg = g.id === 'snake' ? '#0d2818' : g.id === 'tetris' ? '#1e1b4b' : g.id === 'pong' ? '#082f49' : g.id === 'breakout' ? '#451a03' : g.id === '2048' ? '#4a044e' : g.id === 'flappy' ? '#365314' : g.id === 'runner' ? '#14532d' : g.id === 'pacman' ? '#422006' : '#3b0764';

        card.innerHTML = \`
          <div class="card-banner" style="background:\${bannerBg}">
            <span>\${g.icon}</span>
            <span class="card-cat" style="color:\${g.color}">\${g.category.toUpperCase()}</span>
          </div>
          <div class="card-body">
            <div class="card-title">\${g.title}</div>
            <div class="card-desc">\${g.desc}</div>
            <div class="play-btn">PLAY NOW &rarr;</div>
          </div>
        \`;
        grid.appendChild(card);
      });
    }

    function updateGamepadLabels(id) {
      const btnA = document.getElementById('gpBtnA');
      const btnB = document.getElementById('gpBtnB');
      const labelA = document.getElementById('gpLabelA');
      const labelB = document.getElementById('gpLabelB');
      if (!btnA || !btnB) return;

      if (id === 'tetris') {
        btnA.dataset.key = 'ArrowUp'; btnA.dataset.code = 'ArrowUp'; labelA.textContent = 'ROTATE';
        btnB.dataset.key = ' '; btnB.dataset.code = 'Space'; labelB.textContent = 'DROP';
      } else if (id === 'flappy') {
        btnA.dataset.key = ' '; btnA.dataset.code = 'Space'; labelA.textContent = 'FLAP';
        btnB.dataset.key = 'Enter'; btnB.dataset.code = 'Enter'; labelB.textContent = 'START';
      } else if (id === 'runner') {
        btnA.dataset.key = ' '; btnA.dataset.code = 'Space'; labelA.textContent = 'JUMP';
        btnB.dataset.key = 'ArrowDown'; btnB.dataset.code = 'ArrowDown'; labelB.textContent = 'DUCK';
      } else if (id === 'space-invaders') {
        btnA.dataset.key = ' '; btnA.dataset.code = 'Space'; labelA.textContent = 'FIRE';
        btnB.dataset.key = 'Enter'; btnB.dataset.code = 'Enter'; labelB.textContent = 'START';
      } else if (id === 'breakout' || id === 'pong') {
        btnA.dataset.key = ' '; btnA.dataset.code = 'Space'; labelA.textContent = 'LAUNCH';
        btnB.dataset.key = 'Enter'; btnB.dataset.code = 'Enter'; labelB.textContent = 'START';
      } else {
        btnA.dataset.key = ' '; btnA.dataset.code = 'Space'; labelA.textContent = 'ACTION';
        btnB.dataset.key = 'Enter'; btnB.dataset.code = 'Enter'; labelB.textContent = 'START';
      }
    }

    function sendKeyToGame(type, key, code) {
      try {
        const win = gameIframe.contentWindow;
        if (win) {
          const evt = new win.KeyboardEvent(type, { key: key, code: code || key, bubbles: true, cancelable: true });
          win.dispatchEvent(evt);
          if (win.document) win.document.dispatchEvent(evt);
        }
      } catch (err) {}
      try {
        gameIframe.contentWindow.postMessage({ type: 'arcade-key', action: type, key: key, code: code || key }, '*');
      } catch (err) {}
    }

    // Key repeat handler for D-Pad
    let keyIntervals = {};
    function startKey(key, code) {
      try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) {}
      sendKeyToGame('keydown', key, code);
      if (!keyIntervals[key]) {
        keyIntervals[key] = setInterval(() => sendKeyToGame('keydown', key, code), 75);
      }
    }
    function stopKey(key, code) {
      if (keyIntervals[key]) {
        clearInterval(keyIntervals[key]);
        delete keyIntervals[key];
      }
      sendKeyToGame('keyup', key, code);
    }

    function openGame(id, title) {
      activeGameId = id;
      activeGameTitle.textContent = title.toUpperCase();
      updateGamepadLabels(id);
      const htmlContent = GAMES_HTML[id];
      if (htmlContent) {
        gameIframe.srcdoc = htmlContent;
        arcadeScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
      }
    }

    function closeGame() {
      gameIframe.srcdoc = 'about:blank';
      gameScreen.style.display = 'none';
      arcadeScreen.style.display = 'block';
      activeGameId = null;
    }

    function restartGame() {
      if (activeGameId && GAMES_HTML[activeGameId]) {
        gameIframe.srcdoc = GAMES_HTML[activeGameId];
      }
    }

    function openFullTab() {
      try {
        const w = window.open('', '_blank');
        if (w) {
          w.document.open();
          w.document.write('<!DOCTYPE html>' + document.documentElement.outerHTML);
          w.document.close();
          return;
        }
      } catch (err) {}
      alert("Tip: In Google Sites, drag the blue corner handles on this embed box to make it fill your screen!");
    }

    function toggleFullscreen(targetEl) {
      const el = targetEl || document.documentElement;
      const canFullscreen = document.fullscreenEnabled || document.webkitFullscreenEnabled;
      
      if (canFullscreen) {
        try {
          if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            let p = el.requestFullscreen ? el.requestFullscreen() : (el.webkitRequestFullscreen ? el.webkitRequestFullscreen() : null);
            if (p && p.catch) {
              p.catch(() => openFullTab());
              return;
            }
          } else {
            if (document.exitFullscreen) document.exitFullscreen();
            return;
          }
        } catch (e) {
          openFullTab();
          return;
        }
      }
      openFullTab();
    }

    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      renderGames();
    });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCat = btn.getAttribute('data-cat');
        renderGames();
      });
    });

    backBtn.addEventListener('click', closeGame);
    restartBtn.addEventListener('click', restartGame);
    fullscreenBtn.addEventListener('click', () => toggleFullscreen(document.getElementById('frameWrapper')));
    if (arcadeFullscreenBtn) {
      arcadeFullscreenBtn.addEventListener('click', () => toggleFullscreen(document.documentElement));
    }

    // Touch Gamepad Event Listeners
    const touchGamepad = document.getElementById('touchGamepad');
    const toggleGamepadBtn = document.getElementById('toggleGamepadBtn');
    let isGamepadVisible = true;

    if (toggleGamepadBtn && touchGamepad) {
      toggleGamepadBtn.addEventListener('click', () => {
        isGamepadVisible = !isGamepadVisible;
        touchGamepad.style.display = isGamepadVisible ? 'flex' : 'none';
        toggleGamepadBtn.textContent = isGamepadVisible ? '📱 PAD: ON' : '📱 PAD: OFF';
      });
    }

    // D-Pad buttons
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const key = btn.dataset.key;
      const code = btn.dataset.code;
      btn.addEventListener('pointerdown', e => { e.preventDefault(); startKey(key, code); });
      btn.addEventListener('pointerup', e => { e.preventDefault(); stopKey(key, code); });
      btn.addEventListener('pointerleave', e => { e.preventDefault(); stopKey(key, code); });
      btn.addEventListener('pointercancel', e => { e.preventDefault(); stopKey(key, code); });
    });

    // Action buttons (A & B)
    const btnA = document.getElementById('gpBtnA');
    const btnB = document.getElementById('gpBtnB');
    if (btnA) {
      btnA.addEventListener('pointerdown', e => { e.preventDefault(); startKey(btnA.dataset.key, btnA.dataset.code); });
      btnA.addEventListener('pointerup', e => { e.preventDefault(); stopKey(btnA.dataset.key, btnA.dataset.code); });
      btnA.addEventListener('pointerleave', e => { e.preventDefault(); stopKey(btnA.dataset.key, btnA.dataset.code); });
      btnA.addEventListener('pointercancel', e => { e.preventDefault(); stopKey(btnA.dataset.key, btnA.dataset.code); });
    }
    if (btnB) {
      btnB.addEventListener('pointerdown', e => { e.preventDefault(); startKey(btnB.dataset.key, btnB.dataset.code); });
      btnB.addEventListener('pointerup', e => { e.preventDefault(); stopKey(btnB.dataset.key, btnB.dataset.code); });
      btnB.addEventListener('pointerleave', e => { e.preventDefault(); stopKey(btnB.dataset.key, btnB.dataset.code); });
      btnB.addEventListener('pointercancel', e => { e.preventDefault(); stopKey(btnB.dataset.key, btnB.dataset.code); });
    }

    // System buttons
    const gpStartBtn = document.getElementById('gpStartBtn');
    const gpResetBtn = document.getElementById('gpResetBtn');
    if (gpStartBtn) {
      gpStartBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        try { if (navigator.vibrate) navigator.vibrate(15); } catch (err) {}
        sendKeyToGame('keydown', 'Enter', 'Enter');
        sendKeyToGame('keydown', ' ', 'Space');
      });
      gpStartBtn.addEventListener('pointerup', e => {
        e.preventDefault();
        sendKeyToGame('keyup', 'Enter', 'Enter');
        sendKeyToGame('keyup', ' ', 'Space');
      });
    }
    if (gpResetBtn) {
      gpResetBtn.addEventListener('click', () => {
        try { if (navigator.vibrate) navigator.vibrate(15); } catch (err) {}
        restartGame();
      });
    }

    // Safe Escape key handler: closes active game back to arcade catalog
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && activeGameId) {
        closeGame();
      }
    });

    renderGames();
  </script>
</body>
</html>
`;

const destPath = path.resolve('public/google-sites-embed.html');
fs.writeFileSync(destPath, html, 'utf8');

const distDest = path.resolve('dist/google-sites-embed.html');
if (fs.existsSync(path.resolve('dist'))) {
  fs.writeFileSync(distDest, html, 'utf8');
}

const stats = fs.statSync(destPath);
console.log(`Successfully built public/google-sites-embed.html! Size: ${(stats.size / 1024).toFixed(1)} KB`);
