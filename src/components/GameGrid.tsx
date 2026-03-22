import { useState, useRef, useCallback, useEffect } from 'react';
import type { Level } from '../types/game';
import { useTTS } from '../hooks/useTTS';

interface GameGridProps {
  level: Level;
  onComplete: (success: boolean) => void;
  logEvent?: (levelId: number, eventType: 'start' | 'attempt' | 'listen', data?: {
    pathCoords?: [number, number][];
    wordsHeard?: string[];
    sentenceFormed?: string;
    isCorrect?: boolean;
  }) => void;
}

export default function GameGrid({ level, onComplete, logEvent }: GameGridProps) {
  const [path, setPath] = useState<[number, number][]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showResult, setShowResult] = useState<'success' | 'fail' | null>(null);
  const [spokenWords, setSpokenWords] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpokenPathRef = useRef<string>('');
  const { speak, stop } = useTTS();

  // Reset when level changes
  useEffect(() => {
    setPath([]);
    setIsDragging(false);
    setCompleted(false);
    setShowResult(null);
    setSpokenWords([]);
    lastSpokenPathRef.current = '';
  }, [level.id]);

  const getCellFromPoint = useCallback((clientX: number, clientY: number): [number, number] | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const cellWidth = rect.width / level.gridCols;
    const cellHeight = rect.height / level.gridRows;
    const col = Math.floor((clientX - rect.left) / cellWidth);
    const row = Math.floor((clientY - rect.top) / cellHeight);
    if (row < 0 || row >= level.gridRows || col < 0 || col >= level.gridCols) return null;
    return [row, col];
  }, [level.gridCols, level.gridRows]);

  const isAdjacent = (a: [number, number], b: [number, number]) => {
    const dr = Math.abs(a[0] - b[0]);
    const dc = Math.abs(a[1] - b[1]);
    // Allow orthogonal and diagonal moves
    return (dr <= 1 && dc <= 1) && !(dr === 0 && dc === 0);
  };

  const getWordsFromPath = useCallback((p: [number, number][]) => {
    return p
      .map(([r, c]) => level.wordGrid[r]?.[c] || '')
      .filter(w => w !== '');
  }, [level.wordGrid]);

  // Speak words when user holds for 2 seconds
  const scheduleSpeech = useCallback((currentPath: [number, number][]) => {
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
    }
    speakTimerRef.current = setTimeout(() => {
      const words = getWordsFromPath(currentPath);
      const pathKey = currentPath.map(([r, c]) => `${r},${c}`).join('|');
      if (words.length > 0 && pathKey !== lastSpokenPathRef.current) {
        lastSpokenPathRef.current = pathKey;
        const text = words.join(' ');
        setSpokenWords(words);
        speak(text);
      }
    }, 2000);
  }, [getWordsFromPath, speak]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (completed) return;
    e.preventDefault();
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;

    stop();
    lastSpokenPathRef.current = '';
    setSpokenWords([]);
    setShowResult(null);
    const newPath: [number, number][] = [cell];
    setPath(newPath);
    setIsDragging(true);
    scheduleSpeech(newPath);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [completed, getCellFromPoint, stop, scheduleSpeech]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || completed) return;
    e.preventDefault();
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;

    setPath(prev => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      // Same cell
      if (last[0] === cell[0] && last[1] === cell[1]) return prev;
      // Check if going back (undo last move)
      if (prev.length >= 2) {
        const secondLast = prev[prev.length - 2];
        if (secondLast[0] === cell[0] && secondLast[1] === cell[1]) {
          const newPath = prev.slice(0, -1);
          scheduleSpeech(newPath);
          return newPath;
        }
      }
      // Must be adjacent
      if (!isAdjacent(last, cell)) return prev;
      // No revisiting
      if (prev.some(([r, c]) => r === cell[0] && c === cell[1])) return prev;
      const newPath = [...prev, cell];
      scheduleSpeech(newPath);
      return newPath;
    });
  }, [isDragging, completed, getCellFromPoint, scheduleSpeech]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
    }

    // Check if path matches correct path
    const correct = level.correctPath;
    const isCorrect =
      path.length === correct.length &&
      path.every(([r, c], i) => correct[i][0] === r && correct[i][1] === c);

    const words = getWordsFromPath(path);
    const sentence = words.join(' ');

    if (isCorrect) {
      setCompleted(true);
      setShowResult('success');
      speak(level.sentence);
      logEvent?.(level.id, 'attempt', { pathCoords: path, wordsHeard: words, sentenceFormed: sentence, isCorrect: true });
      setTimeout(() => onComplete(true), 3000);
    } else if (path.length > 0) {
      setShowResult('fail');
      logEvent?.(level.id, 'attempt', { pathCoords: path, wordsHeard: words, sentenceFormed: sentence, isCorrect: false });
      if (words.length > 0) {
        speak(sentence);
      }
    }
  }, [isDragging, path, level.correctPath, level.sentence, level.id, speak, onComplete, getWordsFromPath, logEvent]);

  const reset = () => {
    setPath([]);
    setCompleted(false);
    setShowResult(null);
    setSpokenWords([]);
    lastSpokenPathRef.current = '';
    stop();
  };

  const isDotCell = (row: number, col: number) => {
    return level.dots.find(d => d.row === row && d.col === col);
  };

  const isInPath = (row: number, col: number) => {
    return path.some(([r, c]) => r === row && c === col);
  };

  const getPathIndex = (row: number, col: number) => {
    return path.findIndex(([r, c]) => r === row && c === col);
  };

  // Get line segments for SVG
  const getLineSegments = () => {
    if (path.length < 2) return [];
    const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const [r1, c1] = path[i];
      const [r2, c2] = path[i + 1];
      segments.push({
        x1: (c1 + 0.5) / level.gridCols * 100,
        y1: (r1 + 0.5) / level.gridRows * 100,
        x2: (c2 + 0.5) / level.gridCols * 100,
        y2: (r2 + 0.5) / level.gridRows * 100,
      });
    }
    return segments;
  };

  const pathColor = showResult === 'success' ? '#22C55E' : showResult === 'fail' ? '#EF4444' : '#A855F7';

  return (
    <div className="game-grid-container">
      {/* Spoken words display */}
      {spokenWords.length > 0 && (
        <div className="spoken-words">
          <span className="spoken-icon">🔊</span>
          {spokenWords.map((w, i) => (
            <span key={i} className="spoken-word">{w}</span>
          ))}
        </div>
      )}

      {/* Tutorial hint */}
      {level.isTutorial && !completed && path.length === 0 && (
        <div className="tutorial-hint">
          Ziehe eine Linie von Punkt zu Punkt.<br />
          Halte 2 Sekunden um die Wörter zu hören.<br />
          Finde den richtigen Satz!
        </div>
      )}

      <div
        ref={gridRef}
        className="game-grid"
        style={{
          gridTemplateColumns: `repeat(${level.gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${level.gridRows}, 1fr)`,
          aspectRatio: `${level.gridCols} / ${level.gridRows}`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* SVG overlay for path lines */}
        <svg className="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {getLineSegments().map((seg, i) => (
            <line
              key={i}
              x1={`${seg.x1}%`}
              y1={`${seg.y1}%`}
              x2={`${seg.x2}%`}
              y2={`${seg.y2}%`}
              stroke={pathColor}
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Grid cells */}
        {Array.from({ length: level.gridRows }).map((_, row) =>
          Array.from({ length: level.gridCols }).map((_, col) => {
            const dot = isDotCell(row, col);
            const inPath = isInPath(row, col);
            const pathIdx = getPathIndex(row, col);
            const word = level.wordGrid[row]?.[col];
            const isCorrectCell = level.correctPath.some(([r, c]) => r === row && c === col);

            return (
              <div
                key={`${row}-${col}`}
                className={`grid-cell ${inPath ? 'in-path' : ''} ${
                  showResult === 'success' && isCorrectCell ? 'correct' : ''
                }`}
              >
                {dot && (
                  <div
                    className="dot-marker"
                    style={{ backgroundColor: dot.color }}
                  />
                )}
                {inPath && !dot && (
                  <div
                    className="path-dot"
                    style={{ backgroundColor: pathColor }}
                  />
                )}
                {/* Show word only when completed successfully and cell is on correct path */}
                {showResult === 'success' && isCorrectCell && word && (
                  <div className="revealed-word">{word}</div>
                )}
                {/* Show path order number during drag */}
                {inPath && pathIdx >= 0 && !showResult && (
                  <div className="path-number">{pathIdx + 1}</div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Result feedback */}
      {showResult && (
        <div className={`result-banner ${showResult}`}>
          {showResult === 'success' ? (
            <>
              <div className="result-title">Richtig! ✓</div>
              <div className="result-sentence">{level.sentence}</div>
              <div className="result-translation">{level.translation}</div>
            </>
          ) : (
            <>
              <div className="result-title">Versuche es nochmal</div>
              <button className="retry-btn" onClick={reset}>
                Nochmal
              </button>
            </>
          )}
        </div>
      )}

      {/* Listen button */}
      {!isDragging && path.length > 0 && !showResult && (
        <button
          className="listen-btn"
          onClick={() => {
            const words = getWordsFromPath(path);
            if (words.length > 0) {
              setSpokenWords(words);
              speak(words.join(' '));
              logEvent?.(level.id, 'listen', { pathCoords: path, wordsHeard: words });
            }
          }}
        >
          🔊 Anhören
        </button>
      )}
    </div>
  );
}
