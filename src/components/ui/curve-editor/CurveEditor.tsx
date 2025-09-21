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

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // draw background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(0, 0, width, height);

    // draw curve (quadratic Bezier via points[0], points[1], points[2])
    ctx.strokeStyle = '#7aa7ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const p0 = { x: points[0].x * width, y: (1 - points[0].y) * height };
    const p1 = { x: points[1].x * width, y: (1 - points[1].y) * height };
    const p2 = { x: points[2].x * width, y: (1 - points[2].y) * height };
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

    // draw control points
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    for (let i = 0; i < 3; i++) {
      const p = [p0, p1, p2][i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
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
      // find closest control point
      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < 3; i++) {
        const px = points[i].x * width;
        const py = (1 - points[i].y) * height;
        const d = Math.hypot(px - pos.x, py - pos.y);
        if (d < bestDist) { best = i; bestDist = d; }
      }
      if (bestDist < 12) {
        draggingRef.current = best;
      }
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (draggingRef.current === null) return;
      const pos = getPos(e);
      const nx = Math.min(1, Math.max(0, pos.x / width));
      const ny = Math.min(1, Math.max(0, 1 - pos.y / height));
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
