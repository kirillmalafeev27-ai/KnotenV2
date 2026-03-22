import { useRef, useCallback } from 'react';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
// Default German voice - "Antoni" or any available voice
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export function useTTS(apiKey: string | null) {
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

    // If no API key, use browser's built-in TTS as fallback
    if (!apiKey) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return;
    }

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch(`${ELEVENLABS_API_URL}/${DEFAULT_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        console.warn('ElevenLabs API error, falling back to browser TTS');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      await audio.play();
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.warn('TTS error, using browser fallback:', err);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [apiKey]);

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
