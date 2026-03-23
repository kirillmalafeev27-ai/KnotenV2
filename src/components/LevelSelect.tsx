import { useState, useMemo } from 'react';
import { getActiveLevels } from '../data/levels';
import { GRAMMAR_TOPICS, VOCAB_TOPICS } from '../data/grammarTopics';
import type { Level } from '../types/game';

interface LevelSelectProps {
  completedLevels: Set<number>;
  onSelect: (levelId: number) => void;
}

const DIFFICULTIES = ['A1', 'A2', 'B1', 'B2'] as const;

export default function LevelSelect({ completedLevels, onSelect }: LevelSelectProps) {
  const [difficulty, setDifficulty] = useState<string>('');
  const [grammarTopic, setGrammarTopic] = useState<string>('');
  const [vocabTopic, setVocabTopic] = useState<string>('');

  const activeLevels = useMemo(() => getActiveLevels(), []);

  const filtered = useMemo(() => {
    let result: Level[] = activeLevels;
    if (difficulty) result = result.filter(l => l.difficulty === difficulty);
    if (grammarTopic) result = result.filter(l => l.grammarTopic === grammarTopic);
    if (vocabTopic) result = result.filter(l => l.vocabTopic === vocabTopic);
    return result;
  }, [difficulty, grammarTopic, vocabTopic, activeLevels]);

  // Only show topics that exist in levels
  const availableGrammar = useMemo(() =>
    GRAMMAR_TOPICS.filter(t => activeLevels.some(l => l.grammarTopic === t)), [activeLevels]);
  const availableVocab = useMemo(() =>
    VOCAB_TOPICS.filter(t => activeLevels.some(l => l.vocabTopic === t)), [activeLevels]);

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

      {/* Filters */}
      <div className="level-filters">
        <div className="filter-group">
          <label className="filter-label">Sprachniveau</label>
          <div className="filter-chips">
            <button
              className={`filter-chip ${difficulty === '' ? 'active' : ''}`}
              onClick={() => setDifficulty('')}
            >Alle</button>
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`filter-chip ${difficulty === d ? 'active' : ''}`}
                onClick={() => setDifficulty(difficulty === d ? '' : d)}
              >{d}</button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Grammatik</label>
          <select
            className="filter-select"
            value={grammarTopic}
            onChange={e => setGrammarTopic(e.target.value)}
          >
            <option value="">Alle Themen</option>
            {availableGrammar.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Wortschatz</label>
          <select
            className="filter-select"
            value={vocabTopic}
            onChange={e => setVocabTopic(e.target.value)}
          >
            <option value="">Alle Themen</option>
            {availableVocab.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="level-grid">
        {filtered.length === 0 ? (
          <p className="level-empty">Keine Level für diese Filter gefunden.</p>
        ) : (
          filtered.map((level) => {
            const isCompleted = completedLevels.has(level.id);

            return (
              <button
                key={level.id}
                className={`level-card ${isCompleted ? 'completed' : ''}`}
                onClick={() => onSelect(level.id)}
              >
                <div className="level-number">{level.id}</div>
                <div className="level-title">{level.title}</div>
                <div className="level-subtitle">{level.subtitle}</div>
                <div className="level-difficulty">{level.difficulty}</div>
                {isCompleted && <div className="level-check">&#10003;</div>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
