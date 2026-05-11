import { useState } from 'react';
import { Block, CELL_SIZE, GRID_COLS, GRID_ROWS } from '../game/types';
import { slideBlock } from '../game/engine';
import { generatePuzzle } from '../game/generator';
import BlockTile from './Block';

interface HistoryEntry {
  blocks: Block[];
  moves: number;
}

export default function GameBoard() {
  const [blocks, setBlocks] = useState<Block[]>(() => generatePuzzle());
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
      if (willWin) setWon(true);
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
