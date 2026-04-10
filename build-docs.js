#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = __dirname;
const DOCS_DIR = path.join(ROOT, 'docs');

// Collect all .md files, excluding hidden dirs and node_modules
function findMarkdownFiles(dir, base = dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'docs') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findMarkdownFiles(full, base));
    } else if (entry.name.endsWith('.md')) {
      results.push({ absolute: full, relative: path.relative(base, full) });
    }
  }
  return results;
}

// Group files by directory
function groupByDir(files) {
  const groups = {};
  for (const f of files) {
    const dir = path.dirname(f.relative);
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(f);
  }
  return groups;
}

// Nice section name from directory
function sectionName(dir) {
  const names = {
    '.': 'Root',
    'research': '1. Research',
    'brand': '2. Brand',
    'concepts': '3. Concepts',
    'design-docs': '4. Design Docs',
    'architecture': '5. Architecture',
    'marketing': '7. Marketing',
    'business': '8. Business',
  };
  return names[dir] || dir;
}

// Nice file title from filename
function fileTitle(relative) {
  const name = path.basename(relative, '.md');
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Gdd/g, 'GDD')
    .replace(/Qa/g, 'QA')
    .replace(/Seo/g, 'SEO')
    .replace(/Roi/g, 'ROI');
}

// Extract first heading or first line as description
function extractDescription(md) {
  const lines = md.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) return line.replace(/^#+\s*/, '');
    if (line.startsWith('## ')) return line.replace(/^#+\s*/, '');
  }
  return '';
}

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0a0a0f;
  color: #e0e0e0;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
a { color: #c8ff00; text-decoration: none; }
a:hover { text-decoration: underline; }
.container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }
.back-link { display: inline-block; margin-bottom: 1.5rem; font-size: 0.9rem; opacity: 0.7; }
.back-link:hover { opacity: 1; }

