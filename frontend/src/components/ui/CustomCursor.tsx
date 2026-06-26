import React, { useEffect, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import './CustomCursor.css';

export const CustomCursor: React.FC = () => {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  /* Dot — fast, near-instant */
  const dotX = useSpring(mx, { damping: 50, stiffness: 900, mass: 0.2 });
  const dotY = useSpring(my, { damping: 50, stiffness: 900, mass: 0.2 });

  /* Ring — medium lag */
  const ringX = useSpring(mx, { damping: 28, stiffness: 280, mass: 0.6 });
  const ringY = useSpring(my, { damping: 28, stiffness: 280, mass: 0.6 });

  /* Glow — heavy lag */
  const glowX = useSpring(mx, { damping: 22, stiffness: 140, mass: 1.0 });
  const glowY = useSpring(my, { damping: 22, stiffness: 140, mass: 1.0 });

  const [state, setState] = useState<'default' | 'hover' | 'click'>('default');

  const [isTouchDevice] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );

  const onMove = useCallback((e: MouseEvent) => {
    mx.set(e.clientX);
    my.set(e.clientY);
  }, [mx, my]);

  const onOver = useCallback((e: MouseEvent) => {
    const el = e.target as HTMLElement;
    const interactive = el.closest('button, a, input, [role="button"], .laptop-card, .filter-btn, .hero-mini-card, .hero-card-btn, .back-btn');
    setState(interactive ? 'hover' : 'default');
  }, []);

  const onDown = useCallback(() => setState('click'), []);
  const onUp   = useCallback(() => setState('default'), []);

  useEffect(() => {
    if (isTouchDevice) return;
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isTouchDevice, onMove, onOver, onDown, onUp]);

  if (isTouchDevice) return null;

  const isHover = state === 'hover';
  const isClick = state === 'click';

  return (
    <>
      {/* ── Background spotlight (behind everything) ── */}
      <motion.div
        className="cursor-bg-spotlight"
        style={{ x: glowX, y: glowY }}
        animate={{
          scale:   isHover ? 1.6 : isClick ? 0.9 : 1,
          opacity: isHover ? 0.7 : isClick ? 0.9 : 0.5,
        }}
        transition={{ type: 'spring', damping: 18, stiffness: 120 }}
      />

      {/* ── Glow layer (heaviest lag) ── */}
      <motion.div
        className="cursor-glow"
        style={{ x: glowX, y: glowY }}
        animate={{
          scale: isHover ? 2.5 : isClick ? 0.8 : 1,
          opacity: isHover ? 0.18 : isClick ? 0.35 : 0.1,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      />

      {/* ── Ring (medium lag) ── */}
      <motion.div
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale:       isClick ? 0.7 : isHover ? 1.6 : 1,
          opacity:     isClick ? 1   : isHover ? 0.9 : 0.75,
          borderColor: isHover
            ? 'rgba(139,92,246,0.95)'
            : isClick
              ? 'rgba(251,191,36,0.95)'
              : 'rgba(99,102,241,0.85)',
          backgroundColor: isHover
            ? 'rgba(139,92,246,0.08)'
            : isClick
              ? 'rgba(251,191,36,0.12)'
              : 'transparent',
        }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      />

      {/* ── Dot (fastest) ── */}
      <motion.div
        className="cursor-dot"
        style={{ x: dotX, y: dotY }}
        animate={{
          scale:           isClick ? 2.2 : isHover ? 0.4 : 1,
          backgroundColor: isClick
            ? 'rgba(251,191,36,1)'
            : isHover
              ? 'rgba(139,92,246,1)'
              : 'rgba(99,102,241,1)',
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 700 }}
      />
    </>
  );
};
