import type { Level } from '../types/game';

// Helper to create an empty word grid
function createWordGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(''));
}

// Tutorial Level - Simple 5x5 grid
// Sentence: "Ich lerne gerne Deutsch hier"
// Path goes in an obvious L-shape
const tutorialGrid = createWordGrid(5, 5);
// Correct path words
tutorialGrid[0][0] = 'Ich';
tutorialGrid[1][0] = 'lerne';
tutorialGrid[2][0] = 'gerne';
tutorialGrid[2][1] = 'Deutsch';
tutorialGrid[2][2] = 'hier';
// Distractors
tutorialGrid[0][1] = 'du';
tutorialGrid[0][2] = 'wir';
tutorialGrid[0][3] = 'sie';
tutorialGrid[0][4] = 'er';
tutorialGrid[1][1] = 'spiele';
tutorialGrid[1][2] = 'esse';
tutorialGrid[1][3] = 'trinke';
tutorialGrid[1][4] = 'schlafe';
tutorialGrid[2][3] = 'morgen';
tutorialGrid[2][4] = 'heute';
tutorialGrid[3][0] = 'schnell';
tutorialGrid[3][1] = 'langsam';
tutorialGrid[3][2] = 'gut';
tutorialGrid[3][3] = 'schlecht';
tutorialGrid[3][4] = 'oft';
tutorialGrid[4][0] = 'Haus';
tutorialGrid[4][1] = 'Schule';
tutorialGrid[4][2] = 'Arbeit';
tutorialGrid[4][3] = 'Stadt';
tutorialGrid[4][4] = 'Park';

const tutorial: Level = {
  id: 0,
  title: 'Tutorial',
  subtitle: 'Verbinde die Punkte zum Satz',
  gridRows: 5,
  gridCols: 5,
  dots: [
    { row: 0, col: 0, color: '#A855F7' }, // start
    { row: 2, col: 2, color: '#A855F7' }, // end
  ],
  wordGrid: tutorialGrid,
  correctPath: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  sentence: 'Ich lerne gerne Deutsch hier',
  translation: 'I like learning German here',
  isTutorial: true,
};

// Level 1 (based on Level 64 pattern - 6 cols x 10 rows)
// Sentence: "Der Hund läuft schnell durch den Park heute"
// 8 words, path through grid
const level1Grid = createWordGrid(10, 6);
// Correct path
level1Grid[1][1] = 'Der';
level1Grid[1][2] = 'Hund';
level1Grid[1][3] = 'läuft';
level1Grid[1][4] = 'schnell';
level1Grid[2][4] = 'durch';
level1Grid[3][4] = 'den';
level1Grid[4][4] = 'Park';
level1Grid[5][4] = 'heute';
// Distractors
level1Grid[0][0] = 'Die'; level1Grid[0][1] = 'Ein'; level1Grid[0][2] = 'Mein';
level1Grid[0][3] = 'Sein'; level1Grid[0][4] = 'Ihr'; level1Grid[0][5] = 'Unser';
level1Grid[1][0] = 'Katze'; level1Grid[1][5] = 'rennt';
level1Grid[2][0] = 'über'; level1Grid[2][1] = 'neben'; level1Grid[2][2] = 'Vogel';
level1Grid[2][3] = 'unter'; level1Grid[2][5] = 'am';
level1Grid[3][0] = 'fliegt'; level1Grid[3][1] = 'springt'; level1Grid[3][2] = 'das';
level1Grid[3][3] = 'die'; level1Grid[3][5] = 'ein';
level1Grid[4][0] = 'Garten'; level1Grid[4][1] = 'Wald'; level1Grid[4][2] = 'See';
level1Grid[4][3] = 'Berg'; level1Grid[4][5] = 'Feld';
level1Grid[5][0] = 'morgen'; level1Grid[5][1] = 'gestern'; level1Grid[5][2] = 'jetzt';
level1Grid[5][3] = 'bald'; level1Grid[5][5] = 'immer';
level1Grid[6][0] = 'und'; level1Grid[6][1] = 'oder'; level1Grid[6][2] = 'aber';
level1Grid[6][3] = 'weil'; level1Grid[6][4] = 'wenn'; level1Grid[6][5] = 'dass';
level1Grid[7][0] = 'groß'; level1Grid[7][1] = 'klein'; level1Grid[7][2] = 'alt';
level1Grid[7][3] = 'neu'; level1Grid[7][4] = 'schön'; level1Grid[7][5] = 'lang';
level1Grid[8][0] = 'hier'; level1Grid[8][1] = 'dort'; level1Grid[8][2] = 'oben';
level1Grid[8][3] = 'unten'; level1Grid[8][4] = 'links'; level1Grid[8][5] = 'rechts';
level1Grid[9][0] = 'ja'; level1Grid[9][1] = 'nein'; level1Grid[9][2] = 'vielleicht';
level1Grid[9][3] = 'sicher'; level1Grid[9][4] = 'leider'; level1Grid[9][5] = 'gern';

