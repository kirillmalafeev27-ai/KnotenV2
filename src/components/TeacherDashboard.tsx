import { useState, useEffect, useCallback } from 'react';

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
  const [tab, setTab] = useState<'students' | 'feed'>('feed');
  const [loading, setLoading] = useState(true);

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
    const interval = setInterval(fetchData, 5000); // auto-refresh every 5s
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
            ← Zurück
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
            <button
              className={`dash-tab ${tab === 'feed' ? 'active' : ''}`}
              onClick={() => setTab('feed')}
            >
              Live-Feed
            </button>
            <button
              className={`dash-tab ${tab === 'students' ? 'active' : ''}`}
              onClick={() => setTab('students')}
            >
              Schüler
            </button>
          </div>

          {tab === 'feed' ? (
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
                          {ev.is_correct ? '✓' : '✗'}
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
          ) : (
            <div className="dash-students">
              {students.map((s) => (
                <button
                  key={s.id}
                  className="dash-student-card"
                  onClick={() => openStudent(s.id)}
                >
                  <div className="dash-student-name">{s.name}</div>
                  <div className="dash-student-stats">
                    <span>{s.levels_completed}/4 Level</span>
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
        </>
      )}
    </div>
  );
}
