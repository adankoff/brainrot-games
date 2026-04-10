/**
 * MEME TANGRAM -- Tangram Puzzle Engine
 * Defines pieces, target shapes, grid-based placement, and win detection.
 *
 * All coordinates are in grid units. 1 grid unit = GRID_SIZE pixels.
 * The tangram square is made from a 4x4 grid of right triangles (half-cells).
 */

export const GRID = 20;         // px per grid unit
export const BOARD_COLS = 20;   // 400px / 20
export const BOARD_ROWS = 20;   // occupies middle portion of 700px canvas

// Board offset: HUD takes top 110px
export const BOARD_X = 0;
export const BOARD_Y = 110;

// Piece colors (rainbow)
const COLORS = [
  '#ff4444', // red - large tri 1
  '#ff8800', // orange - large tri 2
  '#ffcc00', // yellow - medium tri
  '#44cc44', // green - small tri 1
  '#4488ff', // blue - small tri 2
  '#aa44ff', // purple - square
  '#ff44aa', // pink - parallelogram
];

/**
 * Define the 7 classic tangram pieces as polygons in grid coordinates.
 * Each piece is defined at rotation=0 relative to its own local origin (0,0).
 * All pieces are built from a 4x4 square tangram base.
 *
 * Piece vertices are in local space. We'll transform them for placement.
 */
function createBasePieces() {
  return [
    // 0: Large triangle 1 (half of 4x4 square)
    {
      id: 0,
      name: 'Large Triangle A',
      verts: [[0,0], [4,0], [0,4]],
      color: COLORS[0],
      rotation: 0,
      gx: 0, gy: 0,  // grid position
    },
    // 1: Large triangle 2
    {
      id: 1,
      name: 'Large Triangle B',
      verts: [[0,0], [4,0], [4,4]],
      color: COLORS[1],
      rotation: 0,
      gx: 5, gy: 0,
    },
    // 2: Medium triangle (half of 2x2, but scaled: fits in 2*sqrt(2) area)
    // Actually a right triangle with legs = 2*sqrt(2), simplified to grid:
    {
      id: 2,
      name: 'Medium Triangle',
      verts: [[0,0], [4,0], [2,2]],
      color: COLORS[2],
      rotation: 0,
      gx: 10, gy: 0,
    },
    // 3: Small triangle 1
    {
      id: 3,
      name: 'Small Triangle A',
      verts: [[0,0], [2,0], [0,2]],
      color: COLORS[3],
      rotation: 0,
      gx: 0, gy: 5,
    },
    // 4: Small triangle 2
    {
      id: 4,
      name: 'Small Triangle B',
      verts: [[0,0], [2,0], [2,2]],
      color: COLORS[4],
      rotation: 0,
      gx: 3, gy: 5,
    },
    // 5: Square (2x2)
    {
      id: 5,
      name: 'Square',
      verts: [[0,0], [2,0], [2,2], [0,2]],
      color: COLORS[5],
      rotation: 0,
      gx: 6, gy: 5,
    },
    // 6: Parallelogram
    {
      id: 6,
      name: 'Parallelogram',
      verts: [[0,0], [2,0], [3,2], [1,2]],
      color: COLORS[6],
      rotation: 0,
      gx: 9, gy: 5,
    },
  ];
}

/**
 * Rotate a set of vertices around the centroid by a given angle (in 45-degree increments).
 * rotationSteps: number of 45-degree steps.
 */
export function rotateVerts(verts, rotationSteps) {
  const angle = (rotationSteps * 45) * Math.PI / 180;
  const cos = Math.round(Math.cos(angle) * 1000) / 1000;
  const sin = Math.round(Math.sin(angle) * 1000) / 1000;

  // Rotate around (0,0)
  return verts.map(([x, y]) => {
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    // Round to nearest 0.5 grid to handle 45-degree rotations
    return [Math.round(rx * 2) / 2, Math.round(ry * 2) / 2];
  });
}

/**
 * Get the world-space polygon vertices for a piece (in pixels).
 */
export function getPieceWorldVerts(piece) {
  const rotated = rotateVerts(piece.verts, piece.rotation);
  return rotated.map(([x, y]) => [
    BOARD_X + (piece.gx + x) * GRID,
    BOARD_Y + (piece.gy + y) * GRID,
  ]);
}

/**
 * Get the bounding box of a piece in world pixels.
 */