const level1: Level = {
  id: 1,
  title: 'Level 1',
  subtitle: 'Im Park',
  gridRows: 10,
  gridCols: 6,
  dots: [
    { row: 1, col: 1, color: '#A855F7' }, // start - purple
    { row: 1, col: 2, color: '#EF4444' }, // red
    { row: 1, col: 3, color: '#22C55E' }, // green
    { row: 1, col: 4, color: '#3B82F6' }, // blue
    { row: 5, col: 4, color: '#A855F7' }, // end - purple
  ],
  wordGrid: level1Grid,
  correctPath: [[1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4]],
  sentence: 'Der Hund läuft schnell durch den Park heute',
  translation: 'The dog runs fast through the park today',
};

// Level 2 (based on Level 65 pattern - 5 cols x 8 rows)
// Sentence: "Heute gehen wir zusammen ins Kino"
const level2Grid = createWordGrid(8, 5);
// Correct path - zigzag pattern
level2Grid[1][3] = 'Heute';
level2Grid[2][3] = 'gehen';
level2Grid[2][2] = 'wir';
level2Grid[2][1] = 'zusammen';
level2Grid[3][1] = 'ins';
level2Grid[4][1] = 'Kino';
// Distractors
level2Grid[0][0] = 'Morgen'; level2Grid[0][1] = 'Gestern'; level2Grid[0][2] = 'Jetzt';
level2Grid[0][3] = 'Bald'; level2Grid[0][4] = 'Dann';
level2Grid[1][0] = 'fahren'; level2Grid[1][1] = 'laufen'; level2Grid[1][2] = 'kommen';
level2Grid[1][4] = 'sehen';
level2Grid[2][0] = 'sie'; level2Grid[2][4] = 'ihr';
level2Grid[3][0] = 'allein'; level2Grid[3][2] = 'zum'; level2Grid[3][3] = 'nach';
level2Grid[3][4] = 'bei';
level2Grid[4][0] = 'Theater'; level2Grid[4][2] = 'Museum'; level2Grid[4][3] = 'Konzert';
level2Grid[4][4] = 'Markt';
level2Grid[5][0] = 'Abend'; level2Grid[5][1] = 'Nacht'; level2Grid[5][2] = 'Tag';
level2Grid[5][3] = 'Woche'; level2Grid[5][4] = 'Monat';
level2Grid[6][0] = 'schön'; level2Grid[6][1] = 'toll'; level2Grid[6][2] = 'super';
level2Grid[6][3] = 'prima'; level2Grid[6][4] = 'nett';
level2Grid[7][0] = 'auch'; level2Grid[7][1] = 'noch'; level2Grid[7][2] = 'schon';
level2Grid[7][3] = 'erst'; level2Grid[7][4] = 'nur';

