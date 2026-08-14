import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

/**
 * Animate a number toward `target`, starting from zero on mount so totals
 * visibly climb into place. Every update runs inside a frame callback, never
 * synchronously during the effect.
 */
export default function useCountUp(target, duration = 750) {
  const [value, setValue] = useState(0);
  // Tracks what is actually on screen, so a target that changes mid-animation
  // resumes from the current position instead of snapping to the old target.
  const shownRef = useRef(0);

  useEffect(() => {
    const to = Number(target) || 0;
    const from = shownRef.current;
    if (from === to) return undefined;

    const settle = (next) => {
      shownRef.current = next;
      setValue(next);
    };

    if (prefersReducedMotion()) {
      const id = requestAnimationFrame(() => settle(to));
      return () => cancelAnimationFrame(id);
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      settle(from + (to - from) * easeOutCubic(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
