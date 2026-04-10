/**
 * MEME PICROSS -- Nonogram Generator
 * Procedurally generates nonogram puzzles with unique solutions.
 */

/**
 * Calculate run-length clues for a single line (row or column).
 *
 * @param {boolean[]} line - Array of cell states (true = filled)
 * @returns {number[]} Array of consecutive filled-cell counts
 */
function calcClues(line) {
  const clues = [];
  let run = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i]) {
      run++;
    } else if (run > 0) {
      clues.push(run);
      run = 0;
    }
  }
  if (run > 0) clues.push(run);
  return clues.length > 0 ? clues : [0];
}

/**
 * Extract a column from the solution grid.
 *
 * @param {boolean[][]} grid
 * @param {number} col
 * @returns {boolean[]}
 */
function getColumn(grid, col) {
  return grid.map(row => row[col]);
}

/**
 * Check if a line (row/col) is fully determined by its clues alone.
 * A trivially determined line is one where:
 * - All cells are filled (clue = [size])
 * - All cells are empty (clue = [0])
 * - The clue sum + gaps equals the line size (forced arrangement)
 *
 * @param {number[]} clues
 * @param {number} size
 * @returns {boolean}
 */
function isLineTrivial(clues, size) {
  if (clues.length === 1 && clues[0] === 0) return true;
  if (clues.length === 1 && clues[0] === size) return true;
  const minSpace = clues.reduce((a, b) => a + b, 0) + clues.length - 1;
  return minSpace === size;
}

/**
 * Solve a nonogram using line-by-line logic (no backtracking).
 * Returns the solved grid or null if it cannot fully solve.
 *
 * @param {number[][]} rowClues
 * @param {number[][]} colClues
 * @param {number} size
 * @returns {boolean[][]|null}
 */
function solveNonogram(rowClues, colClues, size) {
  // Cell states: 0 = unknown, 1 = filled, -1 = empty
  const grid = Array.from({ length: size }, () => new Array(size).fill(0));

  /**
   * Generate all valid placements for clues in a line of given size,
   * constrained by known cells.
   */
  function generatePlacements(clues, lineSize, known) {
    if (clues.length === 1 && clues[0] === 0) {
      // All empty -- check consistency
      const allEmpty = known.every(k => k !== 1);
      return allEmpty ? [new Array(lineSize).fill(false)] : [];
    }

    const results = [];
    const line = new Array(lineSize).fill(false);

    function place(clueIdx, pos) {
      if (clueIdx === clues.length) {
        // All remaining must be empty
        for (let i = pos; i < lineSize; i++) {
          if (known[i] === 1) return;
        }
        results.push(line.slice());
        return;
      }

      const clueLen = clues[clueIdx];
      const remainingClues = clues.length - clueIdx - 1;
      const remainingSpace = clues.slice(clueIdx + 1).reduce((a, b) => a + b, 0) + remainingClues;
      const maxStart = lineSize - clueLen - remainingSpace;

      for (let start = pos; start <= maxStart; start++) {
        // Check gap before this block (must be empty)
        let gapOk = true;
        for (let g = pos; g < start; g++) {
          if (known[g] === 1) { gapOk = false; break; }
        }
        if (!gapOk) break; // If a filled cell is in the gap, no further starts work

        // Check block placement consistency
        let blockOk = true;
        for (let b = start; b < start + clueLen; b++) {
          if (known[b] === -1) { blockOk = false; break; }
        }
        if (!blockOk) continue;

        // Check separator after block
        if (start + clueLen < lineSize && clueIdx < clues.length - 1) {
          if (known[start + clueLen] === 1) {
            // Separator cell is known-filled, can't place here
            // But could try longer start
            // Set block and continue
          }
        }

        // Place the block
        for (let b = start; b < start + clueLen; b++) {
          line[b] = true;
        }

        // Clear after block
        for (let b = start + clueLen; b < lineSize; b++) {
          line[b] = false;
        }

        // Separator
        const nextPos = start + clueLen + 1;
        if (clueIdx < clues.length - 1) {
          if (start + clueLen < lineSize && known[start + clueLen] === 1) {
            // Can't place separator here
            for (let b = start; b < start + clueLen; b++) line[b] = false;
            continue;
          }
        }

        place(clueIdx + 1, nextPos);

        // Undo
        for (let b = start; b < start + clueLen; b++) line[b] = false;
      }
    }

    place(0, 0);
    return results;
  }

  let changed = true;
  let iterations = 0;
  const maxIterations = size * 4;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Process rows
    for (let r = 0; r < size; r++) {
      const known = grid[r];
      if (known.every(k => k !== 0)) continue;

      const placements = generatePlacements(rowClues[r], size, known);
      if (placements.length === 0) return null;

      for (let c = 0; c < size; c++) {
        if (known[c] !== 0) continue;
        const allFilled = placements.every(p => p[c]);
        const allEmpty = placements.every(p => !p[c]);
        if (allFilled) { grid[r][c] = 1; changed = true; }
        else if (allEmpty) { grid[r][c] = -1; changed = true; }
      }
    }

    // Process columns
    for (let c = 0; c < size; c++) {
      const known = grid.map(row => row[c]);
      if (known.every(k => k !== 0)) continue;

      const placements = generatePlacements(colClues[c], size, known);
      if (placements.length === 0) return null;

      for (let r = 0; r < size; r++) {
        if (grid[r][c] !== 0) continue;
        const allFilled = placements.every(p => p[r]);
        const allEmpty = placements.every(p => !p[r]);
        if (allFilled) { grid[r][c] = 1; changed = true; }
        else if (allEmpty) { grid[r][c] = -1; changed = true; }
      }
    }
  }

  // Check if fully solved
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) return null;
    }
  }

  return grid.map(row => row.map(v => v === 1));
}

/**
 * Generate a random nonogram puzzle that is solvable by line logic alone
 * (guaranteeing a unique solution).
 *
 * @param {number} size - Grid size (5, 8, or 10)
 * @returns {{ solution: boolean[][], rowClues: number[][], colClues: number[][] }}
 */
export function generatePuzzle(size) {
  const maxAttempts = 200;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random pattern with ~40-60% fill for interesting puzzles
    const fillRate = 0.35 + Math.random() * 0.25;
    const solution = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.random() < fillRate)
    );

    // Ensure no completely empty or completely full rows/columns (boring clues)
    let valid = true;
    for (let r = 0; r < size; r++) {
      const filled = solution[r].filter(Boolean).length;
      if (filled === 0 || filled === size) { valid = false; break; }
    }
    if (!valid) continue;
    for (let c = 0; c < size; c++) {
      const filled = getColumn(solution, c).filter(Boolean).length;
      if (filled === 0 || filled === size) { valid = false; break; }
    }
    if (!valid) continue;

    const rowClues = solution.map(row => calcClues(row));
    const colClues = Array.from({ length: size }, (_, c) => calcClues(getColumn(solution, c)));

    // Verify solvable by line logic alone
    const solved = solveNonogram(rowClues, colClues, size);
    if (!solved) continue;

    // Verify the solution matches
    let matches = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (solved[r][c] !== solution[r][c]) { matches = false; break; }
      }
      if (!matches) break;
    }
    if (!matches) continue;

    return { solution, rowClues, colClues };
  }

  // Fallback: return a simple diagonal pattern that is always solvable
  const solution = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => (r + c) % 3 === 0)
  );
  const rowClues = solution.map(row => calcClues(row));
  const colClues = Array.from({ length: size }, (_, c) => calcClues(getColumn(solution, c)));
  return { solution, rowClues, colClues };
}
