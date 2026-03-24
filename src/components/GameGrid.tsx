import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { Level } from '../types/game';
import { useTTS } from '../hooks/useTTS';

/* ═══ Constants ═══ */
const BG = '#05080F';
const GRID_LINE = 'rgba(255,255,255,0.06)';
const GRID_DOT_C = 'rgba(255,255,255,0.12)';

function hexRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ═══ Particle System ═══ */
interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; }
function emit(ps: Particle[], x: number, y: number, color: string, n = 5) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 30 + Math.random() * 60;
    ps.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 1, max: 0.4+Math.random()*0.3, color, size: 2+Math.random()*3 });
  }
}
function tickP(ps: Particle[], dt: number) {
  for (let i = ps.length-1; i >= 0; i--) { const p = ps[i]; p.life -= dt/p.max; p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= 0.96; p.vy *= 0.96; if (p.life <= 0) ps.splice(i,1); }
}
function drawP(ctx: CanvasRenderingContext2D, ps: Particle[]) {
  for (const p of ps) { ctx.globalAlpha = Math.max(0,p.life); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size*Math.max(0,p.life), 0, Math.PI*2); ctx.fill(); }
  ctx.globalAlpha = 1;
}

/* ═══ Wave System ═══ */
interface Wave { progress: number; speed: number; life: number; max: number; color: string; }
function addWave(ws: Wave[], color: string) { ws.push({ progress: 0, speed: 2.5, life: 1, max: 0.8, color }); }
function tickW(ws: Wave[], dt: number) { for (let i = ws.length-1; i >= 0; i--) { const w = ws[i]; w.progress += w.speed*dt; w.life -= dt/w.max; if (w.life <= 0 || w.progress > 1) ws.splice(i,1); } }
function drawW(ctx: CanvasRenderingContext2D, ws: Wave[], pts: {x:number;y:number}[]) {
  if (pts.length < 2) return;
  let tot = 0; const segs = [0];
  for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i].x-pts[i-1].x, pts[i].y-pts[i-1].y); segs.push(tot); }
  for (const w of ws) {
    const d = w.progress * tot; let px = pts[0].x, py = pts[0].y;
    for (let i = 1; i < pts.length; i++) { if (d <= segs[i]) { const sl = segs[i]-segs[i-1]; const t = sl > 0 ? (d-segs[i-1])/sl : 0; px = pts[i-1].x+(pts[i].x-pts[i-1].x)*t; py = pts[i-1].y+(pts[i].y-pts[i-1].y)*t; break; } }
    ctx.globalAlpha = Math.max(0,w.life)*0.6; ctx.shadowColor = w.color; ctx.shadowBlur = 12; ctx.fillStyle = w.color; ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}

/* ═══ Green Spark System ═══ */
interface Spark { progress: number; speed: number; color: string; }
function tickSparks(sparks: Spark[], dt: number) {
  for (const s of sparks) { s.progress += s.speed * dt; if (s.progress > 1) s.progress -= 1; }
}
function drawSparks(ctx: CanvasRenderingContext2D, sparks: Spark[], pathsByColor: Record<string, {x:number;y:number}[]>) {
  for (const s of sparks) {
    const pts = pathsByColor[s.color];
    if (!pts || pts.length < 2) continue;
    let tot = 0; const segs = [0];
    for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i].x-pts[i-1].x, pts[i].y-pts[i-1].y); segs.push(tot); }
    const d = s.progress * tot;
    let px = pts[0].x, py = pts[0].y;
    for (let i = 1; i < pts.length; i++) {
      if (d <= segs[i]) { const sl = segs[i]-segs[i-1]; const t = sl > 0 ? (d-segs[i-1])/sl : 0; px = pts[i-1].x+(pts[i].x-pts[i-1].x)*t; py = pts[i-1].y+(pts[i].y-pts[i-1].y)*t; break; }
    }
    // Draw green spark with glow
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.shadowColor = '#44ff88'; ctx.shadowBlur = 18;
    ctx.fillStyle = '#44ff88';
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fill();
    // Bright core
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#bbffdd';
    ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

