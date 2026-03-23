import { useState, useEffect, useCallback } from 'react';
import { GRAMMAR_TOPICS, VOCAB_TOPICS } from '../data/grammarTopics';
import { levels, getOverrides, saveOverride, removeOverride, resetAllOverrides, type LevelContentOverride } from '../data/levels';

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

// Level specs: cells per line for each of the 11 levels
const LEVEL_SPECS: Record<number, { rows: number; cols: number; lines: number[]; colors: string[] }> = {
  1:  { rows: 10, cols: 6, lines: [10, 13, 3, 17, 17], colors: ['#00E5A0','#FF3A5C','#FFD040','#4D9EFF','#A855F7'] },
  2:  { rows: 10, cols: 6, lines: [13, 20, 3, 4, 7, 6, 7], colors: ['#FF3A5C','#4D9EFF','#A855F7','#FFD040','#59F0FF','#FF6B30','#00E5A0'] },
  3:  { rows: 10, cols: 6, lines: [3, 22, 13, 13, 9], colors: ['#A855F7','#FF3A5C','#00E5A0','#4D9EFF','#FFD040'] },
  4:  { rows: 8,  cols: 5, lines: [4, 13, 15, 8], colors: ['#FF3A5C','#00E5A0','#A855F7','#4D9EFF'] },
  5:  { rows: 9,  cols: 7, lines: [12, 7, 3, 8, 5, 18, 10], colors: ['#A855F7','#FF6B30','#00E5A0','#4D9EFF','#FF3A5C','#FFD040','#59F0FF'] },
  6:  { rows: 9,  cols: 7, lines: [14, 13, 6, 13, 11, 6], colors: ['#FFD040','#00E5A0','#A855F7','#4D9EFF','#FF3A5C','#FF6B30'] },
  7:  { rows: 9,  cols: 7, lines: [7, 3, 17, 15, 12, 6, 3], colors: ['#00E5A0','#FFD040','#59F0FF','#A855F7','#4D9EFF','#FF3A5C','#FF6B30'] },
  8:  { rows: 10, cols: 6, lines: [6, 18, 17, 11, 8], colors: ['#FFD040','#4D9EFF','#00E5A0','#A855F7','#FF3A5C'] },
  9:  { rows: 10, cols: 7, lines: [23, 10, 8, 7, 10, 12], colors: ['#A855F7','#4D9EFF','#FF3A5C','#00E5A0','#FF6B30','#FFD040'] },
  10: { rows: 9,  cols: 7, lines: [10, 18, 6, 6, 14, 9], colors: ['#00E5A0','#FFD040','#A855F7','#FF3A5C','#FF6B30','#4D9EFF'] },
  11: { rows: 10, cols: 7, lines: [11, 19, 7, 8, 16, 9], colors: ['#FFD040','#00E5A0','#FF6B30','#FF3A5C','#A855F7','#4D9EFF'] },
};

