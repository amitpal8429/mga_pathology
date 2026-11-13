import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPathologyCourses, getPathologyFaculty } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../hooks/useSeo';
import CourseCard from '../components/CourseCard';
import FacultyCard from '../components/FacultyCard';
import SectionHead from '../components/SectionHead';
import HeroField from '../components/HeroField';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import Counter from '../components/Counter';
import Marquee from '../components/Marquee';
import { ErrorState, Skeletons } from '../components/States';
import { SITE } from '../config/site';
import { FAQ } from '../content/faq';
import { typePlural } from '../utils/format';
import { focusAreas } from '../utils/pathology';

const LEVEL_BLURB = {
  Fellowship: 'Advanced, case-based training for pathologists who want to go deep.',
  'Pg Diploma': 'Structured one-year diplomas in pathology and laboratory medicine.',
  Certificate: 'Focused programs that sharpen core laboratory skills.'
};

const DISCIPLINES = [
  { icon: 'flask', title: 'Histopathology', text: 'Tissue processing, staining, frozen sections and diagnostic reporting.', q: 'histolog' },
  { icon: 'book', title: 'Cytopathology', text: 'Cytology smears, FNAC interpretation and cancer screening reports.', q: 'cytolog' },
  { icon: 'heart', title: 'Hematology & transfusion', text: 'Blood disorders, blood banking, transfusion safety and coagulation.', q: 'hemat' },
  { icon: 'cube', title: 'Molecular & genetic', text: 'Molecular diagnostics, cytogenetics and immunohistochemistry.', q: 'molecular' }
];

const WHY = [
  { icon: 'laptop', title: 'Live + recorded classes', text: 'Interactive sessions and recordings, with e-books, notes and case discussions built around your lab and shifts.', cls: 'w-big p0' },
  { icon: 'shield', title: 'CPD UK & ACTD accredited', text: 'Programs aligned with global standards.', cls: 'p2' },
  { icon: 'users', title: 'One-year mentorship', text: 'Ask questions long after the class ends.', cls: 'p1' },
  { icon: 'award', title: 'Assessment & certification', text: 'A final assessment and an MCQ-based exam lead to your certificate.', cls: 'p3' },
  { icon: 'check', title: 'No-cost EMI options', text: 'Flexible payment plans on selected programs.', cls: 'p0' }
];

const HOW_STEPS = [
  ['Choose & enrol', 'Pick a fellowship or PG diploma, with flexible payment and no-cost EMI options.'],
  ['Learn your way', 'Join live interactive sessions or watch recordings, with e-books, notes and case-based learning.'],
  ['Get mentored', 'Learn from experienced pathologists and use one-year mentorship for questions beyond class.'],
  ['Assess & certify', 'Complete the final assessment and MCQ-based exam to receive your certification.']
];

/* ============ prefers-reduced-motion hook ============ */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

/* ============ viewport visibility hook ============ */
function useInViewport(ref, rootMargin = '200px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/* ==================== REAL 3D TILT ==================== */
function useTilt({ max = 15, scale = 1.03, glare = true } = {}) {
  const ref = useRef(null);
  const raf = useRef(0);
  const state = useRef({ rx: 0, ry: 0, active: false });
  const reduced = usePrefersReducedMotion();

  const apply = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { rx, ry, active } = state.current;
    if (!active) {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      el.style.boxShadow = '';
      const g = el.querySelector('.tilt-glare');
      if (g) g.style.opacity = '0';
      return;
    }
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
    el.style.boxShadow = `${-ry * 2}px ${rx * 2}px 50px -10px rgba(75,53,151,.35), 0 0 0 1px rgba(217,76,122,.22)`;
  }, [scale]);

  const onMove = useCallback((e) => {
    if (reduced) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      state.current.rx = (0.5 - y) * max * 2;
      state.current.ry = (x - 0.5) * max * 2;
      state.current.active = true;
      apply();
      if (glare) {
        const g = el.querySelector('.tilt-glare');
        if (g) {
          g.style.opacity = '1';
          g.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.35), transparent 60%)`;
        }
      }
    });
  }, [max, apply, glare, reduced]);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    state.current.active = false;
    apply();
  }, [apply]);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave, { passive: true });
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [onMove, onLeave, reduced]);

  return ref;
}

function Tilt3D({ children, max = 15, scale = 1.03, glare = true, style, className = '' }) {
  const ref = useTilt({ max, scale, glare });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform .18s cubic-bezier(.22,.61,.36,1), box-shadow .18s ease-out',
        willChange: 'transform',
        position: 'relative',
        height: '100%',
        ...style
      }}
    >
      {children}
      {glare && (
        <div
          className="tilt-glare"
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            pointerEvents: 'none', opacity: 0, transition: 'opacity .2s',
            mixBlendMode: 'overlay', zIndex: 2
          }}
        />
      )}
    </div>
  );
}

/* ==================== PARALLAX HOOK ==================== */
function useParallax(containerRef) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const reduced = usePrefersReducedMotion();
  const inView = useInViewport(containerRef);

  useEffect(() => {
    if (reduced || !inView) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setPos({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2
        });
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced, inView]);

  return pos;
}

/* ==================== FLOATING PARTICLES ==================== */
const Particles = (() => {
  const makeItems = () => {
    let seed = 42;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 4 + rand() * 10,
      delay: rand() * 8,
      duration: 8 + rand() * 10,
      opacity: 0.15 + rand() * 0.35
    }));
  };
  const ITEMS = makeItems();

  return function ParticlesInner() {
    const reduced = usePrefersReducedMotion();
    if (reduced) return null;
    return (
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
      >
        {ITEMS.map((p) => (
          <span
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.id % 3 === 0
                ? 'radial-gradient(circle, #d94c7a 0%, transparent 70%)'
                : p.id % 3 === 1
                ? 'radial-gradient(circle, #4b3597 0%, transparent 70%)'
                : 'radial-gradient(circle, #4c9a8a 0%, transparent 70%)',
              opacity: p.opacity,
              animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`
            }}
          />
        ))}
      </div>
    );
  };
})();

