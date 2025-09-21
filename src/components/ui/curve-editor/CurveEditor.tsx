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
  const selectedRef = useRef<number | null>(null);
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

      // draw curve (smooth through N points). If <2 points, nothing to draw.
      ctx.strokeStyle = '#7aa7ff';
      ctx.lineWidth = 2;
      if (points.length >= 2) {
        // compute clamped canvas-space points
        const clampX = (v: number) => Math.min(cssWidth - POINT_RADIUS, Math.max(POINT_RADIUS, v));
        const clampY = (v: number) => Math.min(cssHeight - POINT_RADIUS, Math.max(POINT_RADIUS, v));
        const pts = points.map(p => ({ x: clampX(p.x * cssWidth), y: clampY((1 - p.y) * cssHeight) }));

        ctx.beginPath();
        // move to first
        ctx.moveTo(pts[0].x, pts[0].y);
        // use quadratic smoothing: for each segment use midpoint as end point and previous point as control
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1];
          const cur = pts[i];
          const midX = (prev.x + cur.x) / 2;
          const midY = (prev.y + cur.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        // finish to last point
        const last = pts[pts.length - 1];
        const secondLast = pts[pts.length - 2];
        ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
        ctx.stroke();
      }

      // draw control points (ensure they remain visible within canvas)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      // draw control points for all points
      const drawPts = points.map(p => ({ x: Math.min(cssWidth - POINT_RADIUS, Math.max(POINT_RADIUS, p.x * cssWidth)), y: Math.min(cssHeight - POINT_RADIUS, Math.max(POINT_RADIUS, (1 - p.y) * cssHeight)) }));
      for (let i = 0; i < drawPts.length; i++) {
        const p = drawPts[i];
        ctx.beginPath();
        if (selectedRef.current === i) {
          // highlight selected point
          ctx.fillStyle = '#7aa7ff';
          ctx.strokeStyle = '#003a8c';
          ctx.arc(p.x, p.y, POINT_RADIUS + 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // reset styles for others
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
        } else {
          ctx.arc(p.x, p.y, POINT_RADIUS, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    };

  // initial draw
  draw();

  // redraw on resize / layout change
  const onWinResize = () => draw();
  const onInvalidate = () => draw();
    window.addEventListener('resize', onWinResize);
    // try ResizeObserver for more accurate container resize handling
    let ro: ResizeObserver | null = null;
    if ((window as any).ResizeObserver) {
      ro = new (window as any).ResizeObserver(() => draw());
      if (ro && canvas) ro.observe(canvas);
    }
    window.addEventListener('curveeditor:invalidate', onInvalidate as EventListener);
  // double-click to add point (if not near existing point)
    const onDbl = (ev: MouseEvent) => {
      const rect2 = canvas.getBoundingClientRect();
      const cssW = rect2.width || width;
      const cssH = rect2.height || height;
      const x = ev.clientX - rect2.left;
      const y = ev.clientY - rect2.top;
      // find closest existing point
      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < points.length; i++) {
        const px = points[i].x * cssW;
        const py = (1 - points[i].y) * cssH;
        const d = Math.hypot(px - x, py - y);
        if (d < bestDist) { best = i; bestDist = d; }
      }
      // if near existing point, delete it
      if (bestDist < POINT_RADIUS * 1.5 && best >= 0) {
        const next = points.filter((_, i) => i !== best);
        onChange(next);
        selectedRef.current = null;
        return;
      }
      // otherwise insert new point (normalized coords)
      const nx = Math.min(1, Math.max(0, x / cssW));
      const ny = Math.min(1, Math.max(0, 1 - y / cssH));
      const next = [...points, { x: nx, y: ny }].sort((a, b) => a.x - b.x);
      onChange(next);
    };
    canvas.addEventListener('dblclick', onDbl);

    const onKey = (ev: KeyboardEvent) => {
      if (!selectedRef.current && selectedRef.current !== 0) return;
      if (ev.key === 'Delete' || ev.key === 'Backspace') {
        const idx = selectedRef.current as number;
        if (idx >= 0 && idx < points.length) {
          const next = points.filter((_, i) => i !== idx);
          selectedRef.current = null;
          onChange(next);
        }
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('resize', onWinResize);
      window.removeEventListener('curveeditor:invalidate', onInvalidate as EventListener);
      if (ro) ro.disconnect();
      canvas.removeEventListener('dblclick', onDbl);
      window.removeEventListener('keydown', onKey);
    };
  }, [points, width, height, onChange]);

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
      for (let i = 0; i < points.length; i++) {
        const px = points[i].x * cssW;
        const py = (1 - points[i].y) * cssH;
        const d = Math.hypot(px - pos.x, py - pos.y);
        if (d < bestDist) { best = i; bestDist = d; }
      }
      // require selection to be within a reasonable radius (use POINT_RADIUS*2)
      if (bestDist < POINT_RADIUS * 2) {
        draggingRef.current = best;
        selectedRef.current = best;
      } else {
        selectedRef.current = null;
      }
      // redraw immediately to show selection
      window.dispatchEvent(new Event('curveeditor:invalidate'));
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
