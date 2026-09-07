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
  fs.copyFileSync(singleFileSrc, publicDest);
  console.log('3. Successfully copied singlefile bundle to public/embed.html!');
} else {
  console.error('Error: dist-singlefile/index.html was not generated.');
  process.exit(1);
}
