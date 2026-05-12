import { Block, Direction, GRID_COLS, GRID_ROWS, PALETTE } from './types';
import { canEscape } from './engine';

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

function rand(n: number): number {
  return Math.floor(Math.random() * n);
}

function hasConflict(x: number, y: number, w: number, h: number, occupied: Set<string>): boolean {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++) if (occupied.has(`${x + dx},${y + dy}`)) return true;
  return false;
}

function markOccupied(x: number, y: number, w: number, h: number, occupied: Set<string>): void {
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) occupied.add(`${x + dx},${y + dy}`);
}

// Reverse-build algorithm: each block is placed only when it can *currently*
// escape from the grid. Solvability is guaranteed by construction — the
// removal order is the reverse of the placement order, and removing earlier
// blocks never blocks later ones (it can only clear space).
function buildPuzzle(): Block[] | null {
  const occupied = new Set<string>();
  const blocks: Block[] = [];
  let colorIdx = 0;
  const targetFilled = GRID_COLS * GRID_ROWS - 2 - rand(3); // 32–34 cells filled

  let consecutiveFails = 0;
  while (consecutiveFails < 40) {
    if (occupied.size >= targetFilled) break;

    const remaining = GRID_COLS * GRID_ROWS - occupied.size;
    let placed = false;

    for (let attempt = 0; attempt < 400; attempt++) {
      // Bias heavily toward 1×1 to fill tight spaces; allow 1×2 / 2×1 for variety
      let w: number, h: number;
      if (remaining <= 3) {
        w = 1;
        h = 1;
      } else {
        const r = rand(10);
        if (r < 6) {
          w = 1;
          h = 1;
        } else if (r < 8) {
          w = 2;
          h = 1;
        } else {
          w = 1;
          h = 2;
        }
      }

      if (w > GRID_COLS || h > GRID_ROWS) continue;
      const x = rand(GRID_COLS - w + 1);
      const y = rand(GRID_ROWS - h + 1);
      const arrow = DIRECTIONS[rand(4)];

      if (hasConflict(x, y, w, h, occupied)) continue;

      // Key constraint: block must be able to escape RIGHT NOW with existing
      // blocks present. This is the condition that guarantees solvability.
      const candidate: Block = {
        id: `b${blocks.length}`,
        x,
        y,
        w,
        h,
        arrow,
        color: '',
      };
      if (!canEscape(candidate, blocks)) continue;

      markOccupied(x, y, w, h, occupied);
      blocks.push({ ...candidate, color: PALETTE[colorIdx++ % PALETTE.length] });
      placed = true;
      consecutiveFails = 0;
      break;
    }

    if (!placed) consecutiveFails++;
  }

  if (occupied.size < 28) return null;
  return blocks;
}

export function generatePuzzle(): Block[] {
  for (let attempt = 0; attempt < 20; attempt++) {
    const result = buildPuzzle();
    if (result) return result;
  }
  return generateFallback();
}

function generateFallback(): Block[] {
  return [
    { id: 'b0', x: 0, y: 0, w: 1, h: 1, arrow: 'left', color: PALETTE[0] },
    { id: 'b1', x: 5, y: 1, w: 1, h: 1, arrow: 'right', color: PALETTE[1] },
    { id: 'b2', x: 2, y: 0, w: 1, h: 1, arrow: 'up', color: PALETTE[2] },
    { id: 'b3', x: 3, y: 5, w: 1, h: 1, arrow: 'down', color: PALETTE[3] },
  ];
}
