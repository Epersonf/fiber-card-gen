import React, { useRef, useEffect } from 'react';

type Point = { x: number; y: number };

interface CurveEditorProps {
  points: Point[]; // normalized 0..1
  onChange: (pts: Point[]) => void;
  width?: number;
  height?: number;
}

export default function CurveEditor({ points, onChange, width = 240, height = 80 }: CurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingRef = useRef<number | null>(null);
  const POINT_RADIUS = 5;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const cssWidth = rect.width || width;
      const cssHeight = rect.height || height;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = '100%';
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // draw background (use CSS size coordinates)
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // draw curve (quadratic Bezier via points[0], points[1], points[2])
      ctx.strokeStyle = '#7aa7ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // ensure sampling points are also clamped to a small margin so curve cannot render outside
      const clampX = (v: number) => Math.min(cssWidth - POINT_RADIUS, Math.max(POINT_RADIUS, v));
      const clampY = (v: number) => Math.min(cssHeight - POINT_RADIUS, Math.max(POINT_RADIUS, v));
      const p0 = { x: clampX(points[0].x * cssWidth), y: clampY((1 - points[0].y) * cssHeight) };
      const p1 = { x: clampX(points[1].x * cssWidth), y: clampY((1 - points[1].y) * cssHeight) };
      const p2 = { x: clampX(points[2].x * cssWidth), y: clampY((1 - points[2].y) * cssHeight) };
      ctx.moveTo(p0.x, p0.y);
      // Render quadratic bezier by sampling
      const steps = 64;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;
        const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;
        const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // draw control points (ensure they remain visible within canvas)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      for (let i = 0; i < 3; i++) {
        const p = [p0, p1, p2][i];
        const cx = Math.min(cssWidth - POINT_RADIUS, Math.max(POINT_RADIUS, p.x));
        const cy = Math.min(cssHeight - POINT_RADIUS, Math.max(POINT_RADIUS, p.y));
        ctx.beginPath();
        ctx.arc(cx, cy, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    };

    // initial draw
    draw();

    // redraw on resize / layout change
    const onWinResize = () => draw();
    window.addEventListener('resize', onWinResize);
    // try ResizeObserver for more accurate container resize handling
    let ro: ResizeObserver | null = null;
    if ((window as any).ResizeObserver) {
      ro = new (window as any).ResizeObserver(() => draw());
      if (ro && canvas) ro.observe(canvas);
    }

    return () => {
      window.removeEventListener('resize', onWinResize);
      if (ro) ro.disconnect();
    };
  }, [points, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0, clientY = 0;
      if ((e as TouchEvent).touches && (e as TouchEvent).touches.length) {
        clientX = (e as TouchEvent).touches[0].clientX;
        clientY = (e as TouchEvent).touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      const pos = getPos(e);
      const rect2 = canvas.getBoundingClientRect();
      const cssW = rect2.width || width;
      const cssH = rect2.height || height;
      // find closest control point (in CSS pixels)
      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < 3; i++) {
        const px = points[i].x * cssW;
        const py = (1 - points[i].y) * cssH;
        const d = Math.hypot(px - pos.x, py - pos.y);
        if (d < bestDist) { best = i; bestDist = d; }
      }
      // require selection to be within a reasonable radius (use POINT_RADIUS*2)
      if (bestDist < POINT_RADIUS * 2) {
        draggingRef.current = best;
      }
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (draggingRef.current === null) return;
      const pos = getPos(e);
      const rect2 = canvas.getBoundingClientRect();
      const cssW = rect2.width || width;
      const cssH = rect2.height || height;
      // keep control points at least `POINT_RADIUS` pixels away from the canvas edges so they're always visible
      const minX = POINT_RADIUS / cssW;
      const maxX = 1 - minX;
      const minY = POINT_RADIUS / cssH;
      const maxY = 1 - minY;
      const nxRaw = pos.x / cssW;
      const nyRaw = 1 - pos.y / cssH;
      const nx = Math.min(maxX, Math.max(minX, nxRaw));
      const ny = Math.min(maxY, Math.max(minY, nyRaw));
      const newPts = points.map((p, i) => i === draggingRef.current ? { x: nx, y: ny } : p);
      onChange(newPts);
    };

    const onUp = () => { draggingRef.current = null; };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onDown as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('touchend', onUp);
    };
  }, [points, onChange, width, height]);

  return (
    <canvas ref={canvasRef} style={{ display: 'block', touchAction: 'none', cursor: 'crosshair' }} />
  );
}