/* Index page */
.hero { text-align: center; padding: 3rem 0 2rem; }
.hero h1 { font-size: 2.5rem; color: #c8ff00; letter-spacing: -0.02em; }
.hero p { color: #888; margin-top: 0.5rem; font-size: 1.1rem; }
.section-group { margin-bottom: 2.5rem; }
.section-group h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #c8ff00;
  border-bottom: 1px solid #1a1a2e;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.doc-list { list-style: none; }
.doc-list li { margin-bottom: 0.75rem; }
.doc-list a {
  display: block;
  padding: 0.75rem 1rem;
  background: #111122;
  border-radius: 8px;
  border: 1px solid #1a1a2e;
  transition: border-color 0.2s, background 0.2s;
}
.doc-list a:hover {
  border-color: #c8ff00;
  background: #15152a;
  text-decoration: none;
}
.doc-list .title { font-weight: 600; color: #fff; }
.doc-list .desc { font-size: 0.85rem; color: #666; margin-top: 0.25rem; }
.doc-list .path { font-size: 0.75rem; color: #444; font-family: monospace; margin-top: 0.2rem; }
.play-links { display: flex; gap: 1rem; justify-content: center; margin: 2rem 0; flex-wrap: wrap; }
.play-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #c8ff00;
  color: #0a0a0f;
  font-weight: 700;
  border-radius: 8px;
  font-size: 0.95rem;
}
.play-btn:hover { background: #d4ff33; text-decoration: none; }

/* Document page */
.doc-content h1 { font-size: 2rem; color: #c8ff00; margin-bottom: 0.5rem; line-height: 1.3; }
.doc-content h2 { font-size: 1.5rem; color: #fff; margin-top: 2.5rem; margin-bottom: 0.75rem; padding-bottom: 0.4rem; border-bottom: 1px solid #1a1a2e; }
.doc-content h3 { font-size: 1.2rem; color: #ddd; margin-top: 2rem; margin-bottom: 0.5rem; }
.doc-content h4 { font-size: 1rem; color: #bbb; margin-top: 1.5rem; margin-bottom: 0.5rem; }
.doc-content p { margin-bottom: 1rem; }
.doc-content ul, .doc-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
.doc-content li { margin-bottom: 0.4rem; }
.doc-content strong { color: #fff; }
.doc-content em { color: #aaa; }
.doc-content code {
  background: #1a1a2e;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
  color: #c8ff00;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.doc-content pre {
  background: #111122;
  border: 1px solid #1a1a2e;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}
.doc-content pre code {
  background: none;
  padding: 0;
  color: #ccc;
}
.doc-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}
.doc-content th {
  background: #1a1a2e;
  color: #c8ff00;
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.doc-content td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #1a1a2e;
  vertical-align: top;
}
.doc-content tr:hover td { background: #0d0d1a; }
.doc-content blockquote {
  border-left: 3px solid #c8ff00;
  padding-left: 1rem;
  margin-bottom: 1rem;
  color: #999;
}
.doc-content hr { border: none; border-top: 1px solid #1a1a2e; margin: 2rem 0; }
.doc-content img { max-width: 100%; border-radius: 8px; }
.meta { color: #555; font-size: 0.85rem; margin-bottom: 2rem; font-family: monospace; }
.nav-footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #1a1a2e; display: flex; justify-content: space-between; font-size: 0.9rem; }

@media (max-width: 600px) {
  .container { padding: 1rem; }
  .hero h1 { font-size: 1.8rem; }
  .doc-content h1 { font-size: 1.5rem; }
  .doc-content table { font-size: 0.8rem; }
  .doc-content th, .doc-content td { padding: 0.4rem; }
}
`;

function htmlTemplate(title, body, backLink = true) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Brainrot Games Docs</title>
<style>${CSS}</style>
</head>
<body>
<div class="container">
${backLink ? '<a href="index.html" class="back-link">&larr; back to index</a>' : ''}
${body}
</div>
</body>
</html>`;
}

// Build
const files = findMarkdownFiles(ROOT);
const groups = groupByDir(files);
const sectionOrder = ['.', 'research', 'brand', 'concepts', 'design-docs', 'architecture', 'marketing', 'business'];

// Clean and recreate docs dir
if (fs.existsSync(DOCS_DIR)) fs.rmSync(DOCS_DIR, { recursive: true });
fs.mkdirSync(DOCS_DIR, { recursive: true });

// Track all pages for nav
const allPages = [];

// Convert each .md to .html
for (const f of files) {
  const md = fs.readFileSync(f.absolute, 'utf-8');
  const htmlName = f.relative.replace(/\//g, '--').replace(/\.md$/, '.html');
  const title = fileTitle(f.relative);
  const desc = extractDescription(md);

  const html = marked(md);
  const page = htmlTemplate(title, `
    <div class="meta">${f.relative}</div>
    <div class="doc-content">${html}</div>
    <div class="nav-footer">
      <a href="index.html">&larr; index</a>
    </div>
  `);

  fs.writeFileSync(path.join(DOCS_DIR, htmlName), page);
  allPages.push({ relative: f.relative, htmlName, title, desc, dir: path.dirname(f.relative) });
  console.log(`  ✓ ${htmlName}`);
}

// Build index page
let indexBody = `
<div class="hero">
  <h1>BRAINROT GAMES</h1>
  <p>documentation index — all project deliverables</p>
</div>
<div class="play-links">
  <a href="../games/game-01/" class="play-btn">Play Flappy Tralalero</a>
  <a href="../games/game-02/" class="play-btn">Play Whack-a-Rot</a>
  <a href="../index.html" class="play-btn" style="background:#ff2d78;">Landing Page</a>
</div>
`;

for (const dir of sectionOrder) {
  if (!groups[dir]) continue;
  const section = sectionName(dir);
  const sectionPages = allPages.filter(p => p.dir === dir);
  if (sectionPages.length === 0) continue;

  indexBody += `<div class="section-group"><h2>${section}</h2><ul class="doc-list">`;
  for (const p of sectionPages) {
    indexBody += `<li><a href="${p.htmlName}">
      <div class="title">${p.title}</div>
      <div class="desc">${p.desc}</div>
      <div class="path">${p.relative}</div>
    </a></li>`;
  }
  indexBody += `</ul></div>`;
}

const indexPage = htmlTemplate('Documentation Index', indexBody, false);
fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), indexPage);
console.log(`\n  ✓ index.html`);
console.log(`\nDone! ${allPages.length + 1} pages written to docs/`);
console.log(`Open: http://localhost:8080/docs/index.html`);
