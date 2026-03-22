import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Database setup ---
const db = new Database(path.join(__dirname, 'knoten.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS game_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    level_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    path_coords TEXT,
    words_heard TEXT,
    sentence_formed TEXT,
    is_correct INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE INDEX IF NOT EXISTS idx_events_student ON game_events(student_id);
  CREATE INDEX IF NOT EXISTS idx_events_level ON game_events(level_id);
`);

// --- API Routes ---

// Register or find student
app.post('/api/student', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name required' });
  }
  const trimmed = name.trim();
  let student = db.prepare('SELECT * FROM students WHERE name = ?').get(trimmed);
  if (!student) {
    const result = db.prepare('INSERT INTO students (name) VALUES (?)').run(trimmed);
    student = { id: result.lastInsertRowid, name: trimmed };
  }
  res.json(student);
});

// Log game event
app.post('/api/event', (req, res) => {
  const { studentId, levelId, eventType, pathCoords, wordsHeard, sentenceFormed, isCorrect } = req.body;
  if (!studentId || levelId === undefined || !eventType) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  db.prepare(`
    INSERT INTO game_events (student_id, level_id, event_type, path_coords, words_heard, sentence_formed, is_correct)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    studentId,
    levelId,
    eventType,
    pathCoords ? JSON.stringify(pathCoords) : null,
    wordsHeard ? JSON.stringify(wordsHeard) : null,
    sentenceFormed || null,
    isCorrect ? 1 : 0
  );
  res.json({ ok: true });
});

// Teacher dashboard data
app.get('/api/dashboard', (req, res) => {
  const students = db.prepare(`
    SELECT s.id, s.name, s.created_at,
      COUNT(DISTINCT CASE WHEN ge.is_correct = 1 THEN ge.level_id END) as levels_completed,
      COUNT(CASE WHEN ge.event_type = 'attempt' THEN 1 END) as total_attempts,
      COUNT(CASE WHEN ge.event_type = 'attempt' AND ge.is_correct = 1 THEN 1 END) as successful_attempts,
      MAX(ge.created_at) as last_active
    FROM students s
    LEFT JOIN game_events ge ON s.id = ge.student_id
    GROUP BY s.id
    ORDER BY s.last_active DESC NULLS LAST
  `).all();

  res.json({ students });
});

// Student detail
app.get('/api/dashboard/student/:id', (req, res) => {
  const { id } = req.params;
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  if (!student) return res.status(404).json({ error: 'Not found' });

  const events = db.prepare(`
    SELECT * FROM game_events
    WHERE student_id = ?
    ORDER BY created_at DESC
    LIMIT 200
  `).all(id);

  // Parse JSON fields
  const parsed = events.map(e => ({
    ...e,
    pathCoords: e.path_coords ? JSON.parse(e.path_coords) : null,
    wordsHeard: e.words_heard ? JSON.parse(e.words_heard) : null,
  }));

  res.json({ student, events: parsed });
});

// Live feed - recent events across all students
app.get('/api/dashboard/feed', (req, res) => {
  const events = db.prepare(`
    SELECT ge.*, s.name as student_name
    FROM game_events ge
    JOIN students s ON ge.student_id = s.id
    ORDER BY ge.created_at DESC
    LIMIT 50
  `).all();

  const parsed = events.map(e => ({
    ...e,
    wordsHeard: e.words_heard ? JSON.parse(e.words_heard) : null,
  }));

  res.json({ events: parsed });
});

// --- TTS Proxy (ElevenLabs) ---
// API key is set ONLY here on the server. Students never see it.
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY || '';
// Default: a German male voice. Override with any voice ID from elevenlabs.io/voice-library
const ELEVENLABS_VOICE = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text required' });
  }
  if (!ELEVENLABS_KEY) {
    return res.status(501).json({ error: 'no_key' });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_KEY,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs error:', response.status, errText);
      return res.status(502).json({ error: 'elevenlabs_error' });
    }

    res.set('Content-Type', 'audio/mpeg');
    const arrayBuf = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuf));
  } catch (err) {
    console.error('TTS proxy error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// --- Serve static files ---
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback — serve index.html for all non-API routes
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Knot Words server running on http://localhost:${PORT}`);
});
