export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Block {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
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
