import { useRef, useCallback } from 'react';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3000';

function browserFallback(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function useTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: abortControllerRef.current.signal,
      });

      // Server has no API key configured → use browser TTS
      if (response.status === 501) {
        browserFallback(text);
        return;
      }

      if (!response.ok) {
        browserFallback(text);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      await audio.play();
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      // Network error or server down → browser fallback
      browserFallback(text);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}
