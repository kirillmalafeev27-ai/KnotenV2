import { useState, useCallback } from 'react';
import { levels } from './data/levels';
import GameGrid from './components/GameGrid';
import LevelSelect from './components/LevelSelect';
import Settings from './components/Settings';
import StudentLogin from './components/StudentLogin';
import TeacherDashboard from './components/TeacherDashboard';
import { useTracking, type Student } from './hooks/useTracking';
import './App.css';

function App() {
  // Check if teacher dashboard route
  const isTeacher = window.location.pathname === '/teacher';

  const [student, setStudent] = useState<Student | null>(() => {
    const saved = localStorage.getItem('knoten-student');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('knoten-completed');
    return saved ? new Set(JSON.parse(saved)) : new Set<number>();
  });
  const [apiKey, setApiKey] = useState<string | null>(() => {
    return localStorage.getItem('knoten-elevenlabs-key');
  });
  const [showSettings, setShowSettings] = useState(false);

  const { logEvent } = useTracking(student);

  const handleComplete = useCallback((success: boolean) => {
    if (success && currentLevel !== null) {
      setCompletedLevels((prev) => {
        const next = new Set(prev);
        next.add(currentLevel);
        localStorage.setItem('knoten-completed', JSON.stringify([...next]));
        return next;
      });
    }
  }, [currentLevel]);

  const handleSaveApiKey = (key: string | null) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('knoten-elevenlabs-key', key);
    } else {
      localStorage.removeItem('knoten-elevenlabs-key');
    }
  };

  const handleSelectLevel = (levelId: number) => {
    setCurrentLevel(levelId);
    logEvent(levelId, 'start');
  };

  const handleLogout = () => {
    setStudent(null);
    localStorage.removeItem('knoten-student');
  };

  // Teacher dashboard
  if (isTeacher) {
    return <TeacherDashboard />;
  }

  // Student login
  if (!student) {
    return <StudentLogin onLogin={setStudent} />;
  }

  const level = currentLevel !== null ? levels.find((l) => l.id === currentLevel) : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          {currentLevel !== null ? (
            <button className="back-btn" onClick={() => setCurrentLevel(null)}>
              ←
            </button>
          ) : (
            <div className="logo">KW</div>
          )}
        </div>
        <div className="header-center">
          {level ? (
            <div className="level-info">
              <span className="level-label">{level.title}</span>
              <span className="level-sub">{level.subtitle}</span>
            </div>
          ) : (
            <span className="header-title">Knot Words</span>
          )}
        </div>
        <div className="header-right">
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            ⚙
          </button>
        </div>
      </header>

      {/* Student name bar */}
      <div className="student-bar">
        <span className="student-name">Hallo, {student.name}!</span>
        <button className="logout-btn" onClick={handleLogout}>Abmelden</button>
      </div>

      <main className="app-main">
        {level ? (
          <GameGrid
            key={level.id}
            level={level}
            apiKey={apiKey}
            onComplete={handleComplete}
            logEvent={logEvent}
          />
        ) : (
          <LevelSelect
            completedLevels={completedLevels}
            onSelect={handleSelectLevel}
          />
        )}
      </main>

      {currentLevel !== null && (
        <div className="progress-bar">
          <div className="progress-label">
            LEVEL {(currentLevel || 0).toString().padStart(2, '0')}/
            {(levels.length - 1).toString().padStart(2, '0')}
          </div>
        </div>
      )}

      {showSettings && (
        <Settings
          apiKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
