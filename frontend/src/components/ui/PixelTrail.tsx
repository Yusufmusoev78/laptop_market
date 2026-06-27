import React, { useEffect, useRef } from 'react';
import { MotionValue } from 'framer-motion';
import './PixelTrail.css';

interface PixelTrailProps {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  cellSize?: number;
  fadeMs?: number;
  color?: string;
}

export const PixelTrail: React.FC<PixelTrailProps> = ({
  mx, my, cellSize = 26, fadeMs = 420, color = '99,102,241',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cssW = window.innerWidth;
    let cssH = window.innerHeight;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = window.innerWidth;
      cssH = window.innerHeight;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    /* key "gx,gy" -> timestamp last touched */
    const cells = new Map<string, number>();

    const touch = (x: number, y: number) => {
      const gx = Math.floor(x / cellSize);
      const gy = Math.floor(y / cellSize);
      cells.set(`${gx},${gy}`, performance.now());
    };

    const unsubX = mx.on('change', v => touch(v, my.get()));
    const unsubY = my.on('change', v => touch(mx.get(), v));

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH);
      const now = performance.now();
      cells.forEach((born, key) => {
        const age = now - born;
        if (age > fadeMs) { cells.delete(key); return; }
        const [gx, gy] = key.split(',').map(Number);
        const alpha = (1 - age / fadeMs) * 0.45;
        const pad = 3;
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fillRect(gx * cellSize + pad, gy * cellSize + pad, cellSize - pad * 2, cellSize - pad * 2);
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      unsubX();
      unsubY();
    };
  }, [mx, my, cellSize, fadeMs, color]);

  return <canvas ref={canvasRef} className="pixel-trail-canvas" />;
};
