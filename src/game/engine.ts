import { Block, Direction, GRID_COLS, GRID_ROWS, MoveResult } from './types';

function buildOccupancy(blocks: Block[], excludeId?: string): Set<string> {
  const occupied = new Set<string>();
  for (const block of blocks) {
    if (block.id === excludeId) continue;
    for (let dy = 0; dy < block.h; dy++) {
      for (let dx = 0; dx < block.w; dx++) {
        occupied.add(`${block.x + dx},${block.y + dy}`);
      }
    }
  }
  return occupied;
}

function corridorClear(occupied: Set<string>, cols: number[], rows: number[]): boolean {
  for (const c of cols) {
    for (const r of rows) {
      if (occupied.has(`${c},${r}`)) return false;
    }
  }
  return true;
}

export function canEscape(block: Block, allBlocks: Block[]): boolean {
  const occupied = buildOccupancy(allBlocks, block.id);
  const { x, y, w, h, arrow } = block;
  const rowRange = range(y, y + h);
  const colRange = range(x, x + w);

  switch (arrow) {
    case 'right':
      return corridorClear(occupied, range(x + w, GRID_COLS), rowRange);
    case 'left':
      return corridorClear(occupied, range(0, x), rowRange);
    case 'down':
      return corridorClear(occupied, colRange, range(y + h, GRID_ROWS));
    case 'up':
      return corridorClear(occupied, colRange, range(0, y));
  }
}

export function slideBlock(block: Block, allBlocks: Block[]): MoveResult {
  if (canEscape(block, allBlocks)) {
    return { escaped: true, newX: block.x, newY: block.y };
  }

  const occupied = buildOccupancy(allBlocks, block.id);
  const { x, y, w, h, arrow } = block;
  const step = dirStep(arrow);

  let cx = x;
  let cy = y;

  while (true) {
    const nx = cx + step.dx;
    const ny = cy + step.dy;

    if (nx < 0 || ny < 0 || nx + w > GRID_COLS || ny + h > GRID_ROWS) break;

    // Check leading edge cells at the new position
    let blocked = false;
    if (step.dx === 1) {
      // moving right: check column nx+w-1
      for (let r = ny; r < ny + h; r++) {
        if (occupied.has(`${nx + w - 1},${r}`)) {
          blocked = true;
          break;
        }
      }
    } else if (step.dx === -1) {
      // moving left: check column nx
      for (let r = ny; r < ny + h; r++) {
        if (occupied.has(`${nx},${r}`)) {
          blocked = true;
          break;
        }
      }
    } else if (step.dy === 1) {
      // moving down: check row ny+h-1
      for (let c = nx; c < nx + w; c++) {
        if (occupied.has(`${c},${ny + h - 1}`)) {
          blocked = true;
          break;
        }
      }
    } else {
      // moving up: check row ny
      for (let c = nx; c < nx + w; c++) {
        if (occupied.has(`${c},${ny}`)) {
          blocked = true;
          break;
        }
      }
    }

    if (blocked) break;
    cx = nx;
    cy = ny;
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

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i < end; i++) out.push(i);
  return out;
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
