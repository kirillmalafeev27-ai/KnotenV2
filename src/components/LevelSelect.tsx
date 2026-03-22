import { levels } from '../data/levels';

interface LevelSelectProps {
  completedLevels: Set<number>;
  onSelect: (levelId: number) => void;
}

export default function LevelSelect({ completedLevels, onSelect }: LevelSelectProps) {
  return (
    <div className="level-select">
      <div className="level-select-header">
        <h1 className="app-title">Knot Words</h1>
        <div className="app-badge">SENTENCE PATHS</div>
        <p className="app-subtitle">DEUTSCH LERNEN MIT FLOW</p>
        <h2 className="app-heading">
          Verbinde die Punkte,<br />
          höre die Wörter,<br />
          bilde den Satz.
        </h2>
        <p className="app-desc">
          Ziehe Linien durch das Raster. Die Wörter sind versteckt —
          du hörst sie nur. Finde den richtigen Weg für den korrekten deutschen Satz.
        </p>
      </div>

      <div className="level-grid">
        {levels.map((level) => {
          const isCompleted = completedLevels.has(level.id);
          const isUnlocked = level.id === 0 || completedLevels.has(level.id - 1);

          return (
            <button
              key={level.id}
              className={`level-card ${isCompleted ? 'completed' : ''} ${
                !isUnlocked ? 'locked' : ''
              }`}
              onClick={() => isUnlocked && onSelect(level.id)}
              disabled={!isUnlocked}
            >
              <div className="level-number">
                {level.isTutorial ? '?' : level.id}
              </div>
              <div className="level-title">{level.title}</div>
              <div className="level-subtitle">{level.subtitle}</div>
              {isCompleted && <div className="level-check">✓</div>}
              {!isUnlocked && <div className="level-lock">🔒</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
