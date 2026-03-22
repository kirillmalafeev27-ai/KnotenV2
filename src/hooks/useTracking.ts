import { useCallback } from 'react';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3000';

export interface Student {
  id: number;
  name: string;
}

export function useTracking(student: Student | null) {
  const logEvent = useCallback(async (
    levelId: number,
    eventType: 'start' | 'attempt' | 'listen',
    data?: {
      pathCoords?: [number, number][];
      wordsHeard?: string[];
      sentenceFormed?: string;
      isCorrect?: boolean;
    }
  ) => {
    if (!student) return;
    try {
      await fetch(`${API_BASE}/api/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          levelId,
          eventType,
          pathCoords: data?.pathCoords,
          wordsHeard: data?.wordsHeard,
          sentenceFormed: data?.sentenceFormed,
          isCorrect: data?.isCorrect,
        }),
      });
    } catch {
      // Silent fail — don't break the game
    }
  }, [student]);

  return { logEvent };
}

export async function registerStudent(name: string): Promise<Student> {
  const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3000';
  const res = await fetch(`${API_BASE}/api/student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to register');
  return res.json();
}