/* ═══ Component ═══ */
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
  // ── State ──
  const [lines, setLines] = useState<Record<string, [number, number][]>>({});
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [spokenWords, setSpokenWords] = useState<string[]>([]);
  const [spokenColor, setSpokenColor] = useState<string | null>(null);
  const [showWords, setShowWords] = useState(false);
  const [completedLines, setCompletedLines] = useState<Set<string>>(new Set());

  // ── Refs ──
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<Record<string, [number, number][]>>({});
  const activeColorRef = useRef<string | null>(null);
  const wonRef = useRef(false);
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const wavesRef = useRef<Wave[]>([]);
  const introTRef = useRef(0);
  const lastTRef = useRef(0);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, cs: 0 });
  const sparksRef = useRef<Spark[]>([]);
  const completedLinesRef = useRef<Set<string>>(new Set());
  const levelRef = useRef(level);

  const { speak, stop } = useTTS();

  // ── Sync refs ──
  useEffect(() => { linesRef.current = lines; }, [lines]);
  useEffect(() => { activeColorRef.current = activeColor; }, [activeColor]);
  useEffect(() => { wonRef.current = won; }, [won]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { completedLinesRef.current = completedLines; }, [completedLines]);

  // ── Derived: word grid and start dots ──
  const wordGrid = useMemo(() => {
    const g: string[][] = Array.from({ length: level.rows }, () => Array(level.cols).fill(''));
    for (const line of level.lines) line.cells.forEach((c, i) => { g[c.r][c.c] = line.tokens[i]; });
    return g;
  }, [level]);

  const startDots = useMemo(() =>
    level.lines.map(l => ({ r: l.cells[0].r, c: l.cells[0].c, color: l.color })),
  [level]);

  const endDots = useMemo(() =>
    level.lines.map(l => ({ r: l.cells[l.cells.length-1].r, c: l.cells[l.cells.length-1].c, color: l.color })),
  [level]);

  // ── Reset on level change ──
  useEffect(() => {
    const init: Record<string, [number, number][]> = {};
    for (const line of level.lines) init[line.color] = [];
    setLines(init);
    setActiveColor(null);
    setWon(false);
    setSpokenWords([]);
    setSpokenColor(null);
    particlesRef.current = [];
    wavesRef.current = [];
    sparksRef.current = [];
    setCompletedLines(new Set());
    introTRef.current = performance.now();
  }, [level.id, level.lines]);

  // ── Helpers ──
  const getOccupant = useCallback((r: number, c: number, exclude?: string): string | null => {
    for (const [color, path] of Object.entries(linesRef.current)) {
      if (color === exclude) continue;
      if (path.some(([pr, pc]) => pr === r && pc === c)) return color;
    }
    return null;
  }, []);

  const getCellFromCanvas = useCallback((clientX: number, clientY: number): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { w, h, cs } = sizeRef.current;
    if (cs === 0) return null;
    const lx = (clientX - rect.left) * (w / rect.width);
    const ly = (clientY - rect.top) * (h / rect.height);
    const col = Math.floor(lx / cs);
    const row = Math.floor(ly / cs);
    if (row < 0 || row >= level.rows || col < 0 || col >= level.cols) return null;
    return [row, col];
  }, [level.rows, level.cols]);

  // ── TTS ──
  const speakLine = useCallback((color: string) => {
    const path = linesRef.current[color];
    if (!path || path.length < 2) return;
    const words = path.map(([r, c]) => wordGrid[r][c]).filter(Boolean);
    if (words.length > 0) {
      setSpokenWords(words);
      setSpokenColor(color);
      speak(words.join(' '));
    }
  }, [wordGrid, speak]);

  const scheduleSpeech = useCallback((color: string) => {
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    speakTimerRef.current = setTimeout(() => {
      speakLine(color);
    }, 750);
  }, [speakLine]);

  // ── Check win ──
  const checkWin = useCallback(() => {
    const cur = linesRef.current;
    const total = level.rows * level.cols;
    let covered = 0;
    for (const path of Object.values(cur)) covered += path.length;
    if (covered !== total) return;
    // Verify all lines match reference
    let ok = true;
    for (const lineDef of level.lines) {
      const pp = cur[lineDef.color];
      if (!pp || pp.length !== lineDef.cells.length) { ok = false; break; }
      for (let i = 0; i < lineDef.cells.length; i++) {
        if (pp[i][0] !== lineDef.cells[i].r || pp[i][1] !== lineDef.cells[i].c) { ok = false; break; }
      }
      if (!ok) break;
    }
    if (ok) {
      setWon(true);
      const cs = sizeRef.current.cs;
      for (const lineDef of level.lines) {
        for (const cell of lineDef.cells) emit(particlesRef.current, cell.c*cs+cs/2, cell.r*cs+cs/2, lineDef.color, 2);
      }
      const allSentences = level.lines.map(l => l.sentence).join(' ');
      speak(allSentences);
      logEvent?.(level.id, 'attempt', { isCorrect: true, sentenceFormed: allSentences });
      setTimeout(() => onComplete(true), 4000);
    }
  }, [level, speak, logEvent, onComplete]);

  // ── Pointer handlers ──
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (wonRef.current) return;
    e.preventDefault();
    const cell = getCellFromCanvas(e.clientX, e.clientY);
    if (!cell) return;
    const [r, c] = cell;
    stop();
    setSpokenWords([]);
    setSpokenColor(null);

    // Check if it's a start dot
    const sd = startDots.find(d => d.r === r && d.c === c);
    if (sd) {
      setActiveColor(sd.color);
      setCompletedLines(prev => { if (!prev.has(sd.color)) return prev; const n = new Set(prev); n.delete(sd.color); sparksRef.current = sparksRef.current.filter(s => s.color !== sd.color); return n; });
      setLines(prev => ({ ...prev, [sd.color]: [[r, c]] }));
      const cs = sizeRef.current.cs;
      emit(particlesRef.current, c*cs+cs/2, r*cs+cs/2, sd.color, 4);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      return;
    }
    // Check if on an existing line
    for (const [color, path] of Object.entries(linesRef.current)) {
      const idx = path.findIndex(([pr, pc]) => pr === r && pc === c);
      if (idx !== -1) {
        setActiveColor(color);
        setCompletedLines(prev => { if (!prev.has(color)) return prev; const n = new Set(prev); n.delete(color); sparksRef.current = sparksRef.current.filter(s => s.color !== color); return n; });
        setLines(prev => ({ ...prev, [color]: path.slice(0, idx + 1) }));
        scheduleSpeech(color);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        return;
      }
    }
  }, [getCellFromCanvas, startDots, stop]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ac = activeColorRef.current;
    if (!ac || wonRef.current) return;
    e.preventDefault();
    const cell = getCellFromCanvas(e.clientX, e.clientY);
    if (!cell) return;
    const [r, c] = cell;

    setLines(prev => {
      const path = prev[ac];
      if (!path || path.length === 0) return prev;
      const last = path[path.length - 1];
      if (last[0] === r && last[1] === c) return prev;
      // Undo
      if (path.length >= 2) {
        const sl = path[path.length - 2];
        if (sl[0] === r && sl[1] === c) {
          return { ...prev, [ac]: path.slice(0, -1) };
        }
      }
      // Orthogonal only
      if (Math.abs(r - last[0]) + Math.abs(c - last[1]) !== 1) return prev;
      // Not occupied by different color
      if (getOccupant(r, c, ac)) return prev;
      // Not already in our path
      if (path.some(([pr, pc]) => pr === r && pc === c)) return prev;
      const cs = sizeRef.current.cs;
      emit(particlesRef.current, c*cs+cs/2, r*cs+cs/2, ac, 3);
      addWave(wavesRef.current, ac);
      return { ...prev, [ac]: [...path, [r, c]] };
    });
  }, [getCellFromCanvas, getOccupant]);

  const checkLineComplete = useCallback((color: string) => {
    const path = linesRef.current[color];
    const lineDef = level.lines.find(l => l.color === color);
    if (!lineDef || !path || path.length !== lineDef.cells.length) {
      setCompletedLines(prev => { if (!prev.has(color)) return prev; const n = new Set(prev); n.delete(color); sparksRef.current = sparksRef.current.filter(s => s.color !== color); return n; });
      return;
    }
    for (let i = 0; i < lineDef.cells.length; i++) {
      if (path[i][0] !== lineDef.cells[i].r || path[i][1] !== lineDef.cells[i].c) {
        setCompletedLines(prev => { if (!prev.has(color)) return prev; const n = new Set(prev); n.delete(color); sparksRef.current = sparksRef.current.filter(s => s.color !== color); return n; });
        return;
      }
    }
    // Line is correct!
    setCompletedLines(prev => { if (prev.has(color)) return prev; const n = new Set(prev); n.add(color); sparksRef.current.push({ progress: 0, speed: 0.4, color }); return n; });
  }, [level.lines]);

  const handlePointerUp = useCallback(() => {
    const color = activeColorRef.current;
    if (!color) return;
    setActiveColor(null);
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    scheduleSpeech(color);
    checkLineComplete(color);
    checkWin();
  }, [checkWin, scheduleSpeech, checkLineComplete]);

  const reset = () => {
    stop();
    const init: Record<string, [number, number][]> = {};
    for (const line of level.lines) init[line.color] = [];
    setLines(init);
    setActiveColor(null);
    setWon(false);
    setSpokenWords([]);
    setSpokenColor(null);
    particlesRef.current = [];
    wavesRef.current = [];
    sparksRef.current = [];
    setCompletedLines(new Set());
    introTRef.current = performance.now();
  };

  // ── Resize ──
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width, h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const cs = Math.min(w / level.cols, h / level.rows);
    sizeRef.current = { w, h, cs };
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr); }
  }, [level.cols, level.rows]);

  // ── Animation loop ──
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
      if (document.hidden) { animRef.current = requestAnimationFrame(frame); return; }
      const dt = Math.min(0.05, (ts - lastTRef.current) * 0.001);
      lastTRef.current = ts;
      draw(ctx!, ts * 0.001, dt, ts - introTRef.current);
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id, resize]);

  // ── Draw ──
  function draw(ctx: CanvasRenderingContext2D, t: number, dt: number, introMs: number) {
    const { w, h, cs } = sizeRef.current;
    if (w === 0 || h === 0) return;
    const lvl = levelRef.current;
    const rows = lvl.rows, cols = lvl.cols;
    const curLines = linesRef.current;
    const ac = activeColorRef.current;
    const isWon = wonRef.current;
    const FONT = "'SF Pro Display','Inter var','Inter',system-ui,sans-serif";

    // 1. Background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    const gcx = Math.max(0, Math.min(w, w*0.5 + Math.sin(t*0.22)*w*0.15));
    const gcy = Math.max(0, Math.min(h, h*0.5 + Math.cos(t*0.154)*h*0.15));
    const grad = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, Math.max(w,h)*0.6);
    grad.addColorStop(0, 'rgba(88,28,135,0.07)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Grid
    ctx.lineWidth = 1;
    for (let r = 0; r <= rows; r++) {
      const a = Math.min(1, Math.max(0, (introMs - r*25) / 300));
      ctx.globalAlpha = a; ctx.strokeStyle = GRID_LINE;
      ctx.beginPath(); ctx.moveTo(0, r*cs); ctx.lineTo(cols*cs, r*cs); ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      const a = Math.min(1, Math.max(0, (introMs - c*25) / 300));
      ctx.globalAlpha = a; ctx.strokeStyle = GRID_LINE;
      ctx.beginPath(); ctx.moveTo(c*cs, 0); ctx.lineTo(c*cs, rows*cs); ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) {
      ctx.globalAlpha = Math.min(1, Math.max(0, (introMs - (r+c)*15) / 300));
      ctx.fillStyle = GRID_DOT_C; ctx.beginPath(); ctx.arc(c*cs, r*cs, 1.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Fills
    for (const [color, path] of Object.entries(curLines)) {
      if (path.length === 0) continue;
      ctx.fillStyle = hexRgba(color, isWon ? 0.12 : 0.08);
      for (const [r, c] of path) ctx.fillRect(c*cs, r*cs, cs, cs);
    }

    // 4. Paths (multi-layer bloom)
    for (const [color, path] of Object.entries(curLines)) {
      if (path.length < 2) continue;
      const pts = path.map(([r, c]) => ({ x: c*cs+cs/2, y: r*cs+cs/2 }));
      const isActive = color === ac;
      const om = isActive ? 1.15 : 1.0;

      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // Glow
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = hexRgba(color, 0.15*om); ctx.lineWidth = cs*0.45;
      ctx.shadowColor = color; ctx.shadowBlur = cs*0.35; ctx.stroke(); ctx.shadowBlur = 0;
      // Body
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = hexRgba(color, 0.5*om); ctx.lineWidth = cs*0.16; ctx.stroke();
      // Core
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = hexRgba(color, 0.9*om); ctx.lineWidth = cs*0.05; ctx.stroke();
    }

    // 5. Waves
    tickW(wavesRef.current, dt);
    if (ac && curLines[ac] && curLines[ac].length >= 2) {
      const pts = curLines[ac].map(([r,c]) => ({x:c*cs+cs/2, y:r*cs+cs/2}));
      drawW(ctx, wavesRef.current, pts);
    }

    // 6. Cursor
    if (ac && curLines[ac] && curLines[ac].length > 0 && !isWon) {
      const last = curLines[ac][curLines[ac].length-1];
      const cx = last[1]*cs+cs/2, cy = last[0]*cs+cs/2;
      const pulse = 1 + Math.sin(t*6)*0.1;
      ctx.shadowColor = ac; ctx.shadowBlur = cs*0.3*pulse;
      ctx.fillStyle = hexRgba(ac, 0.3);
      ctx.beginPath(); ctx.arc(cx, cy, cs*0.25*pulse, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 7. Start dots (always visible) & end dots (hidden once any line is completed)
    const completed = completedLinesRef.current;
    const anyCompleted = completed.size > 0;
    const allDots = [
      ...startDots.map((d, i) => ({ ...d, idx: i, isEnd: false })),
      ...endDots.map((d, i) => ({ ...d, idx: i + startDots.length, isEnd: true })),
    ];
    for (const dot of allDots) {
      if (dot.isEnd && anyCompleted) continue;
      const cx = dot.c*cs+cs/2, cy = dot.r*cs+cs/2;
      const di = dot.idx;
      const iA = Math.min(1, Math.max(0, (introMs - 200 - di*60) / 400));
      const iS = 0.5 + 0.5*iA;
      const breathe = 1 + Math.sin(t*2 + di*0.5)*0.028;
      const s = iS * breathe;
      const radius = cs*0.28*s;
      const bloom = Math.min(cs*0.44, cs*0.35*s);
      ctx.globalAlpha = iA;
      ctx.shadowColor = dot.color; ctx.shadowBlur = bloom;
      ctx.fillStyle = dot.color;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = hexRgba('#ffffff', 0.3);
      ctx.beginPath(); ctx.arc(cx, cy, radius*0.4, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // 8. Path numbers (active line only)
    if (ac && curLines[ac] && curLines[ac].length > 0 && !isWon) {
      ctx.font = `bold ${cs*0.26}px ${FONT}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      curLines[ac].forEach(([r,c], i) => {
        ctx.fillStyle = hexRgba(ac, 0.5);
        ctx.fillText(`${i+1}`, c*cs+cs/2, r*cs+cs/2);
      });
    }

    // 9. Words on win
    if (isWon) {
      const fontSize = Math.min(cs*0.2, 13);
      ctx.font = `600 ${fontSize}px ${FONT}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const lineDef of lvl.lines) {
        for (let i = 0; i < lineDef.cells.length; i++) {
          const cell = lineDef.cells[i];
          const word = lineDef.tokens[i];
          if (word) {
            ctx.fillStyle = lineDef.color;
            ctx.fillText(word, cell.c*cs+cs/2, cell.r*cs+cs/2, cs*0.9);
          }
        }
      }
    }

    // 10. Particles
    tickP(particlesRef.current, dt);
    drawP(ctx, particlesRef.current);

    // 11. Green sparks on completed lines
    tickSparks(sparksRef.current, dt);
    if (sparksRef.current.length > 0) {
      const sparkPaths: Record<string, {x:number;y:number}[]> = {};
      for (const s of sparksRef.current) {
        const path = curLines[s.color];
        if (path && path.length >= 2) sparkPaths[s.color] = path.map(([r,c]) => ({x:c*cs+cs/2, y:r*cs+cs/2}));
      }
      drawSparks(ctx, sparksRef.current, sparkPaths);
    }
  }

  // ── Completion stats ──
  const totalCells = level.rows * level.cols;
  const filledCells = Object.values(lines).reduce((sum, p) => sum + p.length, 0);

  return (
    <div className="game-grid-container">
      {/* Spoken words — hidden behind hold-to-reveal button */}
      <div className="spoken-words-container">
        {showWords && spokenWords.length > 0 && (
          <div className="spoken-words" style={spokenColor ? { borderColor: hexRgba(spokenColor, 0.3) } : undefined}>
            <span className="spoken-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </span>
            {spokenWords.map((w, i) => (
              <span key={i} className="spoken-word" style={spokenColor ? { background: hexRgba(spokenColor, 0.15), color: spokenColor } : undefined}>{w}</span>
            ))}
          </div>
        )}
        <button
          className="show-words-btn"
          onPointerDown={() => setShowWords(true)}
          onPointerUp={() => setShowWords(false)}
          onPointerLeave={() => setShowWords(false)}
          onPointerCancel={() => setShowWords(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {showWords ? 'Wörter sichtbar' : 'Wörter zeigen'}
        </button>
      </div>

      {/* Progress indicator */}
      <div className="grid-hud">
        <span className="grid-hud-label">{filledCells}/{totalCells} Zellen</span>
        <button className="grid-reset-btn" onClick={reset}>Level zurücksetzen</button>
      </div>

      {/* Canvas */}
      <div ref={wrapperRef} className="game-canvas-wrapper" style={{ aspectRatio: `${level.cols} / ${level.rows}` }}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      {/* Win banner */}
      {won && (
        <div className="result-banner success">
          <div className="result-title">Richtig!</div>
          {level.lines.map((l, i) => (
            <div key={i} className="result-sentence" style={{ color: l.color }}>{l.sentence}</div>
          ))}
        </div>
      )}

      {/* Listen buttons per line */}
      {!won && (
        <div className="listen-row">
          {level.lines.map(l => {
            const path = lines[l.color];
            const hasWords = path && path.length >= 2;
            return (
              <button key={l.color} className="listen-btn-small" disabled={!hasWords}
                style={{ borderColor: hexRgba(l.color, hasWords ? 0.4 : 0.15), color: hasWords ? l.color : hexRgba(l.color, 0.3) }}
                onClick={() => {
                  if (!hasWords) return;
                  const words = path.map(([r,c]) => wordGrid[r][c]).filter(Boolean);
                  if (words.length > 0) { setSpokenWords(words); setSpokenColor(l.color); speak(words.join(' ')); logEvent?.(level.id, 'listen', { wordsHeard: words }); }
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/></svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
