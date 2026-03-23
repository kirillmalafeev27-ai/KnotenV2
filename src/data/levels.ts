import type { Level, CellCoord } from '../types/game';

const COL = {
  R: '#FF3A5C',
  G: '#00E5A0',
  B: '#4D9EFF',
  Y: '#FFD040',
  P: '#A855F7',
  O: '#FF6B30',
  C: '#59F0FF',
  W: '#FF3D87',
};

function p(coords: [number, number][]): CellCoord[] {
  return coords.map(([r, c]) => ({ r, c }));
}

export const levels: Level[] = [
  // ── Level 01 (ref 83, 10×6, 5 lines) ──
  {
    id: 1, ref: '83',
    title: 'Level 01', subtitle: 'Begrüßung',
    rows: 10, cols: 6,
    grammarTopic: 'Praesens', vocabTopic: 'Begrüßung', difficulty: 'A1',
    lines: [
      {
        color: COL.G,
        cells: p([[1,2],[1,1],[2,1],[3,1],[4,1],[5,1],[5,2],[6,2],[7,2],[7,3]]),
        tokens: ['Guten','Morgen,','ich','heiße','Anna','und','ich','komme','aus','Berlin.'],
        sentence: 'Guten Morgen, ich heiße Anna und ich komme aus Berlin.',
      },
      {
        color: COL.R,
        cells: p([[1,4],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[6,4],[7,4],[8,4],[8,3],[8,2],[8,1]]),
        tokens: ['Hallo,','wie','geht','es','dir','denn','heute?','Mir','geht','es','wirklich','sehr','gut.'],
        sentence: 'Hallo, wie geht es dir denn heute? Mir geht es wirklich sehr gut.',
      },
      {
        color: COL.Y,
        cells: p([[2,2],[3,2],[4,2]]),
        tokens: ['Ja,','sehr','gern!'],
        sentence: 'Ja, sehr gern!',
      },
      {
        color: COL.B,
        cells: p([[2,4],[3,4],[4,4],[5,4],[5,5],[6,5],[7,5],[8,5],[9,5],[9,4],[9,3],[9,2],[9,1],[9,0],[8,0],[7,0],[7,1]]),
        tokens: ['Ich','wohne','jetzt','schon','seit','zwei','Jahren','gern','in','einer','großen','und','sehr','schönen','Stadt','in der','Nähe.'],
        sentence: 'Ich wohne jetzt schon seit zwei Jahren gern in einer großen und sehr schönen Stadt in der Nähe.',
      },
      {
        color: COL.P,
        cells: p([[4,5],[3,5],[2,5],[1,5],[0,5],[0,4],[0,3],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[6,1]]),
        tokens: ['Meine','Familie','lebt','nicht','weit','weg','und','wir','besuchen','uns','immer','am','Sonntag','bei','meinen','Eltern','zusammen.'],
        sentence: 'Meine Familie lebt nicht weit weg und wir besuchen uns immer am Sonntag bei meinen Eltern zusammen.',
      },
    ],
  },

  // ── Level 02 (ref 97, 10×6, 7 lines) ──
  {
    id: 2, ref: '97',
    title: 'Level 02', subtitle: 'Familie',
    rows: 10, cols: 6,
    grammarTopic: 'Akkusativ', vocabTopic: 'Familie', difficulty: 'A1',
    lines: [
      {
        color: COL.R,
        cells: p([[1,4],[1,3],[1,2],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[8,2],[8,3]]),
        tokens: ['Mein','Vater','arbeitet','als','Arzt','im','Krankenhaus','und','meine','Mutter','ist','Lehrerin','hier.'],
        sentence: 'Mein Vater arbeitet als Arzt im Krankenhaus und meine Mutter ist Lehrerin hier.',
      },
      {
        color: COL.B,
        cells: p([[2,2],[2,3],[2,4],[2,5],[1,5],[0,5],[0,4],[0,3],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0]]),
        tokens: ['Wir','haben','einen','großen','Hund','und','eine','kleine','Katze','zu Hause','und','alle','Tiere','leben','zusammen','gern','mit','uns','im','Haus.'],
        sentence: 'Wir haben einen großen Hund und eine kleine Katze zu Hause und alle Tiere leben zusammen gern mit uns im Haus.',
      },
      {
        color: COL.P,
        cells: p([[3,3],[3,2],[4,2]]),
        tokens: ['Wie','sehr','schön!'],
        sentence: 'Wie sehr schön!',
      },
      {
        color: COL.Y,
        cells: p([[3,5],[3,4],[4,4],[4,3]]),
        tokens: ['Das','ist','wirklich','toll!'],
        sentence: 'Das ist wirklich toll!',
      },
      {
        color: COL.C,
        cells: p([[4,5],[5,5],[5,4],[5,3],[5,2],[6,2],[7,2]]),
        tokens: ['Am Abend','essen','wir','immer','gern','alle','zusammen.'],
        sentence: 'Am Abend essen wir immer gern alle zusammen.',
      },
      {
        color: COL.O,
        cells: p([[6,3],[6,4],[6,5],[7,5],[8,5],[9,5]]),
        tokens: ['Meine','Schwester','wohnt','auch','in der','Nähe.'],
        sentence: 'Meine Schwester wohnt auch in der Nähe.',
      },
      {
        color: COL.G,
        cells: p([[7,3],[7,4],[8,4],[9,4],[9,3],[9,2],[9,1]]),
        tokens: ['Mein','Bruder','studiert','jetzt','Medizin','an der','Uni.'],
        sentence: 'Mein Bruder studiert jetzt Medizin an der Uni.',
      },
    ],
  },

  // ── Level 03 (ref 64, 10×6, 5 lines) ──
  {
    id: 3, ref: '64',
    title: 'Level 03', subtitle: 'Schule',
    rows: 10, cols: 6,
    grammarTopic: 'Praesens', vocabTopic: 'Schule', difficulty: 'A1',
    lines: [
      {
        color: COL.P,
        cells: p([[1,1],[2,1],[2,2]]),
        tokens: ['Sehr','gut','gemacht!'],
        sentence: 'Sehr gut gemacht!',
      },
      {
        color: COL.R,
        cells: p([[1,2],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[9,1],[9,2],[9,3],[9,4],[9,5],[8,5],[7,5],[6,5],[6,4]]),
        tokens: ['In','der','Schule','lernen','wir','jeden','Tag','viele','neue','und','interessante','Dinge','und','unsere','nette','Lehrerin','erklärt','uns','alles','immer','sehr','geduldig.'],
        sentence: 'In der Schule lernen wir jeden Tag viele neue und interessante Dinge und unsere nette Lehrerin erklärt uns alles immer sehr geduldig.',
      },
      {
        color: COL.G,
        cells: p([[1,3],[0,3],[0,4],[0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[5,4],[5,3],[6,3],[7,3]]),
        tokens: ['Meine','Freunde','und','ich','gehen','zusammen','in','die','Schule','und','lernen','dort','Deutsch.'],
        sentence: 'Meine Freunde und ich gehen zusammen in die Schule und lernen dort Deutsch.',
      },
      {
        color: COL.B,
        cells: p([[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[5,2],[6,2],[7,2],[8,2],[8,3],[8,4],[7,4]]),
        tokens: ['Nach','der','Schule','spielen','wir','oft','draußen','Fußball','oder','fahren','mit dem','Fahrrad','heim.'],
        sentence: 'Nach der Schule spielen wir oft draußen Fußball oder fahren mit dem Fahrrad heim.',
      },
      {
        color: COL.Y,
        cells: p([[2,3],[3,3],[3,2],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1]]),
        tokens: ['Der','Unterricht','beginnt','um','acht','Uhr','morgens','jeden','Tag.'],
        sentence: 'Der Unterricht beginnt um acht Uhr morgens jeden Tag.',
      },
    ],
  },

  // ── Level 04 (ref 65, 8×5, 4 lines) ──
  {
    id: 4, ref: '65',
    title: 'Level 04', subtitle: 'Essen und Trinken',
    rows: 8, cols: 5,
    grammarTopic: 'Akkusativ', vocabTopic: 'Essen und Trinken', difficulty: 'A1',
    lines: [
      {
        color: COL.R,
        cells: p([[1,3],[1,2],[1,1],[2,1]]),
        tokens: ['Das','schmeckt','sehr','gut!'],
        sentence: 'Das schmeckt sehr gut!',
      },
      {
        color: COL.G,
        cells: p([[2,2],[3,2],[3,3],[3,4],[4,4],[5,4],[6,4],[7,4],[7,3],[7,2],[7,1],[7,0],[6,0]]),
        tokens: ['Zum','Frühstück','esse','ich','immer','gern','frisches','Brot','mit','Butter','und','Marmelade','dazu.'],
        sentence: 'Zum Frühstück esse ich immer gern frisches Brot mit Butter und Marmelade dazu.',
      },
      {
        color: COL.P,
        cells: p([[2,3],[2,4],[1,4],[0,4],[0,3],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[3,1],[4,1],[4,2],[5,2]]),
        tokens: ['Meine','Mutter','kocht','jeden','Tag','ein','warmes','Mittagessen','für','die','ganze','Familie','und','alle','zusammen.'],
        sentence: 'Meine Mutter kocht jeden Tag ein warmes Mittagessen für die ganze Familie und alle zusammen.',
      },
      {
        color: COL.B,
        cells: p([[4,0],[5,0],[5,1],[6,1],[6,2],[6,3],[5,3],[4,3]]),
        tokens: ['Am Abend','trinken','wir','oft','zusammen','gern','heißen','Tee.'],
        sentence: 'Am Abend trinken wir oft zusammen gern heißen Tee.',
      },
    ],
  },

  // ── Level 05 (ref 66, 9×7, 7 lines) ──
  {
    id: 5, ref: '66',
    title: 'Level 05', subtitle: 'Tagesablauf',
    rows: 9, cols: 7,
    grammarTopic: 'Trennbare Verben', vocabTopic: 'Tagesablauf', difficulty: 'A2',
    lines: [
      {
        color: COL.P,
        cells: p([[0,0],[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[2,5],[2,6],[3,6],[4,6],[5,6]]),
        tokens: ['Jeden','Morgen','stehe','ich','früh','um','sechs','Uhr','auf','und','gehe','duschen.'],
        sentence: 'Jeden Morgen stehe ich früh um sechs Uhr auf und gehe duschen.',
      },
      {
        color: COL.O,
        cells: p([[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,6]]),
        tokens: ['Dann','frühstücke','ich','schnell','und','gehe','los.'],
        sentence: 'Dann frühstücke ich schnell und gehe los.',
      },
      {
        color: COL.G,
        cells: p([[3,1],[3,2],[3,3]]),
        tokens: ['Sehr','früh','ja!'],
        sentence: 'Sehr früh ja!',
      },
      {
        color: COL.B,
        cells: p([[4,1],[4,2],[4,3],[5,3],[6,3],[7,3],[7,2],[7,1]]),
        tokens: ['Die','Arbeit','beginnt','um','neun','Uhr','jeden','Morgen.'],
        sentence: 'Die Arbeit beginnt um neun Uhr jeden Morgen.',
      },
      {
        color: COL.R,
        cells: p([[4,4],[5,4],[6,4],[7,4],[7,5]]),
        tokens: ['Das','ist','mein','täglicher','Alltag.'],
        sentence: 'Das ist mein täglicher Alltag.',
      },
      {
        color: COL.Y,
        cells: p([[5,2],[5,1],[5,0],[4,0],[3,0],[2,0],[2,1],[2,2],[2,3],[2,4],[3,4],[3,5],[4,5],[5,5],[6,5],[6,6],[7,6],[8,6]]),
        tokens: ['Nach','der','Arbeit','gehe','ich','oft','in den','Supermarkt','und','dann','koche','ich','etwas','Leckeres','für','meine','ganze','Familie.'],
        sentence: 'Nach der Arbeit gehe ich oft in den Supermarkt und dann koche ich etwas Leckeres für meine ganze Familie.',
      },
      {
        color: COL.C,
        cells: p([[6,2],[6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5]]),
        tokens: ['Am','Wochenende','schlafe','ich','gern','lange','aus','und','frühstücke','gemütlich.'],
        sentence: 'Am Wochenende schlafe ich gern lange aus und frühstücke gemütlich.',
      },
    ],
  },

  // ── Level 06 (ref 70, 9×7, 6 lines) ──
  {
    id: 6, ref: '70',
    title: 'Level 06', subtitle: 'Wetter',
    rows: 9, cols: 7,
    grammarTopic: 'Nominativ', vocabTopic: 'Wetter', difficulty: 'A2',
    lines: [
      {
        color: COL.Y,
        cells: p([[0,0],[1,0],[2,0],[2,1],[2,2],[1,2],[1,3],[1,4],[1,5],[2,5],[3,5],[3,4],[4,4],[5,4]]),
        tokens: ['Heute','scheint','die','Sonne','und','es','ist','warm','draußen,','deshalb','gehen','wir','gern','spazieren.'],
        sentence: 'Heute scheint die Sonne und es ist warm draußen, deshalb gehen wir gern spazieren.',
      },
      {
        color: COL.G,
        cells: p([[1,1],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6],[4,6],[4,5],[5,5]]),
        tokens: ['Im','Sommer','ist','das','Wetter','meistens','schön','und','wir','fahren','oft','ans','Meer.'],
        sentence: 'Im Sommer ist das Wetter meistens schön und wir fahren oft ans Meer.',
      },
      {
        color: COL.P,
        cells: p([[2,4],[2,3],[3,3],[4,3],[5,3],[5,2]]),
        tokens: ['Es','regnet','leider','den','ganzen','Tag.'],
        sentence: 'Es regnet leider den ganzen Tag.',
      },
      {
        color: COL.B,
        cells: p([[3,2],[3,1],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5]]),
        tokens: ['Im','Winter','wird','es','sehr','kalt','und','es','schneit','oft','in','den','Bergen.'],
        sentence: 'Im Winter wird es sehr kalt und es schneit oft in den Bergen.',
      },
      {
        color: COL.R,
        cells: p([[4,2],[4,1],[5,1],[6,1],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[8,6]]),
        tokens: ['Der','Herbst','ist','bunt','und','schön,','aber','manchmal','weht','starker','Wind.'],
        sentence: 'Der Herbst ist bunt und schön, aber manchmal weht starker Wind.',
      },
      {
        color: COL.O,
        cells: p([[5,6],[6,6],[6,5],[6,4],[6,3],[6,2]]),
        tokens: ['Der','Frühling','kommt','bald,','alles','blüht.'],
        sentence: 'Der Frühling kommt bald, alles blüht.',
      },
    ],
  },

  // ── Level 07 (ref 71, 9×7, 7 lines) ──
  {
    id: 7, ref: '71',
    title: 'Level 07', subtitle: 'Stadt',
    rows: 9, cols: 7,
    grammarTopic: 'Lokale Praepositionen', vocabTopic: 'Stadt', difficulty: 'A2',
    lines: [
      {
        color: COL.G,
        cells: p([[0,3],[1,3],[2,3],[3,3],[3,4],[4,4],[5,4]]),
        tokens: ['Die','Stadt','hat','viele','schöne','alte','Gebäude.'],
        sentence: 'Die Stadt hat viele schöne alte Gebäude.',
      },
      {
        color: COL.Y,
        cells: p([[0,4],[1,4],[2,4]]),
        tokens: ['Wirklich','sehr','schön!'],
        sentence: 'Wirklich sehr schön!',
      },
      {
        color: COL.C,
        cells: p([[0,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[8,5],[8,4],[8,3],[8,2],[8,1],[7,1],[6,1]]),
        tokens: ['Wir','gehen','heute','durch','die','Altstadt','und','besuchen','den','berühmten','Dom,','dann','fahren','wir','mit der','Straßenbahn','zurück.'],
        sentence: 'Wir gehen heute durch die Altstadt und besuchen den berühmten Dom, dann fahren wir mit der Straßenbahn zurück.',
      },
      {
        color: COL.P,
        cells: p([[1,1],[2,1],[3,1],[4,1],[4,2],[4,3],[5,3],[6,3],[6,4],[6,5],[5,5],[4,5],[3,5],[2,5],[1,5]]),
        tokens: ['Am','Marktplatz','gibt','es','einen','großen','Brunnen','und','viele','kleine','Geschäfte,','wo','man','gut','einkauft.'],
        sentence: 'Am Marktplatz gibt es einen großen Brunnen und viele kleine Geschäfte, wo man gut einkauft.',
      },
      {
        color: COL.B,
        cells: p([[3,2],[2,2],[1,2],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[5,1]]),
        tokens: ['Das','Museum','ist','am','Sonntag','geöffnet','und','der','Eintritt','ist','für Kinder','frei.'],
        sentence: 'Das Museum ist am Sonntag geöffnet und der Eintritt ist für Kinder frei.',
      },
      {
        color: COL.R,
        cells: p([[5,2],[6,2],[7,2],[7,3],[7,4],[7,5]]),
        tokens: ['Der','Park','ist','gleich','um die','Ecke.'],
        sentence: 'Der Park ist gleich um die Ecke.',
      },
      {
        color: COL.O,
        cells: p([[6,0],[7,0],[8,0]]),
        tokens: ['Wie','toll','hier!'],
        sentence: 'Wie toll hier!',
      },
    ],
  },

  // ── Level 08 (ref 74, 10×6, 5 lines) ──
  {
    id: 8, ref: '74',
    title: 'Level 08', subtitle: 'Hobbys und Freizeit',
    rows: 10, cols: 6,
    grammarTopic: 'Akkusativ', vocabTopic: 'Hobbys und Freizeit', difficulty: 'A2',
    lines: [
      {
        color: COL.Y,
        cells: p([[1,1],[1,2],[1,3],[1,4],[2,4],[3,4]]),
        tokens: ['Ich','spiele','sehr','gern','am Abend','Gitarre.'],
        sentence: 'Ich spiele sehr gern am Abend Gitarre.',
      },
      {
        color: COL.B,
        cells: p([[2,1],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,5],[2,5],[3,5],[4,5],[4,4],[5,4],[5,3],[5,2],[6,2]]),
        tokens: ['Meine','beste','Freundin','liest','gern','Bücher','und','wir','gehen','oft','zusammen','in','die','Bibliothek','und','suchen','interessante','Romane.'],
        sentence: 'Meine beste Freundin liest gern Bücher und wir gehen oft zusammen in die Bibliothek und suchen interessante Romane.',
      },
      {
        color: COL.G,
        cells: p([[2,2],[3,2],[3,1],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[9,1],[9,2],[9,3],[9,4],[9,5],[8,5],[7,5]]),
        tokens: ['Am','Wochenende','fahren','wir','gern','mit dem','Fahrrad','durch','den','Wald','und','genießen','die','frische','Luft','und','Natur.'],
        sentence: 'Am Wochenende fahren wir gern mit dem Fahrrad durch den Wald und genießen die frische Luft und Natur.',
      },
      {
        color: COL.P,
        cells: p([[2,3],[3,3],[4,3],[4,2],[4,1],[5,1],[6,1],[7,1],[7,2],[7,3],[6,3]]),
        tokens: ['Mein','Bruder','schwimmt','jeden','Tag','im','Hallenbad','und','trainiert','für den','Wettkampf.'],
        sentence: 'Mein Bruder schwimmt jeden Tag im Hallenbad und trainiert für den Wettkampf.',
      },
      {
        color: COL.R,
        cells: p([[5,5],[6,5],[6,4],[7,4],[8,4],[8,3],[8,2],[8,1]]),
        tokens: ['Abends','kochen','wir','oft','zusammen','etwas','Leckeres','gern.'],
        sentence: 'Abends kochen wir oft zusammen etwas Leckeres gern.',
      },
    ],
  },

  // ── Level 09 (ref 75, 10×7, 6 lines) ──
  {
    id: 9, ref: '75',
    title: 'Level 09', subtitle: 'Reisen und Urlaub',
    rows: 10, cols: 7,
    grammarTopic: 'Perfekt', vocabTopic: 'Reisen und Urlaub', difficulty: 'B1',
    lines: [
      {
        color: COL.P,
        cells: p([[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[8,5],[8,4],[8,3],[8,2],[7,2],[6,2],[5,2],[4,2]]),
        tokens: ['Im','letzten','Sommer','sind','wir','mit dem','Zug','nach','München','gefahren','und','haben','dort','das','berühmte','Schloss','besucht','und','es','war','wirklich','ein','Erlebnis.'],
        sentence: 'Im letzten Sommer sind wir mit dem Zug nach München gefahren und haben dort das berühmte Schloss besucht und es war wirklich ein Erlebnis.',
      },
      {
        color: COL.B,
        cells: p([[1,0],[1,1],[1,2],[1,3],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4]]),
        tokens: ['Die','Reise','war','wunderbar','und','hat','uns','allen','sehr','gefallen.'],
        sentence: 'Die Reise war wunderbar und hat uns allen sehr gefallen.',
      },
      {
        color: COL.R,
        cells: p([[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[7,4]]),
        tokens: ['Nächstes','Jahr','fahren','wir','dann','gern','nach','Berlin.'],
        sentence: 'Nächstes Jahr fahren wir dann gern nach Berlin.',
      },
      {
        color: COL.G,
        cells: p([[2,3],[2,2],[2,1],[2,0],[3,0],[4,0],[5,0]]),
        tokens: ['Der','Urlaub','war','einfach','schön','und','erholsam.'],
        sentence: 'Der Urlaub war einfach schön und erholsam.',
      },
      {
        color: COL.O,
        cells: p([[6,0],[7,0],[8,0],[9,0],[9,1],[9,2],[9,3],[9,4],[9,5],[9,6]]),
        tokens: ['Am','Meer','haben','wir','jeden','Tag','gebadet','und','uns','erholt.'],
        sentence: 'Am Meer haben wir jeden Tag gebadet und uns erholt.',
      },
      {
        color: COL.Y,
        cells: p([[7,3],[6,3],[5,3],[4,3],[3,3],[3,2],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1]]),
        tokens: ['In','den','Bergen','kann','man','wunderbar','wandern','und','die','Aussicht','ist','atemberaubend.'],
        sentence: 'In den Bergen kann man wunderbar wandern und die Aussicht ist atemberaubend.',
      },
    ],
  },

  // ── Level 10 (ref 77, 9×7, 6 lines) ──
  {
    id: 10, ref: '77',
    title: 'Level 10', subtitle: 'Einkaufen',
    rows: 9, cols: 7,
    grammarTopic: 'Akkusativ', vocabTopic: 'Einkaufen', difficulty: 'B1',
    lines: [
      {
        color: COL.G,
        cells: p([[1,1],[2,1],[3,1],[4,1],[5,1],[5,2],[5,3],[5,4],[6,4],[6,5]]),
        tokens: ['Ich','gehe','heute','in den','Supermarkt','und','kaufe','frisches','Obst','ein.'],
        sentence: 'Ich gehe heute in den Supermarkt und kaufe frisches Obst ein.',
      },
      {
        color: COL.Y,
        cells: p([[1,3],[0,3],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[8,5],[8,4],[8,3],[8,2],[7,2]]),
        tokens: ['Auf','dem','Wochenmarkt','gibt','es','immer','frisches','Gemüse','und','leckeren','Käse','und','man','kann','dort','auch','schöne','Blumen.'],
        sentence: 'Auf dem Wochenmarkt gibt es immer frisches Gemüse und leckeren Käse und man kann dort auch schöne Blumen.',
      },
      {
        color: COL.P,
        cells: p([[1,4],[1,5],[2,5],[3,5],[4,5],[5,5]]),
        tokens: ['Das','Brot','hier','ist','sehr','lecker.'],
        sentence: 'Das Brot hier ist sehr lecker.',
      },
      {
        color: COL.R,
        cells: p([[2,4],[3,4],[4,4],[4,3],[4,2],[3,2]]),
        tokens: ['Ich','brauche','noch','Milch','und','Eier.'],
        sentence: 'Ich brauche noch Milch und Eier.',
      },
      {
        color: COL.O,
        cells: p([[3,3],[2,3],[2,2],[1,2],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0]]),
        tokens: ['Im','Kaufhaus','finde','ich','immer','schöne','Kleidung','und','gute','Angebote','für','den','Sommer','gern.'],
        sentence: 'Im Kaufhaus finde ich immer schöne Kleidung und gute Angebote für den Sommer gern.',
      },
      {
        color: COL.B,
        cells: p([[7,5],[7,4],[7,3],[6,3],[6,2],[6,1],[7,1],[8,1],[8,0]]),
        tokens: ['Die','Bäckerei','um die','Ecke','hat','leckere','frische','Brötchen','täglich.'],
        sentence: 'Die Bäckerei um die Ecke hat leckere frische Brötchen täglich.',
      },
    ],
  },

  // ── Level 11 (ref 84, 10×7, 6 lines) ──
  {
    id: 11, ref: '84',
    title: 'Level 11', subtitle: 'Natur und Umwelt',
    rows: 10, cols: 7,
    grammarTopic: 'Modalverben', vocabTopic: 'Natur und Umwelt', difficulty: 'B1',
    lines: [
      {
        color: COL.Y,
        cells: p([[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[6,2],[6,3],[6,4],[7,4],[7,5]]),
        tokens: ['Im','Frühling','blühen','die','Bäume','und','alles','wird','grün','und','schön.'],
        sentence: 'Im Frühling blühen die Bäume und alles wird grün und schön.',
      },
      {
        color: COL.G,
        cells: p([[1,3],[0,3],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[9,5],[9,4],[9,3],[9,2],[8,2]]),
        tokens: ['Der','Wald','hinter','unserem','Haus','ist','sehr','groß','und','dort','leben','viele','verschiedene','Tiere','wie','Rehe','und','Füchse','gern.'],
        sentence: 'Der Wald hinter unserem Haus ist sehr groß und dort leben viele verschiedene Tiere wie Rehe und Füchse gern.',
      },
      {
        color: COL.O,
        cells: p([[1,4],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5]]),
        tokens: ['Die','Blumen','im','Garten','duften','wunderbar','heute.'],
        sentence: 'Die Blumen im Garten duften wunderbar heute.',
      },
      {
        color: COL.R,
        cells: p([[2,4],[3,4],[4,4],[5,4],[5,3],[5,2],[4,2],[3,2]]),
        tokens: ['Am','See','kann','man','gut','angeln','und','schwimmen.'],
        sentence: 'Am See kann man gut angeln und schwimmen.',
      },
      {
        color: COL.P,
        cells: p([[4,3],[3,3],[2,3],[2,2],[1,2],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0]]),
        tokens: ['Die','Berge','in','den','Alpen','sind','wunderschön','und','im','Winter','kann','man','dort','gut','Ski','fahren.'],
        sentence: 'Die Berge in den Alpen sind wunderschön und im Winter kann man dort gut Ski fahren.',
      },
      {
        color: COL.B,
        cells: p([[8,5],[8,4],[8,3],[7,3],[7,2],[7,1],[8,1],[9,1],[9,0]]),
        tokens: ['Abends','hört','man','die','Vögel','singen','ganz','laut','draußen.'],
        sentence: 'Abends hört man die Vögel singen ganz laut draußen.',
      },
    ],
  },
];

// ── Content overrides from localStorage ──
const STORAGE_KEY = 'knoten-level-overrides';

export interface LevelContentOverride {
  lines: { tokens: string[]; sentence: string }[];
  grammarTopic?: string;
  vocabTopic?: string;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2';
}

export function getOverrides(): Record<number, LevelContentOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveOverride(levelId: number, override: LevelContentOverride) {
  const all = getOverrides();
  all[levelId] = override;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function removeOverride(levelId: number) {
  const all = getOverrides();
  delete all[levelId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function resetAllOverrides() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getActiveLevels(): Level[] {
  const overrides = getOverrides();
  return levels.map(base => {
    const ov = overrides[base.id];
    if (!ov) return base;
    return {
      ...base,
      grammarTopic: ov.grammarTopic || base.grammarTopic,
      vocabTopic: ov.vocabTopic || base.vocabTopic,
      difficulty: ov.difficulty || base.difficulty,
      lines: base.lines.map((line, i) => {
        const ovLine = ov.lines[i];
        if (!ovLine) return line;
        return { ...line, tokens: ovLine.tokens, sentence: ovLine.sentence };
      }),
    };
  });
}
