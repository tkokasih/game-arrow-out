import { Block, Direction, GRID_COLS, GRID_ROWS, MoveResult } from './types';

function buildOccupancy(blocks: Block[], excludeId?: string): Set<string> {
  const occupied = new Set<string>();
  for (const block of blocks) {
    if (block.id === excludeId) continue;
    for (const [dx, dy] of block.cells) {
      occupied.add(`${block.x + dx},${block.y + dy}`);
    }
  }
  return occupied;
}

// Returns absolute [col, row] of the outermost cells facing direction dir.
function leadingEdge(block: Block, dir: Direction, ox = block.x, oy = block.y): [number, number][] {
  const abs = block.cells.map(([dx, dy]): [number, number] => [ox + dx, oy + dy]);
  switch (dir) {
    case 'right': {
      const m = new Map<number, number>();
      for (const [c, r] of abs) if (!m.has(r) || c > m.get(r)!) m.set(r, c);
      return [...m.entries()].map(([r, c]) => [c, r]);
    }
    case 'left': {
      const m = new Map<number, number>();
      for (const [c, r] of abs) if (!m.has(r) || c < m.get(r)!) m.set(r, c);
      return [...m.entries()].map(([r, c]) => [c, r]);
    }
    case 'down': {
      const m = new Map<number, number>();
      for (const [c, r] of abs) if (!m.has(c) || r > m.get(c)!) m.set(c, r);
      return [...m.entries()].map(([c, r]) => [c, r]);
    }
    case 'up': {
      const m = new Map<number, number>();
      for (const [c, r] of abs) if (!m.has(c) || r < m.get(c)!) m.set(c, r);
      return [...m.entries()].map(([c, r]) => [c, r]);
    }
  }
}

export function canEscape(block: Block, allBlocks: Block[]): boolean {
  const occupied = buildOccupancy(allBlocks, block.id);
  const edge = leadingEdge(block, block.arrow);
  const { dx, dy } = dirStep(block.arrow);

  for (const [ec, er] of edge) {
    let c = ec + dx;
    let r = er + dy;
    while (c >= 0 && c < GRID_COLS && r >= 0 && r < GRID_ROWS) {
      if (occupied.has(`${c},${r}`)) return false;
      c += dx;
      r += dy;
    }
  }
  return true;
}

export function slideBlock(block: Block, allBlocks: Block[]): MoveResult {
  if (canEscape(block, allBlocks)) {
    return { escaped: true, newX: block.x, newY: block.y };
  }

  const occupied = buildOccupancy(allBlocks, block.id);
  const { dx, dy } = dirStep(block.arrow);
  const edge = leadingEdge(block, block.arrow);

  let cx = block.x;
  let cy = block.y;

  for (let steps = 1; ; steps++) {
    let stop = false;
    for (const [ec, er] of edge) {
      const nc = ec + dx * steps;
      const nr = er + dy * steps;
      if (nc < 0 || nc >= GRID_COLS || nr < 0 || nr >= GRID_ROWS || occupied.has(`${nc},${nr}`)) {
        stop = true;
        break;
      }
    }
    if (stop) break;
    cx = block.x + dx * steps;
    cy = block.y + dy * steps;
  }

  return { escaped: false, newX: cx, newY: cy };
}

export function findSolution(blocks: Block[]): string[] | null {
  return dfs(blocks);
}

function dfs(remaining: Block[]): string[] | null {
  if (remaining.length === 0) return [];
  for (const block of remaining) {
    if (canEscape(block, remaining)) {
      const rest = remaining.filter((b) => b.id !== block.id);
      const result = dfs(rest);
      if (result !== null) return [block.id, ...result];
    }
  }
  return null;
}

function dirStep(dir: Direction): { dx: number; dy: number } {
  switch (dir) {
    case 'right':
      return { dx: 1, dy: 0 };
    case 'left':
      return { dx: -1, dy: 0 };
    case 'down':
      return { dx: 0, dy: 1 };
    case 'up':
      return { dx: 0, dy: -1 };
  }
}