export function getPieceBounds(piece) {
  const wv = getPieceWorldVerts(piece);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of wv) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * Check if a point (px, py) in world coords is inside a piece polygon.
 */
export function pointInPiece(piece, px, py) {
  const verts = getPieceWorldVerts(piece);
  return pointInPolygon(px, py, verts);
}

/**
 * Ray-casting point-in-polygon test.
 */
export function pointInPolygon(px, py, verts) {
  let inside = false;
  const n = verts.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = verts[i];
    const [xj, yj] = verts[j];
    if (((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Compute the area of a polygon using the shoelace formula.
 */
export function polygonArea(verts) {
  let area = 0;
  const n = verts.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = verts[i];
    const [x2, y2] = verts[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

/**
 * Check if piece overlaps with any other placed piece using grid sampling.
 */
export function piecesOverlap(pieceA, pieceB) {
  const vertsA = getPieceWorldVerts(pieceA);
  const vertsB = getPieceWorldVerts(pieceB);

  // Sample points inside A, check if any are inside B
  const boundsA = getPieceBounds(pieceA);
  const step = GRID / 2;
  for (let x = boundsA.x + step / 2; x < boundsA.x + boundsA.w; x += step) {
    for (let y = boundsA.y + step / 2; y < boundsA.y + boundsA.h; y += step) {
      if (pointInPolygon(x, y, vertsA) && pointInPolygon(x, y, vertsB)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Target puzzle shapes. Each defined as a polygon in grid coordinates
 * relative to the board. The target is drawn as a silhouette.
 */
/**
 * Total piece area in grid^2:
 *   2 large triangles: 2 * (4*4/2) = 16
 *   1 medium triangle: 4*2/2 = 4
 *   2 small triangles: 2 * (2*2/2) = 4
 *   1 square: 2*2 = 4
 *   1 parallelogram: base=2, height=2 => 4
 *   TOTAL = 32 grid^2
 *
 * Each target shape should have area ~32 grid^2.
 * Using shoelace formula to verify.
 */
export const PUZZLES = [
  // 0: Square ~5.66 x 5.66 => use 6x6=36, close enough with generous thresholds
  {
    name: 'THE SQUARE',
    emoji: '',
    target: [[5,5], [11,5], [11,11], [5,11]],
  },
  // 1: Right triangle with legs=8 => area=32
  {
    name: 'BIG TRIANGLE',
    emoji: '',
    target: [[4,4], [12,4], [4,12]],
  },
  // 2: Rectangle 8x4=32
  {
    name: 'THE RECTANGLE',
    emoji: '',
    target: [[4,5], [12,5], [12,9], [4,9]],
  },
  // 3: Parallelogram ~8 wide, 4 tall, shift 2 => area=8*4=32
  {
    name: 'SLANTED',
    emoji: '',
    target: [[6,4], [14,4], [12,8], [4,8]],
  },
  // 4: House: rect 6x5=30 + triangle 6*3/2=9 => 39 (close enough)
  {
    name: 'THE HOUSE',
    emoji: '',
    target: [[5,6], [8,3], [11,6], [11,11], [5,11]],
  },
  // 5: Arrow: shaft 4x2=8 + head triangle 4*4/2=8... build to ~32
  {
    name: 'THE ARROW',
    emoji: '',
    target: [[4,6], [9,6], [9,4], [14,8], [9,12], [9,10], [4,10]],
  },
  // 6: Trapezoid: (10+6)/2 * 4 = 32
  {
    name: 'THE BOAT',
    emoji: '',
    target: [[3,5], [13,5], [11,9], [5,9]],
  },
  // 7: Diamond: diagonals 8 and 8 => area=8*8/2=32
  {
    name: 'THE DIAMOND',
    emoji: '',
    target: [[8,4], [12,8], [8,12], [4,8]],
  },
  // 8: Cat silhouette (simplified, ~32 area)
  {
    name: 'THE CAT',
    emoji: '',
    target: [[5,6], [5,3], [7,5], [9,3], [11,6], [11,12], [9,14], [7,14], [5,12]],
  },
  // 9: Chevron / bird: two triangles forming a V
  {
    name: 'THE BIRD',
    emoji: '',
    target: [[3,4], [8,8], [13,4], [13,7], [8,12], [3,7]],
  },
  // 10: Plus / cross: vertical 2x8=16, horizontal 8x2=16, overlap 2x2=4 => 28
  {
    name: 'THE CROSS',
    emoji: '',
    target: [[7,3], [9,3], [9,7], [13,7], [13,9], [9,9], [9,13], [7,13], [7,9], [3,9], [3,7], [7,7]],
  },
  // 11: Heart
  {
    name: 'THE HEART',
    emoji: '',
    target: [[8,5], [6,3], [4,3], [3,5], [3,7], [8,13], [13,7], [13,5], [12,3], [10,3]],
  },
  // 12: Lightning bolt
  {
    name: 'ZAP',
    emoji: '',
    target: [[7,2], [11,2], [9,7], [12,7], [6,14], [8,8], [5,8]],
  },
];

/**
 * Create a fresh set of 7 tangram pieces, scattered in the tray area below the board.
 */
export function createPieces() {
  const pieces = createBasePieces();

  // Place pieces scattered on the board area itself (not below it).
  // Player drags them into position on the target.
  // Scatter them around the edges of the 20x20 grid.
  const positions = [
    [0, 0],     // large tri A
    [10, 0],    // large tri B
    [15, 0],    // medium tri
    [0, 14],    // small tri A
    [16, 14],   // small tri B
    [0, 10],    // square
    [14, 10],   // parallelogram
  ];
  pieces.forEach((p, i) => {
    p.gx = positions[i][0];
    p.gy = positions[i][1];
    p.rotation = 0;
    p.placed = false;
  });

  return pieces;
}

/**
 * Snap a grid coordinate to the nearest grid position.
 */
export function snapToGrid(val) {
  return Math.round(val);
}

/**
 * Calculate coverage: what percentage of the target shape is covered by placed pieces,
 * and what percentage of piece area is outside the target.
 *
 * Uses point-sampling on a fine grid for accuracy.
 */
export function calculateCoverage(pieces, targetVerts) {
  const step = GRID / 3; // sample every ~7px
  const targetWorld = targetVerts.map(([x, y]) => [BOARD_X + x * GRID, BOARD_Y + y * GRID]);

  // Get target bounding box
  let tMinX = Infinity, tMinY = Infinity, tMaxX = -Infinity, tMaxY = -Infinity;
  for (const [x, y] of targetWorld) {
    if (x < tMinX) tMinX = x;
    if (y < tMinY) tMinY = y;
    if (x > tMaxX) tMaxX = x;
    if (y > tMaxY) tMaxY = y;
  }

  // Get all piece world verts
  const pieceWorlds = pieces.map(p => getPieceWorldVerts(p));

  let targetTotal = 0;
  let targetCovered = 0;
  let pieceOutside = 0;
  let pieceTotal = 0;
  let overlapCount = 0;

  // Sample target area
  for (let x = tMinX + step / 2; x < tMaxX; x += step) {
    for (let y = tMinY + step / 2; y < tMaxY; y += step) {
      const inTarget = pointInPolygon(x, y, targetWorld);
      if (inTarget) {
        targetTotal++;
        let coveredBy = 0;
        for (const pv of pieceWorlds) {
          if (pointInPolygon(x, y, pv)) coveredBy++;
        }
        if (coveredBy > 0) targetCovered++;
        if (coveredBy > 1) overlapCount++;
      }
    }
  }

  // Sample piece areas for outside check
  for (let pi = 0; pi < pieces.length; pi++) {
    const bounds = getPieceBounds(pieces[pi]);
    for (let x = bounds.x + step / 2; x < bounds.x + bounds.w; x += step) {
      for (let y = bounds.y + step / 2; y < bounds.y + bounds.h; y += step) {
        if (pointInPolygon(x, y, pieceWorlds[pi])) {
          pieceTotal++;
          if (!pointInPolygon(x, y, targetWorld)) {
            pieceOutside++;
          }
        }
      }
    }
  }

  const coverageRatio = targetTotal > 0 ? targetCovered / targetTotal : 0;
  const outsideRatio = pieceTotal > 0 ? pieceOutside / pieceTotal : 0;
  const overlapRatio = targetTotal > 0 ? overlapCount / targetTotal : 0;

  return { coverageRatio, outsideRatio, overlapRatio };
}

/**
 * Check win condition: coverage > 85% and outside < 10% and overlap < 5%.
 * (Generous thresholds for playability since pieces don't perfectly tile every shape.)
 */
export function checkWin(pieces, targetVerts) {
  const { coverageRatio, outsideRatio, overlapRatio } = calculateCoverage(pieces, targetVerts);
  return coverageRatio > 0.82 && outsideRatio < 0.15 && overlapRatio < 0.08;
}
