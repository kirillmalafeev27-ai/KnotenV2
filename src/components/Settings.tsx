import { useState } from 'react';

interface SettingsProps {
  apiKey: string | null;
  onSave: (key: string | null) => void;
  onClose: () => void;
}

export default function Settings({ apiKey, onSave, onClose }: SettingsProps) {
  const [key, setKey] = useState(apiKey || '');

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Einstellungen</h2>

        <div className="setting-group">
          <label>ElevenLabs API Key</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="xi-xxxxxxxxxx..."
          />
          <p className="setting-hint">
            Ohne API-Key wird die Browser-Sprachsynthese verwendet.
          </p>
        </div>

        <div className="settings-actions">
          <button
            className="btn-primary"
            onClick={() => {
              onSave(key || null);
              onClose();
            }}
          >
            Speichern
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
