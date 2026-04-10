import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const GAMES_DIR = join(ROOT, 'games');
const OUTPUT = join(__dirname, 'game-catalog.json');

async function extractTitle(htmlPath) {
  const html = await readFile(htmlPath, 'utf-8');
  const match = html.match(/<title>([^<]+)<\/title>/i);
  if (!match) return null;
  // Strip " | Brainrot Games" suffix if present
  return match[1].replace(/\s*\|\s*Brainrot Games$/i, '').trim();
}

async function main() {
  const entries = await readdir(GAMES_DIR, { withFileTypes: true });

  const gameDirs = entries
    .filter((e) => e.isDirectory() && /^game-\d+$/.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => {
      const numA = parseInt(a.replace('game-', ''), 10);
      const numB = parseInt(b.replace('game-', ''), 10);
      return numA - numB;
    });

  const catalog = [];

  for (const dir of gameDirs) {
    const indexPath = join(GAMES_DIR, dir, 'index.html');
    try {
      const title = await extractTitle(indexPath);
      if (title) {
        catalog.push({
          id: dir,
          title,
          path: `games/${dir}/`,
        });
      } else {
        console.warn(`  WARN: No <title> found in ${dir}/index.html — skipped`);
      }
    } catch {
      console.warn(`  WARN: Could not read ${dir}/index.html — skipped`);
    }
  }

  await writeFile(OUTPUT, JSON.stringify(catalog, null, 2) + '\n', 'utf-8');
  console.log(`Generated game-catalog.json with ${catalog.length} games`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
