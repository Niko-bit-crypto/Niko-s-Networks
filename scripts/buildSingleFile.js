import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('1. Inlining game HTML/CSS/JS...');
execSync('node scripts/inlineGames.js', { stdio: 'inherit' });

console.log('2. Building singlefile bundle with vite-plugin-singlefile...');
execSync('npx vite build -c vite.singlefile.config.js', { stdio: 'inherit' });

const singleFileSrc = path.resolve('dist-singlefile/index.html');
const publicDest = path.resolve('public/embed.html');

if (fs.existsSync(singleFileSrc)) {
  let html = fs.readFileSync(singleFileSrc, 'utf8');

  // Remove type="module" and crossorigin attributes because Google Sites uses an opaque null-origin
  // iframe sandbox without allow-same-origin, which causes Chromium to block type="module" scripts
  html = html.replace(/<script\s+type=["']module["']\s+crossorigin>/gi, '<script>');
  html = html.replace(/<script\s+type=["']module["']>/gi, '<script>');
  html = html.replace(/<script\s+crossorigin\s+type=["']module["']>/gi, '<script>');

  fs.writeFileSync(publicDest, html, 'utf8');
  console.log('3. Successfully converted and copied singlefile bundle to public/embed.html (classic script mode)!');

  console.log('4. Building ultra-lightweight Google Sites standalone embed...');
  execSync('node scripts/buildGoogleSitesStandalone.js', { stdio: 'inherit' });
} else {
  console.error('Error: dist-singlefile/index.html was not generated.');
  process.exit(1);
}
