import { useMemo } from 'react';

// Flat, hand-drawn "microscope field": an H&E-stained tissue section inside a circular viewport,
// with crosshair, scale bar and slide labels. Pure SVG, no animation loop, no 3D.
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function HeroField() {
  const cells = useMemo(() => {
    const r = rng(11);
    const out = [];
    const step = 46;
    for (let y = 40; y < 460; y += step) {
      for (let x = 40; x < 460; x += step) {
        const cx = x + (r() - 0.5) * 30 + (Math.round((y - 40) / step) % 2) * 12;
        const cy = y + (r() - 0.5) * 30;
        const size = 17 + r() * 9;
        out.push({
          cx, cy, size,
          rot: r() * 180,
          nx: (r() - 0.5) * 6, ny: (r() - 0.5) * 6,
          ns: 0.5 + r() * 0.18,
          dots: Array.from({ length: 4 }, () => [(r() - 0.5) * 8, (r() - 0.5) * 8])
        });
      }
    }
    const rbc = Array.from({ length: 22 }, () => ({ x: 30 + r() * 440, y: 30 + r() * 440, s: 5 + r() * 3 }));
    return { cells: out, rbc };
  }, []);

  return (
    <figure className="hero-field" aria-hidden="true">
      <svg viewBox="-16 -16 532 532" focusable="false">
        <defs>
          <clipPath id="hf-clip"><circle cx="250" cy="250" r="232" /></clipPath>
          <filter id="hf-wobble" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
          </filter>
          <pattern id="hf-fibre" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="#e9a9c2" strokeWidth="1.2" />
          </pattern>
        </defs>

        <circle cx="250" cy="250" r="244" className="hf-rim" />
        <g clipPath="url(#hf-clip)">
          <rect width="500" height="500" className="hf-eosin" />
          <rect width="500" height="500" fill="url(#hf-fibre)" opacity="0.55" />
          <g filter="url(#hf-wobble)">
            {cells.cells.map((c, i) => (
              <g key={i} transform={`translate(${c.cx} ${c.cy}) rotate(${c.rot})`}>
                <ellipse rx={c.size} ry={c.size * 0.82} className="hf-cell" />
                <ellipse cx={c.nx} cy={c.ny} rx={c.size * c.ns} ry={c.size * c.ns * 0.85} className="hf-nucleus" />
                {c.dots.map(([dx, dy], k) => <circle key={k} cx={c.nx + dx} cy={c.ny + dy} r="1.6" className="hf-chrom" />)}
              </g>
            ))}
            {cells.rbc.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.s} className="hf-rbc" />)}
          </g>
          <circle cx="250" cy="250" r="232" className="hf-vignette" />
        </g>
        <circle cx="250" cy="250" r="232" className="hf-ring" />

        {/* crosshair */}
        <g className="hf-cross">
          <line x1="250" y1="212" x2="250" y2="238" /><line x1="250" y1="262" x2="250" y2="288" />
          <line x1="212" y1="250" x2="238" y2="250" /><line x1="262" y1="250" x2="288" y2="250" />
        </g>
        {/* ruler ticks around the viewport */}
        <g className="hf-ticks">
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i * 5 * Math.PI) / 180;
            const long = i % 6 === 0;
            const r1 = 246, r2 = long ? 258 : 253;
            return <line key={i} x1={250 + r1 * Math.cos(a)} y1={250 + r1 * Math.sin(a)} x2={250 + r2 * Math.cos(a)} y2={250 + r2 * Math.sin(a)} />;
          })}
        </g>
      </svg>
      <figcaption className="hf-cap"><b>H&amp;E</b> · 400× <span className="hf-bar" /> 50 µm</figcaption>
    </figure>
  );
}
