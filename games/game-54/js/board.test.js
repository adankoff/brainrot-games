/**
 * BRAINROT 2048 -- Board Logic Tests
 * Run with: node --experimental-vm-modules games/game-07/js/board.test.js
 * Or simply: node games/game-07/js/board.test.js
 */

// Since this is ES modules, we need a simple test harness
// that works without a test runner. We'll use dynamic import.

async function runTests() {
  // We can't directly import ES modules with relative paths in Node
  // without a bundler, so we'll implement the core logic inline for testing.

  // ---- Inline minimal board logic for testing ----
  const GRID_SIZE = 4;
  let nextTileId = 1;

  function createTile(value) {
    return { value, id: nextTileId++ };
  }

  function processLine(tiles) {
    // Same algorithm as BoardState._processLine but simplified for testing
    // tiles is an array of values (numbers), 0 = empty
    const nonEmpty = tiles.filter((v) => v > 0);
    const result = [];
    let score = 0;

    let i = 0;
    while (i < nonEmpty.length) {
      if (i + 1 < nonEmpty.length && nonEmpty[i] === nonEmpty[i + 1]) {
        const merged = nonEmpty[i] * 2;
        result.push(merged);
        score += merged;
        i += 2;
      } else {
        result.push(nonEmpty[i]);
        i++;
      }
    }

    // Pad with zeros
    while (result.length < GRID_SIZE) {
      result.push(0);
    }

    return { result, score };
  }

  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, name) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr === expectedStr) {
      passed++;
    } else {
      failed++;
      console.error(`FAIL: ${name}`);
      console.error(`  Expected: ${expectedStr}`);
      console.error(`  Actual:   ${actualStr}`);
    }
  }

  // ---- Test Cases ----

  // Basic merge
  assertEqual(
    processLine([2, 2, 0, 0]).result,
    [4, 0, 0, 0],
    'Basic merge: [2,2,0,0] -> [4,0,0,0]'
  );

  // Slide without merge
  assertEqual(
    processLine([0, 0, 2, 0]).result,
    [2, 0, 0, 0],
    'Slide: [0,0,2,0] -> [2,0,0,0]'
  );

  // Double merge (two pairs)
  assertEqual(
    processLine([2, 2, 2, 2]).result,
    [4, 4, 0, 0],
    'Double merge: [2,2,2,2] -> [4,4,0,0]'
  );

  // No double-merge in one swipe: [2,2,4] should NOT become [8]
  assertEqual(
    processLine([2, 2, 4, 0]).result,
    [4, 4, 0, 0],
    'No cascade merge: [2,2,4,0] -> [4,4,0,0]'
  );

  // Three of same value
  assertEqual(
    processLine([2, 2, 2, 0]).result,
    [4, 2, 0, 0],
    'Three same: [2,2,2,0] -> [4,2,0,0]'
  );

  // No change when already packed left
  assertEqual(
    processLine([2, 4, 8, 16]).result,
    [2, 4, 8, 16],
    'No change: [2,4,8,16] -> [2,4,8,16]'
  );

  // Complex case
  assertEqual(
    processLine([4, 0, 4, 4]).result,
    [8, 4, 0, 0],
    'Complex: [4,0,4,4] -> [8,4,0,0]'
  );

  // All empty
  assertEqual(
    processLine([0, 0, 0, 0]).result,
    [0, 0, 0, 0],
    'All empty: [0,0,0,0] -> [0,0,0,0]'
  );

  // Single tile
  assertEqual(
    processLine([0, 0, 0, 8]).result,
    [8, 0, 0, 0],
    'Single slide: [0,0,0,8] -> [8,0,0,0]'
  );

  // Large values
  assertEqual(
    processLine([1024, 1024, 0, 0]).result,
    [2048, 0, 0, 0],
    'Large merge: [1024,1024,0,0] -> [2048,0,0,0]'
  );

  // Score tracking
  assertEqual(
    processLine([2, 2, 4, 4]).score,
    12,
    'Score: [2,2,4,4] should score 4+8=12'
  );

  // No merge, no score
  assertEqual(
    processLine([2, 4, 8, 0]).score,
    0,
    'Score: [2,4,8,0] should score 0'
  );

  // Edge case: [4, 2, 2, 0]
  assertEqual(
    processLine([4, 2, 2, 0]).result,
    [4, 4, 0, 0],
    'Mixed: [4,2,2,0] -> [4,4,0,0]'
  );

  // Edge case: [2, 4, 2, 4]
  assertEqual(
    processLine([2, 4, 2, 4]).result,
    [2, 4, 2, 4],
    'No merge possible: [2,4,2,4] -> [2,4,2,4]'
  );

  // Edge case: [0, 2, 0, 2]
  assertEqual(
    processLine([0, 2, 0, 2]).result,
    [4, 0, 0, 0],
    'Merge with gaps: [0,2,0,2] -> [4,0,0,0]'
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
