import { Block, CELL_SIZE } from '../game/types';

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

const GAP = 3;

export default function BlockTile({ block, animating, onClick }: BlockProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: block.x * CELL_SIZE + GAP,
    top: block.y * CELL_SIZE + GAP,
    width: block.w * CELL_SIZE - GAP * 2,
    height: block.h * CELL_SIZE - GAP * 2,
    backgroundColor: block.color,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'left 250ms ease, top 250ms ease',
    boxShadow: '0 3px 8px rgba(0,0,0,0.35)',
    userSelect: 'none',
  };

  return (
    <div style={style} className="block">
      <button
        className="arrow-btn"
        aria-label={`Move ${block.arrow}`}
        disabled={animating}
        onClick={() => onClick(block.id)}
      >
        {ARROW_CHAR[block.arrow]}
      </button>
    </div>
  );
}