/* ==================== 3D STYLES ==================== */
const ThreeDStyles = () => (
  <style>{`
    .scene-3d { perspective: 1400px; perspective-origin: 50% 40%; }
    .scene-3d > * { transform-style: preserve-3d; }

    @keyframes particleFloat {
      0%   { transform: translate(0, 0) scale(1); opacity: .2; }
      50%  { transform: translate(30px, -60px) scale(1.3); opacity: .6; }
      100% { transform: translate(0, 0) scale(1); opacity: .2; }
    }
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
    @keyframes shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    @keyframes counterPop {
      0%   { transform: scale(0.85); opacity: 0; }
      60%  { transform: scale(1.06); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }

    .hero-3d-bg {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, #faf6f0 0%, #f0e7ef 35%, #e6e0f5 65%, #faf6f0 100%);
      background-size: 300% 300%;
      animation: gradientShift 16s ease infinite;
      z-index: 0;
    }
    .hero-3d-bg::before, .hero-3d-bg::after {
      content: ''; position: absolute; border-radius: 50%;
      filter: blur(90px); opacity: .42;
      will-change: transform;
    }
    .hero-3d-bg::before {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #d94c7a 0%, transparent 70%);
      top: -180px; right: -100px;
      animation: gradientShift 14s ease-in-out infinite alternate;
    }
    .hero-3d-bg::after {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #4b3597 0%, transparent 70%);
      bottom: -180px; left: -120px;
      animation: gradientShift 18s ease-in-out infinite alternate-reverse;
    }

    .hero-3d-card {
      background: rgba(255,255,255,0.86);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,0.65);
      border-radius: 22px;
      padding: 20px;
      box-shadow: 0 20px 50px -20px rgba(75,53,151,.35), 0 0 0 1px rgba(255,255,255,.5) inset;
      transform-style: preserve-3d;
      position: relative;
      z-index: 1;
    }

    .hero-stats b {
      animation: counterPop .8s cubic-bezier(.22,.61,.36,1) backwards;
      display: inline-block;
      font-variant-numeric: tabular-nums;
    }

    .hero h1 em {
      display: inline-block;
      background: linear-gradient(120deg, #d94c7a 0%, #4b3597 100%);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientShift 8s ease infinite;
      background-size: 200% 200%;
    }

    .tilt-inner-3d { transform-style: preserve-3d; }
    .tilt-inner-3d .fi,
    .tilt-inner-3d .big { transition: transform .3s cubic-bezier(.22,.61,.36,1); }
    .tilt-inner-3d:hover .fi { transform: translateZ(28px) scale(1.1); }
    .tilt-inner-3d:hover .big { transform: translateZ(18px); }

    .level-card {
      background: rgba(255,255,255,0.9) !important;
      backdrop-filter: blur(8px);
      border-radius: 16px !important;
      transform-style: preserve-3d;
    }

    .bento-tile { backdrop-filter: blur(6px); transform-style: preserve-3d; }
    .bento-tile .fi { transition: transform .3s cubic-bezier(.22,.61,.36,1); }
    .tilt-inner-3d:hover .fi { transform: translateZ(28px) scale(1.12); }

    .stage { transform-style: preserve-3d; }
    .stage .fi { transition: transform .3s ease, background .3s, color .3s; }

    .fac-card-3d {
      background: rgba(255,255,255,0.94);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      padding: 26px 20px;
      text-align: center;
      transform-style: preserve-3d;
    }
    .fac-card-3d .fac-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg, #e6e0f5, #fce7ed);
      color: var(--hema-d);
      display: grid; place-items: center; margin: 0 auto 16px;
      font-size: 2rem; font-weight: 500;
      transition: transform .3s cubic-bezier(.22,.61,.36,1);
    }
    .tilt-inner-3d:hover .fac-avatar { transform: translateZ(20px) scale(1.05); }

    .shimmer-line {
      position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, #d94c7a, transparent);
      overflow: hidden;
    }
    .shimmer-line::after {
      content: ''; position: absolute; top: 0; left: 0;
      width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, #fff, transparent);
      animation: shimmer 2.6s cubic-bezier(.4,0,.2,1) infinite;
    }

    .app-promo {
      transform-style: preserve-3d;
      background: linear-gradient(135deg, #2f2070 0%, #4b3597 60%, #2f2070 100%) !important;
      background-size: 200% 200% !important;
      animation: gradientShift 12s ease infinite;
    }

    .hero-search { transition: box-shadow .2s, transform .3s cubic-bezier(.22,.61,.36,1); }
    .hero-search:focus-within {
      box-shadow: 0 0 0 4px rgba(75,53,151,.2), 0 18px 40px -12px rgba(75,53,151,.4);
      transform: translateY(-2px);
    }

    .chip { transition: all .25s cubic-bezier(.22,.61,.36,1); }
    .chip:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 24px -8px rgba(26,20,43,.3);
      background: var(--ink); color: #fff; border-color: var(--ink);
    }

    .round-btn { transition: all .25s cubic-bezier(.22,.61,.36,1); }
    .round-btn:hover {
      transform: scale(1.08) translateY(-2px) rotate(2deg);
      box-shadow: 0 14px 28px -8px rgba(26,20,43,.4);
    }

    .trust li { transition: all .25s cubic-bezier(.22,.61,.36,1); }
    .trust li:hover {
      background: linear-gradient(90deg, transparent, rgba(217,76,122,.08));
      transform: translateX(4px);
    }

    .home-fade-in { animation: fadeUp .4s cubic-bezier(.22,.61,.36,1) both; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `}</style>
);

