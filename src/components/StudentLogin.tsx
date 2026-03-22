import { useState } from 'react';
import { registerStudent, type Student } from '../hooks/useTracking';

interface StudentLoginProps {
  onLogin: (student: Student) => void;
}

export default function StudentLogin({ onLogin }: StudentLoginProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const student = await registerStudent(name.trim());
      localStorage.setItem('knoten-student', JSON.stringify(student));
      onLogin(student);
    } catch {
      setError('Verbindung fehlgeschlagen. Versuche es nochmal.');
      setLoading(false);
    }
  };

  return (
    <div className="student-login">
      <div className="login-card">
        <h1 className="app-title">Knot Words</h1>
        <div className="app-badge">SENTENCE PATHS</div>
        <p className="login-subtitle">DEUTSCH LERNEN MIT FLOW</p>

        <h2 className="login-heading">
          Verbinde die Punkte,<br />
          höre die Wörter,<br />
          bilde den Satz.
        </h2>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">Wie heißt du?</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein Name..."
            className="login-input"
            autoFocus
          />
          {error && <p className="login-error">{error}</p>}
          <button
            type="submit"
            className="login-btn"
            disabled={!name.trim() || loading}
          >
            {loading ? 'Laden...' : 'Lernpfad starten'}
          </button>
        </form>
      </div>
    </div>
  );
}
