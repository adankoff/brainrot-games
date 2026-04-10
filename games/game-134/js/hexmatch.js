/**
 * HEX MATCH -- Core Game Logic
 * Hexagonal tile matching puzzle. Rotate hexes so all adjacent edges match colors.
 * Board is procedurally generated: start solved, then scramble.
 *
 * Uses pointy-top hexagons in axial coordinates (q, r).
 * Vertex 0 at top (-90 degrees), going clockwise.
 *
 * Edge i connects vertex i to vertex (i+1)%6 and faces direction i.
 * Directions (clockwise from NE):
 *   0=NE, 1=E, 2=SE, 3=SW, 4=W, 5=NW
 */

import { readThemeColor } from '../../shared/theme-utils.js';

const NUM_EDGES = 6;
const DEG60 = Math.PI / 3;

const EDGE_COLORS = [
  readThemeColor('--game-edge-1', '#cccccc'),
  readThemeColor('--game-edge-2', '#aaaaaa'),
  readThemeColor('--game-edge-3', '#888888'),
  readThemeColor('--game-edge-4', '#666666'),
  readThemeColor('--game-edge-5', '#444444'),
  readThemeColor('--game-edge-6', '#555555'),
];

export const DIFFICULTIES = {
  easy:   { cols: 3, rows: 3, numColors: 3, label: 'easy' },
  medium: { cols: 4, rows: 3, numColors: 4, label: 'medium' },
  hard:   { cols: 4, rows: 4, numColors: 5, label: 'hard' },
};

/** Axial direction offsets. Index = edge/direction number. */
const DIR_OFFSETS = [
  { dq: 1,  dr: -1 },  // 0: NE
  { dq: 1,  dr: 0  },  // 1: E
  { dq: 0,  dr: 1  },  // 2: SE
  { dq: -1, dr: 1  },  // 3: SW
  { dq: -1, dr: 0  },  // 4: W
  { dq: 0,  dr: -1 },  // 5: NW
];

/**
 * @typedef {Object} HexTile
 * @property {number} q - Axial q coordinate
 * @property {number} r - Axial r coordinate
 * @property {number[]} edges - 6 color indices, edge i faces direction i
 * @property {number} cx - Center x in canvas coords
 * @property {number} cy - Center y in canvas coords
 * @property {number} rotation - Visual rotation offset in radians (for animation)
 */

function oppositeEdge(e) {
  return (e + 3) % 6;
}

/**
 * Create a board: build a solved configuration, then scramble by rotating tiles.
 */
export function createBoard(config) {
  const { cols, rows, numColors } = config;
  const grid = new Map();
  const tiles = [];

  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const tile = { q, r, edges: new Array(6).fill(-1), cx: 0, cy: 0, rotation: 0 };
      grid.set(`${q},${r}`, tile);
      tiles.push(tile);
    }
  }

  // Assign matching colors to shared edges (solved state)
  for (const tile of tiles) {
    for (let e = 0; e < 6; e++) {
      if (tile.edges[e] !== -1) continue;
      const colorIdx = Math.floor(Math.random() * numColors);
      tile.edges[e] = colorIdx;
      const dir = DIR_OFFSETS[e];
      const neighbor = grid.get(`${tile.q + dir.dq},${tile.r + dir.dr}`);
      if (neighbor) {
        neighbor.edges[oppositeEdge(e)] = colorIdx;
      }
    }
  }

  // Scramble, ensuring board is not already solved
  let attempts = 0;
  do {
    for (const tile of tiles) {
      const rots = 1 + Math.floor(Math.random() * 5);
      for (let i = 0; i < rots; i++) {
        rotateTileEdges(tile);
      }
    }
    attempts++;
  } while (isSolved(tiles) && attempts < 20);

  return tiles;
}

/**
 * Rotate a tile's edges clockwise by 60 degrees.
 */
export function rotateTileEdges(tile) {
  const last = tile.edges[5];
  for (let i = 5; i > 0; i--) {
    tile.edges[i] = tile.edges[i - 1];
  }
  tile.edges[0] = last;
}

/**
 * Compute pixel positions for all tiles (pointy-top axial to pixel).
 */
export function layoutTiles(tiles, canvasW, canvasH, hexSize, cols, rows) {
  const sqrt3 = Math.sqrt(3);

  const positions = tiles.map(t => ({
    x: hexSize * (sqrt3 * t.q + sqrt3 / 2 * t.r),
    y: hexSize * (1.5 * t.r),
  }));

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of positions) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const offsetX = (canvasW - (maxX - minX)) / 2 - minX;
  const offsetY = (canvasH - (maxY - minY)) / 2 - minY + 25;

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].cx = positions[i].x + offsetX;
    tiles[i].cy = positions[i].y + offsetY;
  }
}

/**
 * Count matched vs total shared edge pairs.
 */
export function countMatches(tiles) {
  const grid = new Map();
  for (const t of tiles) grid.set(`${t.q},${t.r}`, t);

  let matched = 0;
  let total = 0;
  const counted = new Set();

  for (const tile of tiles) {
    for (let e = 0; e < 6; e++) {
      const dir = DIR_OFFSETS[e];
      const nq = tile.q + dir.dq;
      const nr = tile.r + dir.dr;
      const neighbor = grid.get(`${nq},${nr}`);
      if (!neighbor) continue;

      const ka = `${tile.q},${tile.r}`;
      const kb = `${nq},${nr}`;
      const key = ka < kb ? `${ka}-${kb}` : `${kb}-${ka}`;
      if (counted.has(key)) continue;
      counted.add(key);

      total++;
      if (tile.edges[e] === neighbor.edges[oppositeEdge(e)]) {
        matched++;
      }
    }
  }
  return { matched, total };
}

/**
 * Per-edge match state for a single tile (true = matched or border).
 */
export function getEdgeMatchStates(tile, allTiles) {
  const grid = new Map();
  for (const t of allTiles) grid.set(`${t.q},${t.r}`, t);

  const states = [];
  for (let e = 0; e < 6; e++) {
    const dir = DIR_OFFSETS[e];
    const neighbor = grid.get(`${tile.q + dir.dq},${tile.r + dir.dr}`);
    if (!neighbor) {
      states.push(true); // Border edges have no conflict
    } else {
      states.push(tile.edges[e] === neighbor.edges[oppositeEdge(e)]);
    }
  }
  return states;
}

/**
 * Find which tile was tapped (closest within hexSize radius).
 */
export function findTileAt(tiles, x, y, hexSize) {
  let closest = null;
  let closestDist = hexSize * hexSize;

  for (const tile of tiles) {
    const dx = x - tile.cx;
    const dy = y - tile.cy;
    const dist = dx * dx + dy * dy;
    if (dist < closestDist) {
      closestDist = dist;
      closest = tile;
    }
  }
  return closest;
}

/**
 * Check if board is fully solved.
 */
export function isSolved(tiles) {
  const { matched, total } = countMatches(tiles);
  return total > 0 && matched === total;
}

export function getEdgeColor(idx) {
  return EDGE_COLORS[idx] || '#555';
}

/**
 * Get vertices of a pointy-top hexagon. Vertex 0 at top, clockwise.
 */
export function getHexVertices(cx, cy, size, rotationOffset = 0) {
  const verts = [];
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + i * DEG60 + rotationOffset;
    verts.push({
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle),
    });
  }
  return verts;
}

export { NUM_EDGES, DEG60, EDGE_COLORS };