export default function TeacherDashboard() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [studentEvents, setStudentEvents] = useState<StudentEvent[]>([]);
  const [studentName, setStudentName] = useState('');
  const [tab, setTab] = useState<'feed' | 'students' | 'import' | 'generate' | 'topics' | 'cells' | 'settings'>('feed');
  const [loading, setLoading] = useState(true);

  // Import state
  const [importLevel, setImportLevel] = useState(1);
  const [jsonInput, setJsonInput] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState('');

  // Generate state
  const [genLevel, setGenLevel] = useState(1);
  const [genGrammar, setGenGrammar] = useState<string>(GRAMMAR_TOPICS[0]);
  const [genVocab, setGenVocab] = useState<string>(VOCAB_TOPICS[0]);
  const [genDifficulty, setGenDifficulty] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');
  const [genPrompt, setGenPrompt] = useState('');
  const [genResult, setGenResult] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');

  // Cells display state
  const [cellsLevel, setCellsLevel] = useState(1);

  // Settings state
  const [overridesList, setOverridesList] = useState<number[]>([]);

  const refreshOverrides = () => {
    const ov = getOverrides();
    setOverridesList(Object.keys(ov).map(Number));
  };

  useEffect(() => { refreshOverrides(); }, []);

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

  const selectedImportSpec = LEVEL_SPECS[importLevel];
  const selectedGenSpec = LEVEL_SPECS[genLevel];

  // ── Import: parse JSON and apply to level ──
  const handleImport = () => {
    setImportErrors([]);
    setImportSuccess('');
    const spec = selectedImportSpec;
    try {
      const parsed = JSON.parse(jsonInput);
      // Accept either {sentences: [...]} or {lines: [...]}
      const sentencesArr = parsed.sentences || parsed.lines;
      if (!Array.isArray(sentencesArr)) {
        setImportErrors(['JSON muss ein Array "sentences" oder "lines" enthalten.']);
        return;
      }
      if (sentencesArr.length !== spec.lines.length) {
        setImportErrors([`Erwartet ${spec.lines.length} Sätze, erhalten: ${sentencesArr.length}`]);
        return;
      }
      const errors: string[] = [];
      const overrideLines: { tokens: string[]; sentence: string }[] = [];
      for (let i = 0; i < sentencesArr.length; i++) {
        const s = sentencesArr[i];
        const tokens = s.tokens;
        const sentence = s.sentence;
        if (!Array.isArray(tokens)) {
          errors.push(`Satz ${i + 1}: "tokens" fehlt oder ist kein Array`);
          continue;
        }
        if (!sentence || typeof sentence !== 'string') {
          errors.push(`Satz ${i + 1}: "sentence" fehlt`);
          continue;
        }
        if (tokens.length !== spec.lines[i]) {
          errors.push(`Satz ${i + 1}: Erwartet ${spec.lines[i]} Tokens, erhalten: ${tokens.length}`);
        }
        overrideLines.push({ tokens, sentence });
      }
      if (errors.length > 0) {
        setImportErrors(errors);
        return;
      }
      const override: LevelContentOverride = {
        lines: overrideLines,
        grammarTopic: parsed.grammarTopic,
        vocabTopic: parsed.vocabTopic,
        difficulty: parsed.difficulty,
      };
      saveOverride(importLevel, override);
      refreshOverrides();
      setImportSuccess(`Level ${importLevel} erfolgreich aktualisiert! Seite neu laden, um Änderungen zu sehen.`);
    } catch (e) {
      setImportErrors([`JSON-Fehler: ${(e as Error).message}`]);
    }
  };

  // ── Generate: only sentences, not paths ──
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
          levelSpec: selectedGenSpec,
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
      setGenResult(JSON.stringify(data.result, null, 2));
    } catch {
      setGenError('Netzwerkfehler');
    } finally {
      setGenLoading(false);
    }
  };

  const handleApplyGenerated = () => {
    if (!genResult) return;
    setJsonInput(genResult);
    setImportLevel(genLevel);
    setTab('import');
    setImportErrors([]);
    setImportSuccess('');
  };

  // ── Cells display from base level ──
  const cellsSpec = LEVEL_SPECS[cellsLevel];
  const cellsBase = levels.find(l => l.id === cellsLevel);
  const cellsData = cellsBase ? cellsBase.lines.flatMap((line, li) =>
    line.cells.map((cell, ci) => ({
      r: cell.r, c: cell.c, word: line.tokens[ci] || '', color: line.color, index: ci, lineIndex: li, sentence: line.sentence,
    }))
  ).sort((a, b) => a.r - b.r || a.c - b.c) : [];

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
            <button className={`dash-tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>Feed</button>
            <button className={`dash-tab ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>Schüler</button>
            <button className={`dash-tab ${tab === 'generate' ? 'active' : ''}`} onClick={() => setTab('generate')}>Generieren</button>
            <button className={`dash-tab ${tab === 'import' ? 'active' : ''}`} onClick={() => setTab('import')}>Import</button>
            <button className={`dash-tab ${tab === 'cells' ? 'active' : ''}`} onClick={() => setTab('cells')}>Zellen</button>
            <button className={`dash-tab ${tab === 'topics' ? 'active' : ''}`} onClick={() => setTab('topics')}>Themen</button>
            <button className={`dash-tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => { setTab('settings'); refreshOverrides(); }}>Einstellungen</button>
          </div>

          {/* ═══ FEED ═══ */}
          {tab === 'feed' && (
            <div className="dash-feed">
              {feed.length === 0 ? (
                <p className="dash-empty">Noch keine Aktivität. Teile den Link mit deinen Schülern!</p>
              ) : feed.map((ev) => (
                <div key={ev.id} className={`dash-event ${ev.is_correct ? 'correct' : ''}`}>
                  <div className="dash-event-top">
                    <span className="dash-event-student">{ev.student_name}</span>
                    <span className={`dash-event-type ${ev.event_type}`}>{eventLabel(ev.event_type)}</span>
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
                      {ev.wordsHeard.map((w, i) => <span key={i} className="dash-word">{w}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ═══ STUDENTS ═══ */}
          {tab === 'students' && (
            <div className="dash-students">
              {students.map((s) => (
                <button key={s.id} className="dash-student-card" onClick={() => openStudent(s.id)}>
                  <div className="dash-student-name">{s.name}</div>
                  <div className="dash-student-stats">
                    <span>{s.levels_completed} Level</span>
                    <span>{s.successful_attempts}/{s.total_attempts} richtig</span>
                  </div>
                  {s.last_active && (
                    <div className="dash-student-time">Letzter Zugriff: {formatTime(s.last_active)}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ═══ GENERATE ═══ */}
          {tab === 'generate' && (
            <div className="dash-panel">
              <h3>Sätze generieren</h3>
              <p className="dash-panel-desc">
                Wähle ein Level. Die Pfade sind fest — es werden nur Sätze und Wörter generiert.
                Die Anzahl Tokens pro Linie ist fix und wird automatisch eingehalten.
              </p>

              {/* Level selector */}
              <div className="dash-gen-section">
                <label className="dash-gen-section-label">Level wählen</label>
                <div className="dash-gen-levels">
                  {Object.entries(LEVEL_SPECS).map(([num, spec]) => (
                    <button
                      key={num}
                      className={`dash-gen-level-btn ${genLevel === +num ? 'active' : ''}`}
                      onClick={() => setGenLevel(+num)}
                    >
                      <span className="dash-gen-level-num">{num}</span>
                      <span className="dash-gen-level-info">{spec.rows}&times;{spec.cols}</span>
                      <span className="dash-gen-level-info">{spec.lines.length} Sätze</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Spec details */}
              <div className="dash-gen-spec">
                <span>Raster: {selectedGenSpec.rows}&times;{selectedGenSpec.cols} ({selectedGenSpec.rows * selectedGenSpec.cols} Zellen)</span>
                <span>{selectedGenSpec.lines.length} Sätze:</span>
                {selectedGenSpec.lines.map((count, i) => (
                  <span key={i} className="dash-gen-line-badge">
                    <span className="dash-gen-line-dot" style={{ background: selectedGenSpec.colors[i] }} />
                    Linie {i+1}: {count} Wörter
                  </span>
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
                <label className="dash-gen-section-label">Eigener Prompt für die Sätze</label>
                <textarea
                  className="dash-textarea"
                  rows={4}
                  value={genPrompt}
                  onChange={e => setGenPrompt(e.target.value)}
                  placeholder="z.B.: Verwende nur Verben im Perfekt. Thema: Urlaub am Meer. Benutze einfache Wörter für Anfänger. Die kurzen Sätze sollen Ausrufe sein."
                />
              </div>

              <div className="dash-gen-actions">
                <button className="dash-action-btn" onClick={handleGenerate} disabled={genLoading}>
                  {genLoading ? 'Generiere...' : 'Generieren'}
                </button>
                {genResult && (
                  <button className="dash-action-btn secondary" onClick={handleApplyGenerated}>
                    In Import übernehmen
                  </button>
                )}
              </div>

              {genError && <div className="dash-errors"><div className="dash-error-item">{genError}</div></div>}
              {genResult && (
                <textarea className="dash-textarea" rows={16} value={genResult} readOnly style={{ marginTop: 12 }} />
              )}
            </div>
          )}

          {/* ═══ IMPORT ═══ */}
          {tab === 'import' && (
            <div className="dash-panel">
              <h3>Sätze importieren</h3>
              <p className="dash-panel-desc">
                Wähle das Level und füge JSON mit Sätzen ein. Die Pfade bleiben unverändert —
                nur die Wörter und Sätze werden ersetzt.
              </p>

              {/* Level selector */}
              <div className="dash-gen-section">
                <label className="dash-gen-section-label">Ziel-Level</label>
                <div className="dash-gen-levels">
                  {Object.entries(LEVEL_SPECS).map(([num, spec]) => (
                    <button
                      key={num}
                      className={`dash-gen-level-btn ${importLevel === +num ? 'active' : ''} ${overridesList.includes(+num) ? 'modified' : ''}`}
                      onClick={() => setImportLevel(+num)}
                    >
                      <span className="dash-gen-level-num">{num}</span>
                      <span className="dash-gen-level-info">{spec.lines.length} Sätze</span>
                      {overridesList.includes(+num) && <span className="dash-gen-level-mod">geändert</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spec */}
              <div className="dash-gen-spec">
                <span>Level {importLevel}: {selectedImportSpec.lines.length} Sätze</span>
                {selectedImportSpec.lines.map((count, i) => (
                  <span key={i} className="dash-gen-line-badge">
                    <span className="dash-gen-line-dot" style={{ background: selectedImportSpec.colors[i] }} />
                    {count} Wörter
                  </span>
                ))}
              </div>

              <p className="dash-panel-desc" style={{ fontSize: 12, marginBottom: 8 }}>
                JSON-Format: <code>{`{"sentences":[{"tokens":["Wort1","Wort2",...],"sentence":"Ganzer Satz."},...]}`}</code>
              </p>

              <textarea
                className="dash-textarea"
                rows={12}
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                placeholder={`{\n  "sentences": [\n    {"tokens": ["Wort1", "Wort2", ...], "sentence": "Ganzer Satz."},\n    ...\n  ]\n}`}
              />
              <button className="dash-action-btn" onClick={handleImport}>
                In Level {importLevel} importieren
              </button>
              {importErrors.length > 0 && (
                <div className="dash-errors">
                  {importErrors.map((err, i) => <div key={i} className="dash-error-item">{err}</div>)}
                </div>
              )}
              {importSuccess && <div className="dash-success">{importSuccess}</div>}
            </div>
          )}

          {/* ═══ CELLS ═══ */}
          {tab === 'cells' && (
            <div className="dash-panel">
              <h3>Zelleninhalt anzeigen</h3>

              <div className="dash-gen-section">
                <label className="dash-gen-section-label">Level</label>
                <div className="dash-gen-levels">
                  {Object.keys(LEVEL_SPECS).map(num => (
                    <button
                      key={num}
                      className={`dash-gen-level-btn ${cellsLevel === +num ? 'active' : ''}`}
                      onClick={() => setCellsLevel(+num)}
                    >
                      <span className="dash-gen-level-num">{num}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="dash-gen-spec" style={{ marginBottom: 8 }}>
                <span>Level {cellsLevel}: {cellsSpec.rows}&times;{cellsSpec.cols}, {cellsSpec.lines.length} Linien, {cellsData.length} Zellen</span>
              </div>

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

          {/* ═══ TOPICS ═══ */}
          {tab === 'topics' && (
            <div className="dash-panel">
              <h3>Grammatik-Themen ({GRAMMAR_TOPICS.length})</h3>
              <div className="dash-topics-list">
                {GRAMMAR_TOPICS.map(t => <span key={t} className="dash-topic-chip">{t}</span>)}
              </div>
              <h3 style={{ marginTop: 20 }}>Wortschatz-Themen ({VOCAB_TOPICS.length})</h3>
              <div className="dash-topics-list">
                {VOCAB_TOPICS.map(t => <span key={t} className="dash-topic-chip vocab">{t}</span>)}
              </div>
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {tab === 'settings' && (
            <div className="dash-panel">
              <h3>Einstellungen</h3>

              <div className="dash-settings-section">
                <h4>Angepasste Level</h4>
                {overridesList.length === 0 ? (
                  <p className="dash-panel-desc">Alle Level verwenden die Standardsätze.</p>
                ) : (
                  <div className="dash-overrides-list">
                    {overridesList.map(id => (
                      <div key={id} className="dash-override-item">
                        <span>Level {id}</span>
                        <button
                          className="dash-override-reset"
                          onClick={() => { removeOverride(id); refreshOverrides(); }}
                        >
                          Zurücksetzen
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dash-settings-section" style={{ marginTop: 20 }}>
                <button
                  className="dash-action-btn danger"
                  onClick={() => {
                    if (confirm('Alle angepassten Level auf die Standardsätze zurücksetzen?')) {
                      resetAllOverrides();
                      refreshOverrides();
                    }
                  }}
                >
                  Alle Level auf Standard zurücksetzen
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