export default function Home() {
  useSeo({
    description: 'Histopathology, cytopathology, hematology and laboratory medicine fellowships and PG diplomas, taught online by practising pathologists at Medical Global Academy.',
    path: '/'
  });
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const rail = useRef(null);
  const heroRef = useRef(null);
  const parallax = useParallax(heroRef);
  const { data, error, loading, retry } = useAsync(
    () => Promise.all([getPathologyCourses(), getPathologyFaculty()]),
    []
  );

  const view = useMemo(() => {
    if (!data) return null;
    const [courses, faculty] = data;
    const byType = courses.reduce((m, c) => ((m[c.type] = (m[c.type] || 0) + 1), m), {});
    const areas = focusAreas(courses);
    const top = courses.filter((c) => Number(c.top_courses) === 1);
    const featured = [...top, ...courses.filter((c) => Number(c.top_courses) !== 1)].slice(0, 9);
    const facPick = [...faculty.filter((f) => f.image_url), ...faculty.filter((f) => !f.image_url)].slice(0, 8);
    return { courses, faculty, byType, areas, featured, facPick };
  }, [data]);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/courses?q=${encodeURIComponent(q.trim())}` : '/courses');
  };
  const scrollRail = (dir) => rail.current?.scrollBy({ left: dir * 360, behavior: 'smooth' });

  return (
    <>
      <ThreeDStyles />

      {/* HERO */}
      <section className="hero" ref={heroRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-3d-bg" />
        <Particles />
        <div
          className="container hero-grid"
          style={{
            position: 'relative',
            zIndex: 2,
            transform: `translate3d(${parallax.x * 6}px, ${parallax.y * 6}px, 0)`,
            transition: 'transform .35s cubic-bezier(.22,.61,.36,1)'
          }}
        >
          <div className="hero-copy">
            <span className="pill-label"><Icon name="flask" size={14} /> Pathology department · Medical Global Academy</span>
            <h1>Master the science behind every <em>diagnosis</em></h1>
            <p className="hero-lead">
              Online fellowships and PG diplomas in histopathology, cytopathology, hematology and transfusion medicine, taught by practising
              pathologists around your lab and clinical schedule.
            </p>
            <form className="hero-search" onSubmit={onSearch} role="search">
              <label htmlFor="hero-q" style={{ position: 'absolute', left: -9999 }}>Search pathology courses</label>
              <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try histopathology, cytology, hematology…" />
              <button className="btn btn-primary" type="submit"><Icon name="search" size={18} /> Search</button>
            </form>
            <div className="hero-quick">
              <span>Popular:</span>
              {(view?.areas.slice(0, 4).map((a) => a.label) || ['Histopathology', 'Cytopathology', 'Hematology', 'Clinical Pathology']).map((t) => (
                <Link key={t} className="chip" to={`/courses?area=${encodeURIComponent(t)}`}>{t}</Link>
              ))}
            </div>
          </div>

          {/* 🔴 SINGLE HERO VISUAL: Logo at top, Certificates, & 2 Images below */}
          <div
            className="hero-visual"
            style={{
              transform: `translate3d(${parallax.x * -14}px, ${parallax.y * -14}px, 0)`,
              transition: 'transform .35s cubic-bezier(.22,.61,.36,1)'
            }}
          >
            <Tilt3D max={12} scale={1.02}>
              <div className="hero-3d-card" style={{ padding: '20px' }}>
                
                {/* 1. Logo at Top */}
                <div className="hero-logo-top">
                  <img 
                    src="https://medicalglobalacademy.com/wp-content/uploads/2026/09/Untitled-design-8.png" 
                    alt="MGA Logo" 
                  />
                </div>

                {/* 2. Two Certificates Side-by-Side */}
                <div className="hero-certs-grid">
                  <img 
                    src="https://medicalglobalacademy.com/wp-content/uploads/2026/10/WhatsApp-Image-2026-10-17-at-10.15.41-AM.jpeg" 
                    alt="MGA CPD Certificate" 
                    loading="lazy" 
                  />
                  <img 
                    src="https://medicalglobalacademy.com/wp-content/uploads/2026/10/WhatsApp-Image-2026-10-17-at-5.58.43-PM.jpeg" 
                    alt="MGA ACTD Certificate" 
                    loading="lazy" 
                  />
                </div>

                {/* 3. Two New Images Side-by-Side below certificates */}
                <div className="hero-certs-grid" style={{ marginTop: '16px' }}>
                  <img 
                    src="https://medicalglobalacademy.com/wp-content/uploads/2026/09/Untitled-design-8.png" 
                    alt="MGA Design" 
                    loading="lazy" 
                  />
                  <img 
                    src="https://medicalglobalacademy.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-24-at-12.17.06-PM.jpeg" 
                    alt="MGA WhatsApp Image" 
                    loading="lazy" 
                  />
                </div>

                <div className="shimmer-line" />
              </div>
            </Tilt3D>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="container">
        <div className="trust">
          <ul>
            <li><Icon name="shield" size={18} /> CPD UK &amp; ACTD accredited</li>
            <li><Icon name="laptop" size={18} /> Live + recorded classes</li>
            <li><Icon name="users" size={18} /> One-year mentorship</li>
            <li><Icon name="check" size={18} /> No-cost EMI options</li>
          </ul>
        </div>
      </div>

      {error && <div className="container section"><ErrorState error={error} onRetry={retry} /></div>}

      {view && <Marquee items={view.areas} />}

      {/* LEVELS */}
      <section className="section" style={{ position: 'relative' }}>
        <div className="container">
          <Reveal><SectionHead eyebrow="Programs" title="Choose your level" text="Every program runs online with live sessions, recorded lectures, case discussions and assessments." /></Reveal>
          <div className="levels scene-3d">
            {loading && <Skeletons count={2} height={190} />}
            {view && Object.entries(view.byType).map(([type, n], i) => (
              <Reveal key={type} delay={i * 90}>
                <Tilt3D max={15} scale={1.04}>
                  <Link to={`/courses?type=${encodeURIComponent(type)}`} className={`level-card tilt-inner-3d p${i % 4}`}>
                    <div className="big"><Counter value={n} /></div>
                    <h3>{typePlural(type)}</h3>
                    <p>{LEVEL_BLURB[type] || 'Explore programs'}</p>
                    <span className="go">Browse <Icon name="arrow" size={16} /></span>
                    <div className="shimmer-line" />
                  </Link>
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOCUS AREAS */}
      {view && view.areas.length > 0 && (
        <section className="section">
          <div className="container">
            <Reveal><SectionHead eyebrow="Focus areas" title="Find your pathology speciality" /></Reveal>
            <Reveal className="bubbles scene-3d">
              {view.areas.map((a, i) => (
                <Tilt3D key={a.label} max={10} scale={1.06} style={{ height: 'auto', width: 'auto', display: 'inline-block' }}>
                  <Link className={`bubble p${i % 4}`} to={`/courses?area=${encodeURIComponent(a.label)}`}>
                    {a.label}<span>{a.count}</span>
                  </Link>
                </Tilt3D>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* COURSES RAIL */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Courses"
              title="Pathology programs"
              action={
                <div className="rail-controls">
                  <button className="round-btn flip" aria-label="Previous" onClick={() => scrollRail(-1)}><Icon name="chevron" /></button>
                  <button className="round-btn" aria-label="Next" onClick={() => scrollRail(1)}><Icon name="chevron" /></button>
                </div>
              }
            />
          </Reveal>
          <div className="rail scene-3d" ref={rail}>
            {loading && <Skeletons count={3} />}
            {view && view.featured.map((c) => (
              <div key={c.slug} style={{ flex: '0 0 min(350px, 84vw)' }}>
                <Tilt3D max={12} scale={1.03}>
                  <div className="tilt-inner-3d">
                    <CourseCard course={c} />
                  </div>
                </Tilt3D>
              </div>
            ))}
          </div>
          <div className="load-more"><Link className="btn btn-outline" to="/courses">View all pathology courses <Icon name="arrow" size={16} /></Link></div>
        </div>
      </section>

      {/* WHY MGA */}
      <section className="section">
        <div className="container">
          <Reveal><SectionHead eyebrow="Why learn with us" title="Built for working pathologists" text="Everything you need to study seriously without stepping away from your lab or practice." /></Reveal>
          <div className="bento scene-3d">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 70} className={`bento-tile ${w.cls}`}>
                <Tilt3D max={10} scale={1.02}>
                  <div className="tilt-inner-3d">
                    <span className="fi"><Icon name={w.icon} size={26} /></span>
                    <h3>{w.title}</h3>
                    <p>{w.text}</p>
                  </div>
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DISCIPLINES */}
      <section className="section">
        <div className="container">
          <Reveal><SectionHead eyebrow="Diagnostic disciplines" title="From tissue to report" text="Choose the discipline where your practice needs depth." /></Reveal>
          <div className="stages scene-3d">
            {DISCIPLINES.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <Tilt3D max={14} scale={1.03}>
                  <Link to={`/courses?q=${encodeURIComponent(s.q)}`} className={`stage tilt-inner-3d p${i % 4}`}>
                    <span className="fi"><Icon name={s.icon} size={24} /></span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    <span className="go">Explore <Icon name="arrow" size={16} /></span>
                  </Link>
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <Reveal><SectionHead eyebrow="How it works" title="From enrolment to certification" /></Reveal>
          <div className="steps scene-3d">
            {HOW_STEPS.map(([t, p], i) => (
              <Reveal key={t} delay={i * 90} className="step"><h3>{t}</h3><p>{p}</p></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FACULTY */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Our team"
              title="Meet the pathology faculty"
              text={view ? `${view.faculty.length} specialists teaching in the Pathology department.` : undefined}
              action={<Link className="btn btn-outline" to="/faculty">All faculty <Icon name="arrow" size={16} /></Link>}
            />
          </Reveal>
          <div className="grid-fac scene-3d">
            {loading && <Skeletons count={4} height={220} />}
            {view && view.facPick.map((f) => (
              <Tilt3D key={f.id} max={14} scale={1.03}>
                <div className="fac-card-3d tilt-inner-3d">
                  <FacultyCard faculty={f} />
                </div>
              </Tilt3D>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container faq-split">
          <Reveal>
            <span className="eyebrow">Questions</span>
            <h2>Good to know before you enrol</h2>
            <p className="small">Can't find your answer? Our team replies quickly.</p>
            <Link className="btn btn-outline" to="/support">Contact support <Icon name="arrow" size={16} /></Link>
          </Reveal>
          <Reveal className="faq-list" delay={100}>
            {FAQ.map(([qn, a]) => (
              <details key={qn}><summary>{qn}</summary><p>{a}</p></details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* PROMO & CTA */}
      <div className="container">
       

        <Reveal className="cta-band-3d cta-band">
          <h2>Not sure which program fits you?</h2>
          <p>Talk to our team. We will help you choose the pathology course that matches your qualification and goals.</p>
          <div className="cta-actions">
            <Link className="btn btn-primary btn-lg" to="/support">Talk to us</Link>
            <Link className="btn btn-outline btn-lg" to="/courses">Browse courses</Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}