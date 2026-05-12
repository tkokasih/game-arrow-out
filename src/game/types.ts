export type Direction = 'up' | 'down' | 'left' | 'right';

// cells: relative [dx, dy] offsets from the block's origin (x, y), all >= 0
export interface Block {
  id: string;
  x: number;
  y: number;
  cells: readonly [number, number][];
  arrow: Direction;
  color: string;
}

export interface MoveResult {
  escaped: boolean;
  newX: number;
  newY: number;
}

export const GRID_COLS = 6;
export const GRID_ROWS = 6;
export const CELL_SIZE = 52;

export function blockW(block: Pick<Block, 'cells'>): number {
  return Math.max(...block.cells.map(([dx]) => dx)) + 1;
}

export function blockH(block: Pick<Block, 'cells'>): number {
  return Math.max(...block.cells.map(([, dy]) => dy)) + 1;
}

export const PALETTE: string[] = [
  '#f87171',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#60a5fa',
  '#c084fc',
  '#f472b6',
  '#2dd4bf',
];
