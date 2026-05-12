import { Block, Direction, GRID_COLS, GRID_ROWS, PALETTE } from './types';
import { canEscape } from './engine';

type Shape = readonly [number, number][];

// All shapes normalized so min(dx)=0, min(dy)=0.
// Includes monominos, dominoes, triominoes, and all tetromino rotations.
const SHAPES: Shape[] = [
  // Monomino
  [[0, 0]],

  // Dominoes
  [
    [0, 0],
    [1, 0],
  ],
  [
    [0, 0],
    [0, 1],
  ],

  // Triominoes (I and L in all rotations)
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [0, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [1, 0],
    [0, 1],
    [1, 1],
  ],

  // I-tetromino (2 orientations)
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],

  // O-tetromino
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],

  // T-tetromino (4 rotations)
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ], // T down
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ], // T up
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [0, 2],
  ], // T right
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ], // T left

  // L-tetromino (4 rotations)
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [1, 2],
  ],
  [
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],

  // J-tetromino (4 rotations)
  [
    [1, 0],
    [1, 1],
    [0, 2],
    [1, 2],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],

  // S-tetromino (2 orientations)
  [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],

  // Z-tetromino (2 orientations)
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [0, 2],
  ],
];

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

function rand(n: number): number {
  return Math.floor(Math.random() * n);
}

function hasConflict(x: number, y: number, cells: Shape, occupied: Set<string>): boolean {
  for (const [dx, dy] of cells) if (occupied.has(`${x + dx},${y + dy}`)) return true;
  return false;
}

function markOccupied(x: number, y: number, cells: Shape, occupied: Set<string>): void {
  for (const [dx, dy] of cells) occupied.add(`${x + dx},${y + dy}`);
}

function fitsOnGrid(x: number, y: number, cells: Shape): boolean {
  for (const [dx, dy] of cells) if (x + dx >= GRID_COLS || y + dy >= GRID_ROWS) return false;
  return true;
}

// Reverse-build: each block is placed only when it can currently escape,
// so the puzzle is solvable by removing blocks in reverse placement order.
function buildPuzzle(): Block[] | null {
  const occupied = new Set<string>();
  const blocks: Block[] = [];
  let colorIdx = 0;
  const targetFilled = GRID_COLS * GRID_ROWS - 2 - rand(3); // 32–34 cells

  let consecutiveFails = 0;
  while (consecutiveFails < 40) {
    if (occupied.size >= targetFilled) break;

    const remaining = GRID_COLS * GRID_ROWS - occupied.size;
    let placed = false;

    for (let attempt = 0; attempt < 500; attempt++) {
      // Pick a shape weighted toward smaller ones when the board is tight
      let shape: Shape;
      if (remaining <= 4) {
        shape = SHAPES[rand(3)]; // monomino or domino only
      } else if (remaining <= 8) {
        shape = SHAPES[rand(9)]; // up to triominoes
      } else {
        shape = SHAPES[rand(SHAPES.length)];
      }

      const maxDx = Math.max(...shape.map(([dx]) => dx));
      const maxDy = Math.max(...shape.map(([, dy]) => dy));
      if (maxDx >= GRID_COLS || maxDy >= GRID_ROWS) continue;

      const x = rand(GRID_COLS - maxDx);
      const y = rand(GRID_ROWS - maxDy);
      const arrow = DIRECTIONS[rand(4)];

      if (!fitsOnGrid(x, y, shape)) continue;
      if (hasConflict(x, y, shape, occupied)) continue;

      const candidate: Block = {
        id: `b${blocks.length}`,
        x,
        y,
        cells: shape,
        arrow,
        color: '',
      };
      if (!canEscape(candidate, blocks)) continue;

      markOccupied(x, y, shape, occupied);
      blocks.push({ ...candidate, color: PALETTE[colorIdx++ % PALETTE.length] });
      placed = true;
      consecutiveFails = 0;
      break;
    }

    if (!placed) consecutiveFails++;
  }

  if (occupied.size < 24) return null;
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
    { id: 'b0', x: 0, y: 0, cells: [[0, 0]], arrow: 'left', color: PALETTE[0] },
    { id: 'b1', x: 5, y: 1, cells: [[0, 0]], arrow: 'right', color: PALETTE[1] },
    { id: 'b2', x: 2, y: 0, cells: [[0, 0]], arrow: 'up', color: PALETTE[2] },
    { id: 'b3', x: 3, y: 5, cells: [[0, 0]], arrow: 'down', color: PALETTE[3] },
  ];
}
