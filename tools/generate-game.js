#!/usr/bin/env node
/**
 * Brainrot Games — Game Generator
 *
 * Generates boilerplate for a new game from a spec object.
 * Usage: node tools/generate-game.js <spec-file.json>
 *
 * Or require and call generateGame(spec) programmatically.
 */

const fs = require('fs');
const path = require('path');

function generateGame(spec) {
  const dir = path.join(__dirname, '..', 'games', spec.folder);
  const jsDir = path.join(dir, 'js');

  fs.mkdirSync(jsDir, { recursive: true });

  // 1. index.html
  fs.writeFileSync(path.join(dir, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${spec.title} | Brainrot Games</title>
  <meta property="og:title" content="${spec.title} | Brainrot Games">
  <meta property="og:description" content="${spec.ogDescription}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://brainrotgames.com/games/${spec.folder}/">
  <meta property="og:image" content="https://brainrotgames.com/brand/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${spec.title} | Brainrot Games">
  <meta name="twitter:description" content="${spec.twitterDescription}">
  <link rel="stylesheet" href="../shared/styles.css">
  <link rel="stylesheet" href="style.css">
</head>
<body data-theme="${spec.bodyTheme}">
  <div class="game-container">
    <canvas id="game-canvas"></canvas>
    <div id="menu-overlay" class="menu-screen"></div>
    <div id="gameover-overlay" class="game-over-overlay" style="display:none;"></div>
  </div>
  <script type="module" src="js/main.js"></script>
</body>
</html>
`);

  // 2. style.css
  fs.writeFileSync(path.join(dir, 'style.css'), `.game-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 260px;
  margin: 0 auto;
}

.theme-select__btn {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: var(--color-surface, #111122);
  color: var(--color-text, #e0e0e0);
  border: 2px solid transparent;
  border-radius: var(--radius-md, 8px);
  font-family: var(--font-body, 'Space Grotesk', sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.theme-select__btn:hover {
  border-color: var(--color-primary, #c8ff00);
  background: #15152a;
}

.theme-select__btn--active {
  border-color: var(--color-primary, #c8ff00);
  background: #1a1a3e;
  color: var(--color-primary, #c8ff00);
}
`);

  console.log(`  ✓ ${spec.folder}/index.html`);
  console.log(`  ✓ ${spec.folder}/style.css`);
}

// CLI mode
if (require.main === module) {
  const specFile = process.argv[2];
  if (!specFile) {
    // Generate from inline specs
    const specs = require('./game-specs.json');
    for (const spec of specs) {
      generateGame(spec);
    }
    console.log(`\nGenerated ${specs.length} games.`);
  } else {
    const spec = JSON.parse(fs.readFileSync(specFile, 'utf-8'));
    generateGame(spec);
  }
}

module.exports = { generateGame };
