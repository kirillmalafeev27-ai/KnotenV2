export interface Cell {
  row: number;
  col: number;
  word: string; // hidden German word
}

export interface DotMarker {
  row: number;
  col: number;
  color: string;
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  gridRows: number;
  gridCols: number;
  dots: DotMarker[]; // visible dots on the grid
  wordGrid: string[][]; // wordGrid[row][col] = German word
  correctPath: [number, number][]; // sequence of [row, col] forming the correct sentence
  sentence: string; // the full correct sentence
  translation: string; // English/Russian translation for feedback
  isTutorial?: boolean;
}
