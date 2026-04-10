import { readFile, readdir, cp, mkdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Read and validate a brand configuration file.
 * @param {string} brandId - The brand identifier
 * @returns {Promise<object>} Parsed brand config
 */
export async function readBrandConfig(brandId) {
  const configPath = join(__dirname, '..', 'brands', `${brandId}.json`);
  const schemaPath = join(__dirname, 'brand-config.schema.json');

  const raw = await readFile(configPath, 'utf-8');
  const config = JSON.parse(raw);

  const schemaRaw = await readFile(schemaPath, 'utf-8');
  const schema = JSON.parse(schemaRaw);

  // Lightweight required-field validation (no external deps)
  const missing = schema.required.filter((key) => !(key in config));
  if (missing.length > 0) {
    throw new Error(
      `Brand config "${brandId}" is missing required fields: ${missing.join(', ')}`
    );
  }

  // Validate nested required fields
  for (const section of ['colors', 'assets', 'monetization', 'analytics']) {
    if (schema.properties[section]?.required) {
      const sectionMissing = schema.properties[section].required.filter(
        (key) => !(key in config[section])
      );
      if (sectionMissing.length > 0) {
        throw new Error(
          `Brand config "${brandId}.${section}" is missing required fields: ${sectionMissing.join(', ')}`
        );
      }
    }
  }

  // Validate monetization sub-objects
  for (const sub of ['ads', 'iap']) {
    const subSchema = schema.properties.monetization?.properties?.[sub];
    if (subSchema?.required) {
      const subMissing = subSchema.required.filter(
        (key) => !(key in config.monetization[sub])
      );
      if (subMissing.length > 0) {
        throw new Error(
          `Brand config "${brandId}.monetization.${sub}" is missing required fields: ${subMissing.join(', ')}`
        );
      }
    }
  }

  return config;
}

/**
 * Resolve the list of games based on brand include/exclude rules.
 * @param {object} brandConfig - The brand configuration
 * @param {string} catalogPath - Path to game-catalog.json
 * @returns {Promise<Array<{id: string, title: string, path: string}>>}
 */
export async function resolveGames(brandConfig, catalogPath) {
  const raw = await readFile(catalogPath, 'utf-8');
  const catalog = JSON.parse(raw);

  const { include, exclude } = brandConfig.games;
  const excludeSet = new Set(exclude || []);

  let games;
  if (include === 'all') {
    games = catalog;
  } else {
    const includeSet = new Set(include);
    games = catalog.filter((g) => includeSet.has(g.id));
  }

  return games.filter((g) => !excludeSet.has(g.id));
}

/**
 * Replace {{key}} placeholders in a string with values from a vars object.
 * @param {string} str - Template string
 * @param {Record<string, string>} vars - Key-value pairs for substitution
 * @returns {string}
 */
export function template(str, vars) {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return key in vars ? vars[key] : match;
  });
}

/**
 * Copy selected game directories from source to destination.
 * @param {Array<{id: string, path: string}>} gameList - Games to copy
 * @param {string} srcBase - Source root directory
 * @param {string} destBase - Destination root directory
 */
export async function copyGameDirs(gameList, srcBase, destBase) {
  for (const game of gameList) {
    const src = join(srcBase, 'games', game.id);
    const dest = join(destBase, 'games', game.id);
    await mkdir(dest, { recursive: true });
    await cp(src, dest, { recursive: true });
  }
}

/**
 * Inject strings into an HTML file's <head> and/or <body>.
 * @param {string} htmlPath - Path to HTML file
 * @param {string} [headInjection] - String to inject right before </head>
 * @param {string} [bodyInjection] - String to inject right after <body>
 */
export async function injectIntoHtml(htmlPath, headInjection, bodyInjection) {
  let html = await readFile(htmlPath, 'utf-8');

  if (headInjection) {
    html = html.replace('</head>', `  ${headInjection}\n</head>`);
  }

  if (bodyInjection) {
    // Inject after the opening <body> tag (with optional attributes)
    html = html.replace(/(<body[^>]*>)/i, `$1\n  ${bodyInjection}`);
  }

  const { writeFile: wf } = await import('node:fs/promises');
  await wf(htmlPath, html, 'utf-8');
}
