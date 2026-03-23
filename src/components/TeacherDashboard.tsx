import { useState, useEffect, useCallback } from 'react';
import { GRAMMAR_TOPICS, VOCAB_TOPICS } from '../data/grammarTopics';
import { validateLevel, type Level } from '../types/game';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3000';

interface StudentSummary {
  id: number;
  name: string;
  created_at: string;
  levels_completed: number;
  total_attempts: number;
  successful_attempts: number;
  last_active: string | null;
}

interface FeedEvent {
  id: number;
  student_name: string;
  level_id: number;
  event_type: string;
  words_heard: string | null;
  wordsHeard: string[] | null;
  sentence_formed: string | null;
  is_correct: number;
  created_at: string;
}

interface StudentEvent {
  id: number;
  level_id: number;
  event_type: string;
  wordsHeard: string[] | null;
  sentence_formed: string | null;
  is_correct: number;
  created_at: string;
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [studentEvents, setStudentEvents] = useState<StudentEvent[]>([]);
  const [studentName, setStudentName] = useState('');
  const [tab, setTab] = useState<'feed' | 'students' | 'import' | 'generate' | 'topics' | 'cells'>('feed');
  const [loading, setLoading] = useState(true);

  // JSON Import state
  const [jsonInput, setJsonInput] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);

  // Claude API generation state
  const [genGrammar, setGenGrammar] = useState<string>(GRAMMAR_TOPICS[0]);
  const [genVocab, setGenVocab] = useState<string>(VOCAB_TOPICS[0]);
  const [genDifficulty, setGenDifficulty] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');
  const [genLevel, setGenLevel] = useState(1);
  const [genPrompt, setGenPrompt] = useState('');
  const [genResult, setGenResult] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');

  // Cells display state
  const [cellsJson, setCellsJson] = useState('');
  const [cellsData, setCellsData] = useState<{r:number;c:number;word:string;color:string;index:number;sentence:string}[]>([]);
  const [cellsError, setCellsError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, feedRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard`),
        fetch(`${API_BASE}/api/dashboard/feed`),
      ]);
      const dashData = await dashRes.json();
      const feedData = await feedRes.json();
      setStudents(dashData.students);
      setFeed(feedData.events);
    } catch {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const openStudent = async (id: number) => {
    setSelectedStudent(id);
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/student/${id}`);
      const data = await res.json();
      setStudentName(data.student.name);
      setStudentEvents(data.events);
    } catch {
      console.error('Failed to fetch student data');
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts + 'Z');
    return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const eventLabel = (type: string) => {
    switch (type) {
      case 'start': return 'Gestartet';
      case 'attempt': return 'Versuch';
      case 'listen': return 'Angehört';
      default: return type;
    }
  };

  // ── JSON Import ──
  const handleImport = () => {
    setImportErrors([]);
    setImportSuccess(false);
    try {
      const parsed = JSON.parse(jsonInput) as Level;
      const errors = validateLevel(parsed);
      if (errors.length > 0) {
        setImportErrors(errors);
        return;
      }
      // Check required fields
      const missing: string[] = [];
      if (!parsed.id) missing.push('id fehlt');
      if (!parsed.title) missing.push('title fehlt');
      if (!parsed.rows || !parsed.cols) missing.push('rows/cols fehlt');
      if (!parsed.lines || parsed.lines.length === 0) missing.push('lines fehlt');
      if (!parsed.grammarTopic) missing.push('grammarTopic fehlt');
      if (!parsed.vocabTopic) missing.push('vocabTopic fehlt');
      if (!parsed.difficulty) missing.push('difficulty fehlt');
      for (const line of (parsed.lines || [])) {
        if (!line.color) missing.push('Linie ohne color');
        if (!line.sentence) missing.push('Linie ohne sentence');
      }
      if (missing.length > 0) {
        setImportErrors(missing);
        return;
      }
      setImportSuccess(true);
      setImportErrors([]);
    } catch (e) {
      setImportErrors([`JSON-Fehler: ${(e as Error).message}`]);
    }
  };

  // ── Level specs for generation ──
  const LEVEL_SPECS: Record<number, { rows: number; cols: number; lines: number[] }> = {
    1:  { rows: 10, cols: 6, lines: [10, 13, 3, 17, 17] },
    2:  { rows: 10, cols: 6, lines: [13, 20, 3, 4, 7, 6, 7] },
    3:  { rows: 10, cols: 6, lines: [3, 22, 13, 13, 9] },
    4:  { rows: 8,  cols: 5, lines: [4, 13, 15, 8] },
    5:  { rows: 9,  cols: 7, lines: [12, 7, 3, 8, 5, 18, 10] },
    6:  { rows: 9,  cols: 7, lines: [14, 13, 6, 13, 11, 6] },
    7:  { rows: 9,  cols: 7, lines: [7, 3, 17, 15, 12, 6, 3] },
    8:  { rows: 10, cols: 6, lines: [6, 18, 17, 11, 8] },
    9:  { rows: 10, cols: 7, lines: [23, 10, 8, 7, 10, 12] },
    10: { rows: 9,  cols: 7, lines: [10, 18, 6, 6, 14, 9] },
    11: { rows: 10, cols: 7, lines: [11, 19, 7, 8, 16, 9] },
  };

  const selectedSpec = LEVEL_SPECS[genLevel];
  const totalCells = selectedSpec.rows * selectedSpec.cols;

  // ── Claude API Generation ──
  const handleGenerate = async () => {
    setGenLoading(true);
    setGenError('');
    setGenResult('');
    try {
      const res = await fetch(`${API_BASE}/api/claude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grammarTopic: genGrammar,
          vocabTopic: genVocab,
          difficulty: genDifficulty,
          levelSpec: selectedSpec,
          levelNumber: genLevel,
          customPrompt: genPrompt,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setGenError(err.error || 'Fehler bei der Generierung');
        return;
      }
      const data = await res.json();
      setGenResult(JSON.stringify(data.level, null, 2));
    } catch {
      setGenError('Netzwerkfehler');
    } finally {
      setGenLoading(false);
    }
  };

  // ── Cells Display ──
  const handleParseCells = () => {
    setCellsData([]);
    setCellsError('');
    try {
      const parsed = JSON.parse(cellsJson) as Level;
      const cells: typeof cellsData = [];
      for (const line of (parsed.lines || [])) {
        for (let i = 0; i < line.cells.length; i++) {
          const cell = line.cells[i];
          cells.push({
            r: cell.r,
            c: cell.c,
            word: line.tokens[i] || '',
            color: line.color,
            index: i,
            sentence: line.sentence,
          });
        }
      }
      cells.sort((a, b) => a.r - b.r || a.c - b.c);
      setCellsData(cells);
    } catch (e) {
      setCellsError(`JSON-Fehler: ${(e as Error).message}`);
    }
  };

  if (loading) {
    return <div className="dashboard"><div className="dash-loading">Laden...</div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h1>Lehrer-Dashboard</h1>
        <p className="dash-subtitle">{students.length} Schüler registriert</p>
      </div>

      {selectedStudent ? (
        <div className="dash-student-detail">
          <button className="dash-back" onClick={() => setSelectedStudent(null)}>
            &#8592; Zurück
          </button>
          <h2>{studentName}</h2>
          <div className="dash-events">
            {studentEvents.length === 0 ? (
              <p className="dash-empty">Noch keine Aktivität</p>
            ) : (
              studentEvents.map((ev) => (
                <div key={ev.id} className={`dash-event ${ev.is_correct ? 'correct' : ''}`}>
                  <div className="dash-event-top">
                    <span className={`dash-event-type ${ev.event_type}`}>
                      {eventLabel(ev.event_type)}
                    </span>
                    <span className="dash-event-level">Level {ev.level_id}</span>
                    {ev.event_type === 'attempt' && (
                      <span className={`dash-event-result ${ev.is_correct ? 'ok' : 'fail'}`}>
                        {ev.is_correct ? 'Richtig' : 'Falsch'}
                      </span>
                    )}
                    <span className="dash-event-time">{formatTime(ev.created_at)}</span>
                  </div>
                  {ev.wordsHeard && (
                    <div className="dash-event-words">
                      {ev.wordsHeard.map((w, i) => (
                        <span key={i} className="dash-word">{w}</span>
                      ))}
                    </div>
                  )}
                  {ev.sentence_formed && (
                    <div className="dash-event-sentence">"{ev.sentence_formed}"</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="dash-tabs">
            <button className={`dash-tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>
              Live-Feed
            </button>
            <button className={`dash-tab ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>
              Schüler
            </button>
            <button className={`dash-tab ${tab === 'import' ? 'active' : ''}`} onClick={() => setTab('import')}>
              Import
            </button>
            <button className={`dash-tab ${tab === 'generate' ? 'active' : ''}`} onClick={() => setTab('generate')}>
              Generieren
            </button>
            <button className={`dash-tab ${tab === 'topics' ? 'active' : ''}`} onClick={() => setTab('topics')}>
              Themen
            </button>
            <button className={`dash-tab ${tab === 'cells' ? 'active' : ''}`} onClick={() => setTab('cells')}>
              Zellen
            </button>
          </div>

          {tab === 'feed' && (
            <div className="dash-feed">
              {feed.length === 0 ? (
                <p className="dash-empty">Noch keine Aktivität. Teile den Link mit deinen Schülern!</p>
              ) : (
                feed.map((ev) => (
                  <div key={ev.id} className={`dash-event ${ev.is_correct ? 'correct' : ''}`}>
                    <div className="dash-event-top">
                      <span className="dash-event-student">{ev.student_name}</span>
                      <span className={`dash-event-type ${ev.event_type}`}>
                        {eventLabel(ev.event_type)}
                      </span>
                      <span className="dash-event-level">L{ev.level_id}</span>
                      {ev.event_type === 'attempt' && (
                        <span className={`dash-event-result ${ev.is_correct ? 'ok' : 'fail'}`}>
                          {ev.is_correct ? '\u2713' : '\u2717'}
                        </span>
                      )}
                      <span className="dash-event-time">{formatTime(ev.created_at)}</span>
                    </div>
                    {ev.wordsHeard && (
                      <div className="dash-event-words">
                        {ev.wordsHeard.map((w, i) => (
                          <span key={i} className="dash-word">{w}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'students' && (
            <div className="dash-students">
              {students.map((s) => (
                <button
                  key={s.id}
                  className="dash-student-card"
                  onClick={() => openStudent(s.id)}
                >
                  <div className="dash-student-name">{s.name}</div>
                  <div className="dash-student-stats">
                    <span>{s.levels_completed} Level</span>
                    <span>{s.successful_attempts}/{s.total_attempts} richtig</span>
                  </div>
                  {s.last_active && (
                    <div className="dash-student-time">
                      Letzter Zugriff: {formatTime(s.last_active)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {tab === 'import' && (
            <div className="dash-panel">
              <h3>JSON-Level importieren</h3>
              <p className="dash-panel-desc">
                Füge ein Level im JSON-Format ein. Das Level wird validiert:
                Tokenanzahl = Zellenanzahl, orthogonale Nachbarschaft, keine Duplikate, volle Abdeckung.
              </p>
              <textarea
                className="dash-textarea"
                rows={12}
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                placeholder='{"id": 12, "title": "Level 12", ...}'
              />
              <button className="dash-action-btn" onClick={handleImport}>
                Validieren
              </button>
              {importErrors.length > 0 && (
                <div className="dash-errors">
                  {importErrors.map((err, i) => (
                    <div key={i} className="dash-error-item">{err}</div>
                  ))}
                </div>
              )}
              {importSuccess && (
                <div className="dash-success">Level ist valide!</div>
              )}
            </div>
          )}

          {tab === 'generate' && (
            <div className="dash-panel">
              <h3>Level mit Claude API generieren</h3>
              <p className="dash-panel-desc">
                Wähle ein Level-Template, Thema und Schwierigkeit. Schreibe optional deinen eigenen Prompt für die Sätze.
              </p>

              {/* Level selector */}
              <div className="dash-gen-section">
                <label className="dash-gen-section-label">Level-Template</label>
                <div className="dash-gen-levels">
                  {Object.entries(LEVEL_SPECS).map(([num, spec]) => (
                    <button
                      key={num}
                      className={`dash-gen-level-btn ${genLevel === +num ? 'active' : ''}`}
                      onClick={() => setGenLevel(+num)}
                    >
                      <span className="dash-gen-level-num">{num}</span>
                      <span className="dash-gen-level-info">{spec.rows}&times;{spec.cols}</span>
                      <span className="dash-gen-level-info">{spec.lines.length} Linien</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected level details */}
              <div className="dash-gen-spec">
                <span>Raster: {selectedSpec.rows}&times;{selectedSpec.cols} ({totalCells} Zellen)</span>
                <span>{selectedSpec.lines.length} Sätze:</span>
                {selectedSpec.lines.map((count, i) => (
                  <span key={i} className="dash-gen-line-badge">Linie {i+1}: {count} Wörter</span>
                ))}
              </div>

              <div className="dash-gen-form">
                <div className="dash-gen-row">
                  <label>Grammatik</label>
                  <select value={genGrammar} onChange={e => setGenGrammar(e.target.value)}>
                    {GRAMMAR_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="dash-gen-row">
                  <label>Wortschatz</label>
                  <select value={genVocab} onChange={e => setGenVocab(e.target.value)}>
                    {VOCAB_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="dash-gen-row">
                  <label>Schwierigkeit</label>
                  <select value={genDifficulty} onChange={e => setGenDifficulty(e.target.value as 'A1'|'A2'|'B1'|'B2')}>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                  </select>
                </div>
              </div>

              {/* Custom prompt */}
              <div className="dash-gen-section">
                <label className="dash-gen-section-label">Eigener Prompt (optional)</label>
                <textarea
                  className="dash-textarea"
                  rows={4}
                  value={genPrompt}
                  onChange={e => setGenPrompt(e.target.value)}
                  placeholder="z.B.: Verwende nur Verben im Perfekt. Thema: Urlaub am Meer. Benutze einfache Wörter für Anfänger."
                />
              </div>

              <button className="dash-action-btn" onClick={handleGenerate} disabled={genLoading}>
                {genLoading ? 'Generiere...' : 'Generieren'}
              </button>

              {genError && <div className="dash-errors"><div className="dash-error-item">{genError}</div></div>}
              {genResult && (
                <textarea className="dash-textarea" rows={16} value={genResult} readOnly />
              )}
            </div>
          )}

          {tab === 'topics' && (
            <div className="dash-panel">
              <h3>Grammatik-Themen ({GRAMMAR_TOPICS.length})</h3>
              <div className="dash-topics-list">
                {GRAMMAR_TOPICS.map(t => (
                  <span key={t} className="dash-topic-chip">{t}</span>
                ))}
              </div>
              <h3 style={{ marginTop: 20 }}>Wortschatz-Themen ({VOCAB_TOPICS.length})</h3>
              <div className="dash-topics-list">
                {VOCAB_TOPICS.map(t => (
                  <span key={t} className="dash-topic-chip vocab">{t}</span>
                ))}
              </div>
            </div>
          )}

          {tab === 'cells' && (
            <div className="dash-panel">
              <h3>Zelleninhalt anzeigen</h3>
              <p className="dash-panel-desc">
                Füge Level-JSON ein, um Zeile/Spalte, Wort, Farbe, Index und Satz jeder Zelle zu sehen.
              </p>
              <textarea
                className="dash-textarea"
                rows={8}
                value={cellsJson}
                onChange={e => setCellsJson(e.target.value)}
                placeholder='{"rows": 10, "cols": 6, "lines": [...]}'
              />
              <button className="dash-action-btn" onClick={handleParseCells}>
                Anzeigen
              </button>
              {cellsError && <div className="dash-errors"><div className="dash-error-item">{cellsError}</div></div>}
              {cellsData.length > 0 && (
                <div className="dash-cells-table">
                  <div className="dash-cells-header">
                    <span>Zeile</span><span>Spalte</span><span>Wort</span><span>Farbe</span><span>Index</span><span>Satz</span>
                  </div>
                  {cellsData.map((cell, i) => (
                    <div key={i} className="dash-cells-row">
                      <span>{cell.r}</span>
                      <span>{cell.c}</span>
                      <span className="dash-cells-word">{cell.word}</span>
                      <span><span className="dash-cells-color" style={{ background: cell.color }} /></span>
                      <span>{cell.index}</span>
                      <span className="dash-cells-sentence">{cell.sentence}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
