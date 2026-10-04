import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveal elements marked with [data-reveal] once they enter the viewport.
 * Adds the `is-visible` class; CSS handles the transition.
 */
export function useRevealOnScroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const nodes = root.querySelectorAll('[data-reveal]');

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [rootRef]);
}

/** Animate a number from 0 to `end` the first time the element is visible. */
export function useCountUp(end, { duration = 1400, decimals = 0 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(prefersReducedMotion() ? end : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) {
      setValue(end);
      return undefined;
    }
    let raf;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(end * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [end, duration]);

  return [ref, Number(value.toFixed(decimals))];
}
