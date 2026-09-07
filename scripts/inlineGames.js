import fs from 'fs';
import path from 'path';

const gamesDir = path.resolve('public/games');
const outputDir = path.resolve('src/data');
const outputFile = path.join(outputDir, 'bundledGamesHtml.js');

const gameIds = ['snake', 'tetris', 'pong', 'breakout', '2048', 'flappy', 'runner', 'space-invaders'];

const bundle = {};

for (const id of gameIds) {
  const dir = path.join(gamesDir, id);
  if (!fs.existsSync(dir)) continue;

  const htmlPath = path.join(dir, 'index.html');
  const cssPath = path.join(dir, 'style.css');
  const jsPath = path.join(dir, 'game.js');

  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
  const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
  const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : '';

  // Replace external css & js link tags with inline tags
  let inlined = html;
  if (css) {
    inlined = inlined.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/i, `<style>\n${css}\n</style>`);
  }
  if (js) {
    inlined = inlined.replace(/<script[^>]*src=["']game\.js["'][^>]*><\/script>/i, `<script>\n${js}\n</script>`);
  }

  bundle[id] = inlined;
}

const content = `// Auto-generated bundled standalone HTML for offline/Google Sites in-memory play
export const BUNDLED_GAMES_HTML = ${JSON.stringify(bundle, null, 2)};
`;

fs.writeFileSync(outputFile, content, 'utf8');
console.log(`Successfully generated bundledGamesHtml.js with ${Object.keys(bundle).length} games!`);
