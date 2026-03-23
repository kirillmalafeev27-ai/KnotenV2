export interface CellCoord {
  r: number;
  c: number;
}

export interface LineDef {
  color: string;
  cells: CellCoord[];
  tokens: string[];
  sentence: string;
}

export interface Level {
  id: number;
  ref: string;
  title: string;
  subtitle: string;
  rows: number;
  cols: number;
  lines: LineDef[];
  grammarTopic: string;
  vocabTopic: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
}

export function validateLevel(level: Pick<Level, 'rows' | 'cols' | 'lines'>): string[] {
  const errors: string[] = [];
  const totalCells = level.rows * level.cols;
  const usedCells = new Set<string>();
  let cellCount = 0;

  for (const line of level.lines) {
    if (line.tokens.length !== line.cells.length) {
      errors.push(`Linie ${line.color}: Tokenanzahl (${line.tokens.length}) ≠ Zellenanzahl (${line.cells.length})`);
    }
    for (let i = 0; i < line.cells.length; i++) {
      const cell = line.cells[i];
      const key = `${cell.r},${cell.c}`;
      if (cell.r < 0 || cell.r >= level.rows || cell.c < 0 || cell.c >= level.cols) {
        errors.push(`Linie ${line.color}: Zelle (${cell.r},${cell.c}) außerhalb des Feldes`);
      }
      if (usedCells.has(key)) {
        errors.push(`Linie ${line.color}: Zelle (${cell.r},${cell.c}) bereits belegt`);
      }
      usedCells.add(key);
      cellCount++;
      if (i > 0) {
        const prev = line.cells[i - 1];
        const dr = Math.abs(cell.r - prev.r);
        const dc = Math.abs(cell.c - prev.c);
        if (dr + dc !== 1) {
          errors.push(`Linie ${line.color}: (${prev.r},${prev.c})→(${cell.r},${cell.c}) nicht orthogonal benachbart`);
        }
      }
    }
  }
  if (cellCount !== totalCells) {
    errors.push(`Zellen gesamt (${cellCount}) ≠ Feldgröße (${totalCells})`);
  }
  return errors;
}
