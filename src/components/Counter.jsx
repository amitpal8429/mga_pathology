import { useEffect, useState } from 'react';
import { useInView } from '../hooks/useInView';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

// Counts up to `value` the first time it is visible. The final number is always what screen readers and tests see.
export default function Counter({ value, suffix = '', duration = 1100 }) {
  const [ref, seen] = useInView({ threshold: 0.4 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen) return undefined;
    if (reduced() || typeof requestAnimationFrame === 'undefined') {
      setN(value);
      return undefined;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value, duration]);

  return (
    <span ref={ref} aria-label={`${value}${suffix}`}>
      <span aria-hidden="true">{n}{suffix}</span>
    </span>
  );
}
