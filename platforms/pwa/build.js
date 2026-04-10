import { readFile, writeFile, cp, mkdir, rm, readdir, stat } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readBrandConfig,
  resolveGames,
  template,
  copyGameDirs,
  injectIntoHtml,
} from '../shared/build-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const SHARED_DIR = join(__dirname, '..', 'shared');

const brandId = process.argv[2];
if (!brandId) {
  console.error('Usage: node platforms/pwa/build.js <brandId>');
  process.exit(1);
}

async function collectFiles(dir, base) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(fullPath, base)));
    } else {
      results.push('/' + relative(base, fullPath));
    }
  }
  return results;
}

async function getDirSize(dir) {
  let total = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += await getDirSize(fullPath);
    } else {
      const s = await stat(fullPath);
      total += s.size;
    }
  }
  return total;
}

async function main() {
  const startTime = Date.now();

  // 1. Read brand config
  console.log(`\nBuilding PWA for brand: ${brandId}`);
  const config = await readBrandConfig(brandId);
  console.log(`  Brand: ${config.appName}`);

  // 2. Resolve game list
  const catalogPath = join(SHARED_DIR, 'game-catalog.json');
  const games = await resolveGames(config, catalogPath);
  console.log(`  Games resolved: ${games.length}`);

  // 3. Create output directory (clean first)
  const outputDir = join(__dirname, '..', 'output', `${brandId}-pwa`);
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  // 4. Copy files
  // Copy games/shared/
  const sharedSrc = join(ROOT, 'games', 'shared');
  const sharedDest = join(outputDir, 'games', 'shared');
  await mkdir(sharedDest, { recursive: true });
  await cp(sharedSrc, sharedDest, { recursive: true });
  console.log('  Copied games/shared/');

  // Copy selected game directories
  await copyGameDirs(games, ROOT, outputDir);
  console.log(`  Copied ${games.length} game directories`);

  // Copy brand/
  const brandSrc = join(ROOT, 'brand');
  const brandDest = join(outputDir, 'brand');
  try {
    await mkdir(brandDest, { recursive: true });
    await cp(brandSrc, brandDest, { recursive: true });
    console.log('  Copied brand/');
  } catch {
    console.warn('  WARN: brand/ directory not found, skipping');
  }

  // Copy root index.html
  await cp(join(ROOT, 'index.html'), join(outputDir, 'index.html'));
  console.log('  Copied index.html');

  // Copy root styles.css
  await cp(join(ROOT, 'styles.css'), join(outputDir, 'styles.css'));
  console.log('  Copied styles.css');

  // 5. Template manifest.json
  const manifestTemplate = await readFile(
    join(SHARED_DIR, 'manifest.template.json'),
    'utf-8'
  );
  const manifestVars = {
    appName: config.appName,
    shortName: config.shortName || config.brandId.toUpperCase(),
    background: config.colors.background,
  };
  const manifest = template(manifestTemplate, manifestVars);
  await writeFile(join(outputDir, 'manifest.json'), manifest, 'utf-8');
  console.log('  Generated manifest.json');

  // 6. Generate precache URL list
  const precacheUrls = await collectFiles(outputDir, outputDir);
  // Filter to relevant file types for precaching
  const precacheFiltered = precacheUrls.filter((url) =>
    /\.(html|css|js|json|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|ico)$/i.test(url)
  );
  console.log(`  Precache URLs: ${precacheFiltered.length} files`);

  // 7. Template sw.js
  const swTemplate = await readFile(join(SHARED_DIR, 'sw.js'), 'utf-8');
  const cacheVersion = Date.now().toString(36);
  const swVars = {
    brandId: config.brandId,
    cacheVersion,
    precacheUrls: JSON.stringify(precacheFiltered, null, 2),
  };
  const sw = template(swTemplate, swVars);
  await writeFile(join(outputDir, 'sw.js'), sw, 'utf-8');
  console.log(`  Generated sw.js (cache version: ${cacheVersion})`);

  // 7b. Template and copy bridge.js to output root
  const bridgeTemplate = await readFile(join(SHARED_DIR, 'bridge.js'), 'utf-8');
  const bridgeVars = {
    __BRAND_ID__: config.brandId,
    __PLATFORM__: 'pwa',
    __WATERMARK__: config.watermark || config.appName,
    __ADS_ENABLED__: String(config.monetization?.ads?.enabled ?? false),
    __AD_FREQUENCY__: String(config.monetization?.ads?.interstitialFrequency ?? 3),
    __ANALYTICS_ENABLED__: String(!!config.analytics?.measurementId),
    __ANALYTICS_PROVIDER__: config.analytics?.provider || 'none',
    __ANALYTICS_ID__: config.analytics?.measurementId || '',
  };
  let bridgeOut = bridgeTemplate;
  for (const [key, val] of Object.entries(bridgeVars)) {
    bridgeOut = bridgeOut.replaceAll(key, val);
  }
  await writeFile(join(outputDir, 'bridge.js'), bridgeOut, 'utf-8');
  console.log('  Generated bridge.js');

  // 8. Inject bridge.js into each game's index.html
  for (const game of games) {
    const gameHtml = join(outputDir, 'games', game.id, 'index.html');
    try {
      await injectIntoHtml(gameHtml, null, '<script src="/bridge.js"></script>');
    } catch {
      console.warn(`  WARN: Could not inject bridge.js into ${game.id}/index.html`);
    }
  }
  console.log(`  Injected bridge.js into ${games.length} game HTML files`);

  // 9. Inject manifest link + SW registration into root index.html
  const rootHtml = join(outputDir, 'index.html');
  const manifestLink = '<link rel="manifest" href="/manifest.json">';
  const swRegistration = `<script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.warn('SW registration failed:', err));
    }
  </script>`;
  await injectIntoHtml(rootHtml, manifestLink, swRegistration);
  console.log('  Injected manifest + SW registration into root index.html');

  // 10. Print summary
  const totalSize = await getDirSize(outputDir);
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(1);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n--- PWA Build Summary ---');
  console.log(`  Brand:      ${config.appName} (${config.brandId})`);
  console.log(`  Games:      ${games.length}`);
  console.log(`  Output:     ${outputDir}`);
  console.log(`  Size:       ${sizeMB} MB`);
  console.log(`  Precached:  ${precacheFiltered.length} files`);
  console.log(`  Time:       ${elapsed}s`);
  console.log('--- Done ---\n');
}

main().catch((err) => {
  console.error('PWA build failed:', err);
  process.exit(1);
});