const level2: Level = {
  id: 2,
  title: 'Level 2',
  subtitle: 'Ins Kino',
  gridRows: 8,
  gridCols: 5,
  dots: [
    { row: 1, col: 3, color: '#EF4444' }, // start - red
    { row: 4, col: 1, color: '#EF4444' }, // end - red
  ],
  wordGrid: level2Grid,
  correctPath: [[1, 3], [2, 3], [2, 2], [2, 1], [3, 1], [4, 1]],
  sentence: 'Heute gehen wir zusammen ins Kino',
  translation: 'Today we go to the cinema together',
};

// Level 3 (based on Level 66 pattern - 7 cols x 10 rows)
// Sentence: "Die Kinder spielen jeden Tag draußen im Garten"
const level3Grid = createWordGrid(10, 7);
// Correct path - complex path
level3Grid[0][0] = 'Die';
level3Grid[0][1] = 'Kinder';
level3Grid[1][1] = 'spielen';
level3Grid[2][1] = 'jeden';
level3Grid[3][1] = 'Tag';
level3Grid[3][2] = 'draußen';
level3Grid[3][3] = 'im';
level3Grid[4][3] = 'Garten';
// Distractors
level3Grid[0][2] = 'Leute'; level3Grid[0][3] = 'Frauen'; level3Grid[0][4] = 'Männer';
level3Grid[0][5] = 'Eltern'; level3Grid[0][6] = 'Freunde';
level3Grid[1][0] = 'lernen'; level3Grid[1][2] = 'singen'; level3Grid[1][3] = 'tanzen';
level3Grid[1][4] = 'lesen'; level3Grid[1][5] = 'kochen'; level3Grid[1][6] = 'malen';
level3Grid[2][0] = 'jede'; level3Grid[2][2] = 'alle'; level3Grid[2][3] = 'manche';
level3Grid[2][4] = 'einige'; level3Grid[2][5] = 'viele'; level3Grid[2][6] = 'wenige';
level3Grid[3][0] = 'Nacht'; level3Grid[3][4] = 'drinnen'; level3Grid[3][5] = 'oben';
level3Grid[3][6] = 'unten';
level3Grid[4][0] = 'Haus'; level3Grid[4][1] = 'Zimmer'; level3Grid[4][2] = 'Küche';
level3Grid[4][4] = 'Hof'; level3Grid[4][5] = 'Balkon'; level3Grid[4][6] = 'Straße';
level3Grid[5][0] = 'mit'; level3Grid[5][1] = 'ohne'; level3Grid[5][2] = 'für';
level3Grid[5][3] = 'gegen'; level3Grid[5][4] = 'über'; level3Grid[5][5] = 'unter';
level3Grid[5][6] = 'zwischen';
level3Grid[6][0] = 'dem'; level3Grid[6][1] = 'der'; level3Grid[6][2] = 'des';
level3Grid[6][3] = 'den'; level3Grid[6][4] = 'einem'; level3Grid[6][5] = 'einer';
level3Grid[6][6] = 'eines';
level3Grid[7][0] = 'Ball'; level3Grid[7][1] = 'Hund'; level3Grid[7][2] = 'Buch';
level3Grid[7][3] = 'Spiel'; level3Grid[7][4] = 'Bild'; level3Grid[7][5] = 'Lied';
level3Grid[7][6] = 'Auto';
level3Grid[8][0] = 'rot'; level3Grid[8][1] = 'blau'; level3Grid[8][2] = 'grün';
level3Grid[8][3] = 'gelb'; level3Grid[8][4] = 'weiß'; level3Grid[8][5] = 'schwarz';
level3Grid[8][6] = 'braun';
level3Grid[9][0] = 'eins'; level3Grid[9][1] = 'zwei'; level3Grid[9][2] = 'drei';
level3Grid[9][3] = 'vier'; level3Grid[9][4] = 'fünf'; level3Grid[9][5] = 'sechs';
level3Grid[9][6] = 'sieben';

