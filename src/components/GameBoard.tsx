import { useState } from 'react';
import { Block, CELL_SIZE, GRID_COLS, GRID_ROWS, blockW, blockH } from '../game/types';
import { slideBlock } from '../game/engine';
import { generatePuzzle } from '../game/generator';
import BlockTile from './Block';

interface HistoryEntry {
  blocks: Block[];
  moves: number;
}

function exitPosition(block: Block): { x: number; y: number } {
  switch (block.arrow) {
    case 'right':
      return { x: GRID_COLS, y: block.y };
    case 'left':
      return { x: -blockW(block), y: block.y };
    case 'down':
      return { x: block.x, y: GRID_ROWS };
    case 'up':
      return { x: block.x, y: -blockH(block) };
  }
}

export default function GameBoard() {
  const [blocks, setBlocks] = useState<Block[]>(() => generatePuzzle());
  const [escapingBlocks, setEscapingBlocks] = useState<Block[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [moves, setMoves] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [won, setWon] = useState(false);

  function handleBlockClick(id: string) {
    if (animating || won) return;

    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    const result = slideBlock(block, blocks);

    if (result.escaped) {
      const willWin = blocks.length === 1;
      setHistory((h) => [...h, { blocks, moves }]);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      setMoves((m) => m + 1);
      setAnimating(true);

      // Add the escaping block at its current position, then move it off-board
      // in the next two frames so the CSS transition fires.
      const escaper = { ...block };
      setEscapingBlocks((prev) => [...prev, escaper]);
      const exit = exitPosition(block);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEscapingBlocks((prev) =>
            prev.map((b) => (b.id === id ? { ...b, x: exit.x, y: exit.y } : b))
          );
        });
      });

      setTimeout(() => {
        setEscapingBlocks((prev) => prev.filter((b) => b.id !== id));
        setAnimating(false);
        if (willWin) setWon(true);
      }, 300);
    } else if (result.newX !== block.x || result.newY !== block.y) {
      setHistory((h) => [...h, { blocks, moves }]);
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, x: result.newX, y: result.newY } : b))
      );
      setMoves((m) => m + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 260);
    }
  }

  function handleUndo() {
    if (history.length === 0 || animating) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setBlocks(prev.blocks);
    setMoves(prev.moves);
    setWon(false);
  }

  function handleRestart() {
    setBlocks(generatePuzzle());
    setEscapingBlocks([]);
    setHistory([]);
    setMoves(0);
    setWon(false);
    setAnimating(false);
  }

  const boardWidth = GRID_COLS * CELL_SIZE;
  const boardHeight = GRID_ROWS * CELL_SIZE;

  return (
    <div className="game-root">
      <header className="game-header">
        <h1>Arrow Out</h1>
        <div className="game-stats">Moves: {moves}</div>
      </header>

      <div className="board-wrapper">
        <div className="board" style={{ width: boardWidth, height: boardHeight }}>
          {blocks.map((block) => (
            <BlockTile
              key={block.id}
              block={block}
              animating={animating}
              onClick={handleBlockClick}
            />
          ))}
          {escapingBlocks.map((block) => (
            <BlockTile key={`esc-${block.id}`} block={block} animating={true} onClick={() => {}} />
          ))}
        </div>
      </div>

      <div className="game-controls">
        <button onClick={handleUndo} disabled={history.length === 0 || animating}>
          Undo
        </button>
        <button onClick={handleRestart}>Restart</button>
      </div>

      {won && (
        <div className="win-overlay">
          <div className="win-card">
            <h2>Puzzle Solved!</h2>
            <p>
              {moves} {moves === 1 ? 'move' : 'moves'}
            </p>
            <button onClick={handleRestart}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
