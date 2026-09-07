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
];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Niko's Network - 80's Retro Arcade</title>
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
      flex: 1; position: relative; width: 100%; height: 100%;
    }
    iframe {
      width: 100%; height: 100%; border: none; display: block;
    }
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
          <div class="logo-title">NIKO'S NETWORK</div>
          <div class="logo-sub">UNBLOCKED 80'S RETRO ARCADE</div>
        </div>
      </div>
      <input type="text" id="searchInput" class="search-input" placeholder="Search games...">
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
      Niko's Network &bull; Google Sites Edition &bull; 100% In-Memory Offline Play
    </footer>
  </div>

  <!-- GAME ACTIVE VIEW -->
  <div id="gameScreen">
    <div class="game-topbar">
      <button class="btn" id="backBtn">&larr; BACK TO ARCADE</button>
      <span id="activeGameTitle" style="font-size: 13px; font-weight: bold; color: #ffe600;">PLAYING</span>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-green" id="restartBtn">&#8635; RESTART</button>
        <button class="btn btn-cyan" id="fullscreenBtn">&#x26F6; FULLSCREEN</button>
      </div>
    </div>
    <div class="iframe-wrapper" id="frameWrapper">
      <iframe id="gameIframe" allow="autoplay; fullscreen; keyboard"></iframe>
    </div>
  </div>

  <script>
    const GAMES_DATA = ${JSON.stringify(gamesListMeta)};
    const GAMES_HTML = ${JSON.stringify(gamesObj)};

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

        const bannerBg = g.id === 'snake' ? '#0d2818' : g.id === 'tetris' ? '#1e1b4b' : g.id === 'pong' ? '#082f49' : g.id === 'breakout' ? '#451a03' : g.id === '2048' ? '#4a044e' : g.id === 'flappy' ? '#365314' : g.id === 'runner' ? '#14532d' : '#3b0764';

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

    function openGame(id, title) {
      activeGameId = id;
      activeGameTitle.textContent = title.toUpperCase();
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

    function toggleFullscreen() {
      const el = document.getElementById('frameWrapper');
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
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
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    renderGames();
  </script>
</body>
</html>
`;

const destPath = path.resolve('public/google-sites-embed.html');
fs.writeFileSync(destPath, html, 'utf8');

const stats = fs.statSync(destPath);
console.log(`Successfully built public/google-sites-embed.html! Size: ${(stats.size / 1024).toFixed(1)} KB`);