const level3: Level = {
  id: 3,
  title: 'Level 3',
  subtitle: 'Im Garten',
  gridRows: 10,
  gridCols: 7,
  dots: [
    { row: 0, col: 0, color: '#A855F7' }, // start - purple
    { row: 0, col: 1, color: '#F97316' }, // orange
    { row: 4, col: 3, color: '#A855F7' }, // end - purple
  ],
  wordGrid: level3Grid,
  correctPath: [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [4, 3]],
  sentence: 'Die Kinder spielen jeden Tag draußen im Garten',
  translation: 'The children play outside in the garden every day',
};

// Level 4 (based on Level 70 pattern - 6 cols x 10 rows)
// Sentence: "Am Morgen trinke ich immer starken Kaffee gern"
const level4Grid = createWordGrid(10, 6);
// Correct path - diagonal-ish
level4Grid[0][0] = 'Am';
level4Grid[1][1] = 'Morgen';
level4Grid[2][1] = 'trinke';
level4Grid[3][1] = 'ich';
level4Grid[4][1] = 'immer';
level4Grid[5][1] = 'starken';
level4Grid[5][2] = 'Kaffee';
level4Grid[5][3] = 'gern';
// Distractors
level4Grid[0][1] = 'Im'; level4Grid[0][2] = 'Zum'; level4Grid[0][3] = 'Vom';
level4Grid[0][4] = 'Beim'; level4Grid[0][5] = 'Nach';
level4Grid[1][0] = 'Abend'; level4Grid[1][2] = 'Mittag'; level4Grid[1][3] = 'Nachmittag';
level4Grid[1][4] = 'Frühstück'; level4Grid[1][5] = 'Pause';
level4Grid[2][0] = 'esse'; level4Grid[2][2] = 'lese'; level4Grid[2][3] = 'höre';
level4Grid[2][4] = 'sehe'; level4Grid[2][5] = 'schreibe';
level4Grid[3][0] = 'du'; level4Grid[3][2] = 'er'; level4Grid[3][3] = 'sie';
level4Grid[3][4] = 'wir'; level4Grid[3][5] = 'ihr';
level4Grid[4][0] = 'nie'; level4Grid[4][2] = 'manchmal'; level4Grid[4][3] = 'selten';
level4Grid[4][4] = 'oft'; level4Grid[4][5] = 'täglich';
level4Grid[5][0] = 'heißen'; level4Grid[5][4] = 'kalten'; level4Grid[5][5] = 'süßen';
level4Grid[6][0] = 'Tee'; level4Grid[6][1] = 'Saft'; level4Grid[6][2] = 'Milch';
level4Grid[6][3] = 'Wasser'; level4Grid[6][4] = 'Brot'; level4Grid[6][5] = 'Käse';
level4Grid[7][0] = 'nicht'; level4Grid[7][1] = 'sehr'; level4Grid[7][2] = 'so';
level4Grid[7][3] = 'zu'; level4Grid[7][4] = 'recht'; level4Grid[7][5] = 'wohl';
level4Grid[8][0] = 'schnell'; level4Grid[8][1] = 'ruhig'; level4Grid[8][2] = 'laut';
level4Grid[8][3] = 'leise'; level4Grid[8][4] = 'früh'; level4Grid[8][5] = 'spät';
level4Grid[9][0] = 'dann'; level4Grid[9][1] = 'also'; level4Grid[9][2] = 'doch';
level4Grid[9][3] = 'wohl'; level4Grid[9][4] = 'eben'; level4Grid[9][5] = 'halt';

const level4: Level = {
  id: 4,
  title: 'Level 4',
  subtitle: 'Morgenroutine',
  gridRows: 10,
  gridCols: 6,
  dots: [
    { row: 0, col: 0, color: '#FACC15' }, // start - yellow
    { row: 5, col: 3, color: '#FACC15' }, // end - yellow
  ],
  wordGrid: level4Grid,
  correctPath: [[0, 0], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [5, 2], [5, 3]],
  sentence: 'Am Morgen trinke ich immer starken Kaffee gern',
  translation: 'In the morning I always like to drink strong coffee',
};

export const levels: Level[] = [tutorial, level1, level2, level3, level4];
