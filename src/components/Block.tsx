import { Block, CELL_SIZE, blockW, blockH } from '../game/types';

const ARROW_CHAR: Record<string, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

interface BlockProps {
  block: Block;
  animating: boolean;
  onClick: (id: string) => void;
}

const INSET = 2; // px gap on each side of a cell

export default function BlockTile({ block, animating, onClick }: BlockProps) {
  const w = blockW(block);
  const h = blockH(block);

  // Arrow button centered on the centroid of all cells
  const centX = (block.cells.reduce((s, [dx]) => s + dx + 0.5, 0) / block.cells.length) * CELL_SIZE;
  const centY =
    (block.cells.reduce((s, [, dy]) => s + dy + 0.5, 0) / block.cells.length) * CELL_SIZE;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: block.x * CELL_SIZE,
    top: block.y * CELL_SIZE,
    width: w * CELL_SIZE,
    height: h * CELL_SIZE,
    transition: 'left 250ms ease, top 250ms ease',
    willChange: 'left, top',
  };

  return (
    <div style={containerStyle} className="block">
      {block.cells.map(([dx, dy]) => (
        <div
          key={`${dx},${dy}`}
          style={{
            position: 'absolute',
            left: dx * CELL_SIZE + INSET,
            top: dy * CELL_SIZE + INSET,
            width: CELL_SIZE - INSET * 2,
            height: CELL_SIZE - INSET * 2,
            backgroundColor: block.color,
            borderRadius: 7,
            boxShadow: '0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        />
      ))}
      <button
        className="arrow-btn"
        aria-label={`Move ${block.arrow}`}
        disabled={animating}
        onClick={() => onClick(block.id)}
        style={{
          position: 'absolute',
          left: Math.round(centX - 19),
          top: Math.round(centY - 19),
          zIndex: 1,
        }}
      >
        {ARROW_CHAR[block.arrow]}
      </button>
    </div>
  );
}
