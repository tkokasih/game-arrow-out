import { Block, Direction, GRID_COLS, GRID_ROWS, PALETTE } from './types';
import { findSolution } from './engine';

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

function rand(n: number): number {
  return Math.floor(Math.random() * n);
}

function tryPlaceBlocks(): Block[] | null {
  const count = 8 + rand(4); // 8, 9, 10, or 11
  const occupied = new Set<string>();
  const blocks: Block[] = [];

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 200; attempt++) {
      // Bias toward 1×1 and 1×2 so more blocks fit on the grid
      const r = rand(4);
      const w = r < 3 ? 1 : 2;
      const h = r === 0 ? 1 : r < 3 ? 1 + rand(2) : 1 + rand(2);
      const x = rand(GRID_COLS - w + 1);
      const y = rand(GRID_ROWS - h + 1);
      const arrow = DIRECTIONS[rand(4)];

      let conflict = false;
      for (let dy = 0; dy < h && !conflict; dy++) {
        for (let dx = 0; dx < w && !conflict; dx++) {
          if (occupied.has(`${x + dx},${y + dy}`)) conflict = true;
        }
      }
      if (conflict) continue;

      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          occupied.add(`${x + dx},${y + dy}`);
        }
      }

      blocks.push({
        id: `b${i}`,
        x,
        y,
        w,
        h,
        arrow,
        color: PALETTE[i % PALETTE.length],
      });
      placed = true;
      break;
    }

    if (!placed) return null;
  }

  return blocks;
}

export function generatePuzzle(): Block[] {
  for (let outer = 0; outer < 50; outer++) {
    const blocks = tryPlaceBlocks();
    if (!blocks) continue;
    const solution = findSolution(blocks);
    if (solution !== null) return blocks;
  }
  // Fallback: guaranteed-solvable minimal puzzle
  return generateFallback();
}

function generateFallback(): Block[] {
  // Simple 4-block puzzle where each block can immediately escape
  return [
    { id: 'b0', x: 0, y: 0, w: 1, h: 1, arrow: 'left', color: PALETTE[0] },
    { id: 'b1', x: 5, y: 1, w: 1, h: 1, arrow: 'right', color: PALETTE[1] },
    { id: 'b2', x: 2, y: 0, w: 1, h: 1, arrow: 'up', color: PALETTE[2] },
    { id: 'b3', x: 3, y: 5, w: 1, h: 1, arrow: 'down', color: PALETTE[3] },
  ];
}
