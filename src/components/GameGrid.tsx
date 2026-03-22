import { useState, useRef, useCallback, useEffect } from 'react';
import type { Level } from '../types/game';
import { useTTS } from '../hooks/useTTS';

/* ═══════════════════════════════════════════════════════════
   Constants & Colors (from Knot Dots reference palette)
   ═══════════════════════════════════════════════════════════ */
const BG = '#05080F';
const GRID_LINE = 'rgba(255,255,255,0.06)';
const GRID_DOT_C = 'rgba(255,255,255,0.12)';
const PATH_PURPLE = '#8B5CF6';
const PATH_SUCCESS = '#22C55E';
const PATH_FAIL = '#EF4444';

function hexRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ═══════════════════════════════════════════════════════════
   Particle System (emit / tickP / drawP)
   ═══════════════════════════════════════════════════════════ */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

function emit(particles: Particle[], x: number, y: number, color: string, count = 6) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 60;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.4 + Math.random() * 0.3,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function tickP(particles: Particle[], dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt / p.maxLife;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.96;
    p.vy *= 0.96;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawP(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ═══════════════════════════════════════════════════════════
   Wave System (addWave / tickW / drawW)
   ═══════════════════════════════════════════════════════════ */
interface Wave {
  progress: number; speed: number;
  life: number; maxLife: number; color: string;
}

function addWave(waves: Wave[], color: string) {
  waves.push({ progress: 0, speed: 2.5, life: 1, maxLife: 0.8, color });
}

function tickW(waves: Wave[], dt: number) {
  for (let i = waves.length - 1; i >= 0; i--) {
    const w = waves[i];
    w.progress += w.speed * dt;
    w.life -= dt / w.maxLife;
    if (w.life <= 0 || w.progress > 1) waves.splice(i, 1);
  }
}

function drawW(ctx: CanvasRenderingContext2D, waves: Wave[], pts: { x: number; y: number }[]) {
  if (pts.length < 2) return;
  let totalLen = 0;
  const segs: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    totalLen += Math.sqrt(dx * dx + dy * dy);
    segs.push(totalLen);
  }
  for (const w of waves) {
    const dist = w.progress * totalLen;
    let px = pts[0].x, py = pts[0].y;
    for (let i = 1; i < pts.length; i++) {
      if (dist <= segs[i]) {
        const segLen = segs[i] - segs[i - 1];
        const t = segLen > 0 ? (dist - segs[i - 1]) / segLen : 0;
        px = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t;
        py = pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t;
        break;
      }
    }
    const alpha = Math.max(0, w.life) * 0.6;
    ctx.globalAlpha = alpha;
    ctx.shadowColor = w.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = w.color;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}

/* ═══════════════════════════════════════════════════════════
   Web Audio API — SFX (connect / break / complete / win)
   ═══════════════════════════════════════════════════════════ */
let sfxCtx: AudioContext | null = null;

function initSfx() {
  if (!sfxCtx) sfxCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (sfxCtx.state === 'suspended') sfxCtx.resume();
}

function playSfx(type: 'connect' | 'break' | 'complete' | 'win') {
  if (!sfxCtx) return;
  const now = sfxCtx.currentTime;
  if (type === 'connect') {
    const osc = sfxCtx.createOscillator();
    const gain = sfxCtx.createGain();
    osc.connect(gain); gain.connect(sfxCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now); osc.stop(now + 0.1);
  } else if (type === 'break') {
    const osc = sfxCtx.createOscillator();
    const gain = sfxCtx.createGain();
    osc.connect(gain); gain.connect(sfxCtx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now); osc.stop(now + 0.1);
  } else if (type === 'complete') {
    const osc = sfxCtx.createOscillator();
    const gain = sfxCtx.createGain();
    osc.connect(gain); gain.connect(sfxCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
    osc.start(now); osc.stop(now + 0.2);
  } else if (type === 'win') {
    [400, 500, 600, 800].forEach((freq, i) => {
      const osc = sfxCtx!.createOscillator();
      const gain = sfxCtx!.createGain();
      osc.connect(gain); gain.connect(sfxCtx!.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05 + i * 0.05);
      gain.gain.linearRampToValueAtTime(0, now + 0.5 + i * 0.1);
      osc.start(now); osc.stop(now + 0.6 + i * 0.1);
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */
interface GameGridProps {
  level: Level;
  onComplete: (success: boolean) => void;
  logEvent?: (levelId: number, eventType: 'start' | 'attempt' | 'listen', data?: {
    pathCoords?: [number, number][];
    wordsHeard?: string[];
    sentenceFormed?: string;
    isCorrect?: boolean;
  }) => void;
}

export default function GameGrid({ level, onComplete, logEvent }: GameGridProps) {
  /* ── React state ── */
  const [path, setPath] = useState<[number, number][]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showResult, setShowResult] = useState<'success' | 'fail' | null>(null);
  const [spokenWords, setSpokenWords] = useState<string[]>([]);

  /* ── Refs (animation loop reads these) ── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<[number, number][]>([]);
  const isDraggingRef = useRef(false);
  const showResultRef = useRef<'success' | 'fail' | null>(null);
  const completedRef = useRef(false);
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const wavesRef = useRef<Wave[]>([]);
  const introTRef = useRef(0);
  const lastTRef = useRef(0);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpokenRef = useRef('');
  const sizeRef = useRef({ w: 0, h: 0, cs: 0 });
  const levelRef = useRef(level);

  const { speak, stop } = useTTS();

  /* ── Sync refs ── */
  useEffect(() => { pathRef.current = path; }, [path]);
  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
  useEffect(() => { showResultRef.current = showResult; }, [showResult]);
  useEffect(() => { completedRef.current = completed; }, [completed]);
  useEffect(() => { levelRef.current = level; }, [level]);

  /* ── Reset on level change ── */
  useEffect(() => {
    setPath([]);
    setIsDragging(false);
    setCompleted(false);
    setShowResult(null);
    setSpokenWords([]);
    lastSpokenRef.current = '';
    particlesRef.current = [];
    wavesRef.current = [];
    introTRef.current = performance.now();
  }, [level.id]);

  /* ── Helpers ── */
  const getWordsFromPath = useCallback((p: [number, number][]) => {
    return p.map(([r, c]) => level.wordGrid[r]?.[c] || '').filter(Boolean);
  }, [level.wordGrid]);

  const scheduleSpeech = useCallback((currentPath: [number, number][]) => {
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    speakTimerRef.current = setTimeout(() => {
      const words = getWordsFromPath(currentPath);
      const key = currentPath.map(([r, c]) => `${r},${c}`).join('|');
      if (words.length > 0 && key !== lastSpokenRef.current) {
        lastSpokenRef.current = key;
        setSpokenWords(words);
        speak(words.join(' '));
      }
    }, 2000);
  }, [getWordsFromPath, speak]);

  /* ── Cell from canvas pointer coords ── */
  const getCellFromCanvas = useCallback((clientX: number, clientY: number): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { w, cs } = sizeRef.current;
    if (cs === 0 || w === 0) return null;
    const scaleX = w / rect.width;
    const scaleY = sizeRef.current.h / rect.height;
    const lx = (clientX - rect.left) * scaleX;
    const ly = (clientY - rect.top) * scaleY;
    const col = Math.floor(lx / cs);
    const row = Math.floor(ly / cs);
    if (row < 0 || row >= level.gridRows || col < 0 || col >= level.gridCols) return null;
    return [row, col];
  }, [level.gridRows, level.gridCols]);

  const isAdjacent = (a: [number, number], b: [number, number]) => {
    const dr = Math.abs(a[0] - b[0]);
    const dc = Math.abs(a[1] - b[1]);
    return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
  };

  /* ── Pointer handlers ── */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    initSfx();
    if (completedRef.current) return;
    e.preventDefault();
    const cell = getCellFromCanvas(e.clientX, e.clientY);
    if (!cell) return;
    stop();
    lastSpokenRef.current = '';
    setSpokenWords([]);
    setShowResult(null);
    const newPath: [number, number][] = [cell];
    setPath(newPath);
    setIsDragging(true);
    playSfx('connect');
    scheduleSpeech(newPath);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    // Emit particles at start
    const cs = sizeRef.current.cs;
    emit(particlesRef.current, cell[1] * cs + cs / 2, cell[0] * cs + cs / 2, PATH_PURPLE, 4);
  }, [getCellFromCanvas, stop, scheduleSpeech]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || completedRef.current) return;
    e.preventDefault();
    const cell = getCellFromCanvas(e.clientX, e.clientY);
    if (!cell) return;

    setPath(prev => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      if (last[0] === cell[0] && last[1] === cell[1]) return prev;
      // Undo last move
      if (prev.length >= 2) {
        const secondLast = prev[prev.length - 2];
        if (secondLast[0] === cell[0] && secondLast[1] === cell[1]) {
          const np = prev.slice(0, -1);
          scheduleSpeech(np);
          playSfx('connect');
          return np;
        }
      }
      if (!isAdjacent(last, cell)) return prev;
      if (prev.some(([r, c]) => r === cell[0] && c === cell[1])) return prev;
      const np = [...prev, cell];
      scheduleSpeech(np);
      playSfx('connect');
      const cs = sizeRef.current.cs;
      emit(particlesRef.current, cell[1] * cs + cs / 2, cell[0] * cs + cs / 2, PATH_PURPLE, 4);
      addWave(wavesRef.current, PATH_PURPLE);
      return np;
    });
  }, [getCellFromCanvas, scheduleSpeech]);

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    setIsDragging(false);
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);

    const currentPath = pathRef.current;
    const correct = level.correctPath;
    const isCorrect =
      currentPath.length === correct.length &&
      currentPath.every(([r, c], i) => correct[i][0] === r && correct[i][1] === c);

    const words = getWordsFromPath(currentPath);
    const sentence = words.join(' ');

    if (isCorrect) {
      setCompleted(true);
      setShowResult('success');
      speak(level.sentence);
      playSfx('win');
      logEvent?.(level.id, 'attempt', { pathCoords: currentPath, wordsHeard: words, sentenceFormed: sentence, isCorrect: true });
      // Emit lots of particles along the path
      const cs = sizeRef.current.cs;
      currentPath.forEach(([r, c]) => {
        emit(particlesRef.current, c * cs + cs / 2, r * cs + cs / 2, PATH_SUCCESS, 3);
      });
      setTimeout(() => onComplete(true), 3000);
    } else if (currentPath.length > 0) {
      setShowResult('fail');
      playSfx('break');
      logEvent?.(level.id, 'attempt', { pathCoords: currentPath, wordsHeard: words, sentenceFormed: sentence, isCorrect: false });
      if (words.length > 0) speak(sentence);
    }
  }, [level.correctPath, level.sentence, level.id, speak, onComplete, getWordsFromPath, logEvent]);

  const reset = () => {
    setPath([]);
    setCompleted(false);
    setShowResult(null);
    setSpokenWords([]);
    lastSpokenRef.current = '';
    stop();
    particlesRef.current = [];
    wavesRef.current = [];
    introTRef.current = performance.now();
  };

  /* ── Canvas resize (ctx.setTransform only here, not per frame) ── */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const cs = Math.min(w / level.gridCols, h / level.gridRows);
    sizeRef.current = { w, h, cs };
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
  }, [level.gridCols, level.gridRows]);

  /* ── Animation loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    introTRef.current = performance.now();
    lastTRef.current = performance.now();
    resize();

    const ro = new ResizeObserver(() => resize());
    if (wrapperRef.current) ro.observe(wrapperRef.current);

    function frame(ts: number) {
      // Performance: skip tick+draw when tab hidden
      if (document.hidden) {
        animRef.current = requestAnimationFrame(frame);
        return;
      }
      const dt = Math.min(0.05, (ts - lastTRef.current) * 0.001);
      lastTRef.current = ts;
      const introElapsed = ts - introTRef.current;
      const t = ts * 0.001;
      draw(ctx!, t, dt, introElapsed);
      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id, resize]);

  /* ═══════════════════════════════════════════════════════════
     Draw — render layers:
     bg → grid → fills → paths → waves → cursor → dots → particles
     ═══════════════════════════════════════════════════════════ */
  function draw(ctx: CanvasRenderingContext2D, t: number, dt: number, introElapsed: number) {
    const { w, h, cs } = sizeRef.current;
    if (w === 0 || h === 0) return;
    const lvl = levelRef.current;
    const rows = lvl.gridRows;
    const cols = lvl.gridCols;
    const currentPath = pathRef.current;
    const result = showResultRef.current;
    const dragging = isDraggingRef.current;
    const pathColor = result === 'success' ? PATH_SUCCESS : result === 'fail' ? PATH_FAIL : PATH_PURPLE;
    const FONT = "'SF Pro Display','Inter var','Inter',system-ui,sans-serif";

    // ─── 1. BACKGROUND (atmospheric gradient) ───
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    // Animated ambient radial gradient — clamped to canvas
    const gcx = Math.max(0, Math.min(w, w * 0.5 + Math.sin(t * 0.22) * w * 0.15));
    const gcy = Math.max(0, Math.min(h, h * 0.5 + Math.cos(t * 0.154) * h * 0.15));
    const grad = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, Math.max(w, h) * 0.6);
    grad.addColorStop(0, 'rgba(88,28,135,0.07)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // ─── 2. GRID (lines + dot intersections, staggered intro) ───
    ctx.lineWidth = 1;
    // Horizontal lines
    for (let r = 0; r <= rows; r++) {
      const delay = r * 25;
      const a = Math.min(1, Math.max(0, (introElapsed - delay) / 300));
      ctx.globalAlpha = a;
      ctx.strokeStyle = GRID_LINE;
      ctx.beginPath();
      ctx.moveTo(0, r * cs);
      ctx.lineTo(cols * cs, r * cs);
      ctx.stroke();
    }
    // Vertical lines
    for (let c = 0; c <= cols; c++) {
      const delay = c * 25;
      const a = Math.min(1, Math.max(0, (introElapsed - delay) / 300));
      ctx.globalAlpha = a;
      ctx.strokeStyle = GRID_LINE;
      ctx.beginPath();
      ctx.moveTo(c * cs, 0);
      ctx.lineTo(c * cs, rows * cs);
      ctx.stroke();
    }
    // Dot intersections
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const delay = (r + c) * 15;
        const a = Math.min(1, Math.max(0, (introElapsed - delay) / 300));
        ctx.globalAlpha = a;
        ctx.fillStyle = GRID_DOT_C;
        ctx.beginPath();
        ctx.arc(c * cs, r * cs, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // ─── 3. FILLS (path cell backgrounds) ───
    if (result === 'success') {
      lvl.correctPath.forEach(([r, c]) => {
        ctx.fillStyle = hexRgba(PATH_SUCCESS, 0.12);
        ctx.fillRect(c * cs, r * cs, cs, cs);
      });
    } else {
      currentPath.forEach(([r, c]) => {
        ctx.fillStyle = hexRgba(pathColor, 0.08);
        ctx.fillRect(c * cs, r * cs, cs, cs);
      });
    }

    // ─── 4. PATHS (multi-layer bloom stroke) ───
    const displayPath = result === 'success' ? lvl.correctPath : currentPath;
    let pts: { x: number; y: number }[] = [];
    if (displayPath.length >= 2) {
      pts = displayPath.map(([r, c]) => ({ x: c * cs + cs / 2, y: r * cs + cs / 2 }));
      const isActive = dragging && !result;
      const oMul = isActive ? 1.15 : 1.0;

      // lineWidth tied to cs, not path length (per 0.2 spec)

      // Layer 1: wide glow
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = hexRgba(pathColor, 0.15 * oMul);
      ctx.lineWidth = cs * 0.45;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = pathColor;
      ctx.shadowBlur = cs * 0.35;
      ctx.stroke();
      ctx.shadowBlur = 0; // RESET between layers (per 0.2 spec)

      // Layer 2: body
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = hexRgba(pathColor, 0.5 * oMul);
      ctx.lineWidth = cs * 0.16;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Layer 3: bright core
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = hexRgba(pathColor, 0.9 * oMul);
      ctx.lineWidth = cs * 0.05;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // ─── 5. WAVES ───
    tickW(wavesRef.current, dt);
    if (pts.length >= 2) {
      drawW(ctx, wavesRef.current, pts);
    }

    // ─── 6. CURSOR (glow at active drag position) ───
    if (dragging && currentPath.length > 0 && !result) {
      const last = currentPath[currentPath.length - 1];
      const cx = last[1] * cs + cs / 2;
      const cy = last[0] * cs + cs / 2;
      const pulse = 1 + Math.sin(t * 6) * 0.1;
      ctx.shadowColor = pathColor;
      ctx.shadowBlur = cs * 0.3 * pulse;
      ctx.fillStyle = hexRgba(pathColor, 0.3);
      ctx.beginPath();
      ctx.arc(cx, cy, cs * 0.25 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // ─── 7. DOTS (colored circles with bloom + breathe) ───
    lvl.dots.forEach((dot, i) => {
      const cx = dot.col * cs + cs / 2;
      const cy = dot.row * cs + cs / 2;
      // Staggered intro
      const delay = 200 + i * 100;
      const introA = Math.min(1, Math.max(0, (introElapsed - delay) / 400));
      const introS = 0.5 + 0.5 * introA;
      // Breathe pulsation — amplitude ±0.028 (per 0.2 spec)
      const breathe = 1 + Math.sin(t * 2 + i * 0.5) * 0.028;
      const s = introS * breathe;
      const r = cs * 0.28 * s;
      // Bloom radius capped at cs × 0.44 (per 0.2 spec)
      const bloom = Math.min(cs * 0.44, cs * 0.35 * s);

      ctx.globalAlpha = introA;
      // Glow
      ctx.shadowColor = dot.color;
      ctx.shadowBlur = bloom;
      ctx.fillStyle = dot.color;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Bright center
      ctx.fillStyle = hexRgba('#ffffff', 0.3);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // ─── Path numbers during drag ───
    if (!result && currentPath.length > 0) {
      ctx.font = `bold ${cs * 0.28}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      currentPath.forEach(([r, c], i) => {
        ctx.fillStyle = hexRgba(pathColor, 0.5);
        ctx.fillText(`${i + 1}`, c * cs + cs / 2, r * cs + cs / 2);
      });
    }

    // ─── Revealed words on success ───
    if (result === 'success') {
      const fontSize = Math.min(cs * 0.22, 14);
      ctx.font = `600 ${fontSize}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      lvl.correctPath.forEach(([r, c]) => {
        const word = lvl.wordGrid[r]?.[c];
        if (word) {
          ctx.fillStyle = PATH_SUCCESS;
          ctx.fillText(word, c * cs + cs / 2, (r + 1) * cs - cs * 0.08, cs * 0.9);
        }
      });
    }

    // ─── 8. PARTICLES ───
    tickP(particlesRef.current, dt);
    drawP(ctx, particlesRef.current);
  }

  /* ═══════════════════════════════════════════════════════════
     JSX — canvas + React overlays
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="game-grid-container">
      {/* Spoken words display */}
      {spokenWords.length > 0 && (
        <div className="spoken-words">
          <span className="spoken-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </span>
          {spokenWords.map((w, i) => (
            <span key={i} className="spoken-word">{w}</span>
          ))}
        </div>
      )}

      {/* Tutorial hint */}
      {level.isTutorial && !completed && path.length === 0 && (
        <div className="tutorial-hint">
          Ziehe eine Linie von Punkt zu Punkt.<br />
          Halte 2 Sekunden um die Wörter zu hören.<br />
          Finde den richtigen Satz!
        </div>
      )}

      {/* Canvas wrapper */}
      <div
        ref={wrapperRef}
        className="game-canvas-wrapper"
        style={{ aspectRatio: `${level.gridCols} / ${level.gridRows}` }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      {/* Result feedback */}
      {showResult && (
        <div className={`result-banner ${showResult}`}>
          {showResult === 'success' ? (
            <>
              <div className="result-title">Richtig!</div>
              <div className="result-sentence">{level.sentence}</div>
              <div className="result-translation">{level.translation}</div>
            </>
          ) : (
            <>
              <div className="result-title">Versuche es nochmal</div>
              <button className="retry-btn" onClick={reset}>
                Level zurücksetzen
              </button>
            </>
          )}
        </div>
      )}

      {/* Listen button */}
      {!isDragging && path.length > 0 && !showResult && (
        <button
          className="listen-btn"
          onClick={() => {
            const words = getWordsFromPath(path);
            if (words.length > 0) {
              setSpokenWords(words);
              speak(words.join(' '));
              logEvent?.(level.id, 'listen', { pathCoords: path, wordsHeard: words });
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginRight:6}}><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          Anhören
        </button>
      )}
    </div>
  );
}
