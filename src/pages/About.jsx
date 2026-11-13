import { Link } from 'react-router-dom';
import { getPathologyCourses, getPathologyFaculty } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../hooks/useSeo';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import Counter from '../components/Counter';
import { SITE } from '../config/site';

/* ==================== CONTENT — verbatim from ABOUT MGA.txt ==================== */

const HERO = {
  eyebrow: 'About MGA',
  title: 'Medical education that fits your career',
  text: 'Medical Global Academy provides flexible online medical education for practising doctors from every country, with Certificate, Fellowship and PG Diploma programmes in 150+ specialities and sub-specialities.'
};

const PLATFORM_STATS = [
  { value: 321, suffix: '+', label: 'Active programs' },
  { value: 210, suffix: '+', label: 'Fellowships' },
  { value: 47,  suffix: '+', label: 'Certificates' },
  { value: 64,  suffix: '+', label: 'PG diplomas' }
];

const WHO_WE_ARE = {
  title: 'Learn without stepping away from clinical practice.',
  since: '2020',
  points: [
    {
      label: 'Who we are.',
      text: 'Medical Global Academy (MGA) is an online medical education platform designed for practising doctors who want to continue learning while managing their professional responsibilities.'
    },
    {
      label: 'What we do.',
      text: 'We offer Certificate Courses, Fellowships and PG Diploma programmes across a wide range of specialities. Our programmes combine structured online learning, live faculty-led sessions and programme-specific training where applicable.'
    },
    {
      label: 'Our journey.',
      text: 'Since 2020, MGA has been helping doctors from all over the world upgrade their clinical knowledge and grow in their careers.'
    },
    {
      label: 'Learning formats.',
      text: 'Choose between attending and non-attending options, so you can study at your own convenience without compromising on quality.'
    }
  ]
};

const MISSION_VISION = [
  {
    tag: 'Our mission',
    title: 'Bridge the gap in healthcare education',
    text: 'To bridge the gap in healthcare education by providing accessible, flexible and high-quality learning opportunities. Through specialised programmes, we help medical professionals gain new skills, advance their careers and improve patient care.'
  },
  {
    tag: 'Our vision',
    title: 'The most trusted destination for CME worldwide',
    text: 'To be the most trusted destination for continuing medical education worldwide, empowering every healthcare professional to learn, grow and lead.'
  }
];

const OFFERINGS = [
  {
    title: 'Certificate Courses',
    count: '41+ programmes',
    text: 'Short, focused programmes for professional learning and skill development.',
    icon: 'check',
    tag: null
  },
  {
    title: 'Fellowship Programmes',
    count: '203+ programmes',
    text: 'Speciality-focused learning with experienced faculty.',
    icon: 'award',
    tag: 'Most popular'
  },
  {
    title: 'PG Diploma Programmes',
    count: '64+ programmes',
    text: 'In-depth postgraduate-level learning to strengthen your clinical knowledge in your chosen speciality.',
    icon: 'book',
    tag: null
  }
];

const HOW_STEPS = [
  ['Choose your programme', 'Browse Certificate, Fellowship and PG Diploma programmes by speciality.'],
  ['Enrol online', 'Pick the attending or non-attending format that suits your schedule.'],
  ['Learn your way', 'Online learning, live faculty-led sessions and recorded sessions where available.'],
  ['Get certified', 'Complete your programme and receive your certification.']
];

const SPECIALITIES = [
  'Cardiology', 'Medicine', 'Oncology', 'Nephrology', 'Neurology',
  'Orthopedics', 'Obstetrics & Gynecology'
];

const ACCREDITATIONS = [
  { code: 'CPD' },
  { code: 'ACTD' }
];

const WHY_MGA = [
  { icon: 'clock',   title: 'Flexible',    text: 'Learn around your professional schedule.' },
  { icon: 'globe',   title: 'Accessible',  text: 'Access online learning and available recorded sessions.' },
  { icon: 'users',   title: 'Faculty-led', text: 'Learn from experienced medical professionals.' },
  { icon: 'compass', title: 'Anywhere',    text: 'Access the online learning component from anywhere.' }
];

/* ==================== SUBCOMPONENTS ==================== */

function StatStrip({ stats }) {
  return (
    <div className="stat-strip scene-3d">
      {stats.map((s, i) => (
        <div className={`stat-strip-cell p${i % 4}`} key={s.label}>
          <b>
            <Counter value={s.value} />
            {s.suffix || ''}
          </b>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ==================== MAIN ==================== */

export default function About() {
  useSeo({
    title: 'About us',
    description: HERO.text,
    path: '/about'
  });

  const { data } = useAsync(
    () => Promise.all([
      getPathologyCourses().catch(() => []),
      getPathologyFaculty().catch(() => [])
    ]),
    []
  );
  const courses = data?.[0] || [];
  const faculty = data?.[1] || [];

  // Used only inside the CTA at the bottom — no longer drives a "stats grid"
  const pathologyCount = courses.length || '—';
  const pathologyFacultyCount = faculty.length || '—';

  return (
    <>
      <PageHero
        crumbs={[{ label: 'About us' }]}
        eyebrow={HERO.eyebrow}
        title={HERO.title}
        text={HERO.text}
        actions={
          <>
            <Link className="btn btn-primary btn-lg" to="/courses">
              Explore programmes <Icon name="arrow" size={16} />
            </Link>
            <a className="btn btn-outline btn-lg" href="#our-story">
              Our story
            </a>
          </>
        }
      />

      {/* ============ PLATFORM STATS ============ */}
      <div className="container">
        <Reveal>
          <StatStrip stats={PLATFORM_STATS} />
        </Reveal>
      </div>

      {/* ============ WHO WE ARE ============ */}
      <section id="our-story" className="section about-who">
        <div className="container">
          <div className="about-split">
            <Reveal>
              <div>
                <span className="eyebrow">Who we are</span>
                <h2>{WHO_WE_ARE.title}</h2>
                <p className="about-since">
                  Serving doctors since <strong>{WHO_WE_ARE.since}</strong>
                </p>
                {WHO_WE_ARE.points.map((p) => (
                  <p key={p.label}>
                    <strong>{p.label}</strong> {p.text}
                  </p>
                ))}
                <Link className="btn btn-primary" to="/courses">
                  Explore programmes <Icon name="arrow" size={16} />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="about-since-card">
                <span className="about-since-label">Serving doctors since</span>
                <b className="about-since-year">
                  <Counter value={Number(WHO_WE_ARE.since)} />
                </b>
                <p className="about-since-note">
                  Doctors from every country — learning without stepping away from clinical
                  practice.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ MISSION & VISION ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Mission & vision"
              title="Why we exist, and where we're headed"
            />
          </Reveal>
          <div className="mv-grid scene-3d">
            {MISSION_VISION.map((m, i) => (
              <Reveal key={m.tag} delay={i * 90}>
                <article className={`mv-card p${i % 4}`}>
                  <span className="mv-tag">{m.tag}</span>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHAT WE OFFER ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="What we offer"
              title="Programmes for continuous medical learning"
            />
          </Reveal>
          <div className="offer-grid scene-3d">
            {OFFERINGS.map((o, i) => (
              <Reveal key={o.title} delay={i * 90}>
                <article className={`offer-card p${i % 4}`}>
                  <div className="offer-head">
                    <span className="fi"><Icon name={o.icon} size={22} /></span>
                    {o.tag && <span className="offer-tag">{o.tag}</span>}
                  </div>
                  <h3>{o.title}</h3>
                  <p>{o.text}</p>
                  <div className="offer-foot">
                    <span className="offer-count">{o.count}</span>
                    <Link to="/courses" className="offer-link">
                      Browse <Icon name="arrow" size={14} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="How it works"
              title="From enrolment to certification in four simple steps"
            />
          </Reveal>
          <div className="steps scene-3d">
            {HOW_STEPS.map(([t, p], i) => (
              <Reveal key={t} delay={i * 90} className="step">
                <h3>{t}</h3>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SPECIALITIES ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Specialities"
              title="Programmes across every major speciality"
              text="Whether you want to deepen expertise in your own field or broaden your medical knowledge, there is a programme for your goals."
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="speciality-chips">
              {SPECIALITIES.map((s, i) => (
                <Link
                  key={s}
                  to={`/courses?q=${encodeURIComponent(s)}`}
                  className={`spec-chip p${i % 4}`}
                >
                  {s}
                </Link>
              ))}
              <span className="spec-chip spec-chip-more">and many more →</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ ACCREDITATION ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Accreditation"
              title="Accredited by CPD and ACTD"
              text="Our programmes are accredited by CPD and ACTD, supporting the quality and credibility of your continuing professional development."
            />
          </Reveal>
          <Reveal>
            <div className="accred scene-3d">
              {ACCREDITATIONS.map((a, i) => (
                <div className={`accred-card p${i % 4}`} key={a.code}>
                  <div className="accred-mark" aria-hidden="true">{a.code}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ OUR FACULTY ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Our faculty"
              title="Learn from experienced medical professionals"
              text="Our programmes are delivered with experienced medical professionals and specialists who bring practical clinical perspectives into teaching."
              action={
                <Link className="btn btn-outline" to="/faculty">
                  Meet the faculty <Icon name="arrow" size={16} />
                </Link>
              }
            />
          </Reveal>
        </div>
      </section>

      {/* ============ WHY MGA ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Why MGA"
              title="Flexible learning for working doctors"
            />
          </Reveal>
          <div className="pillars scene-3d">
            {WHY_MGA.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <div className={`pillar p${i % 4}`}>
                  <span className="fi"><Icon name={p.icon} size={22} /></span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <div className="container">
        <Reveal className="cta-band cta-band-premium">
          <div className="cta-band-inner">
            <span className="eyebrow eyebrow-light">Ready when you are</span>
            <h2>Explore programmes that fit your career</h2>
            <p>
              {HERO.text}
            </p>
            <div className="cta-actions">
              <Link className="btn btn-sun btn-lg" to="/courses">Browse programmes</Link>
              <Link className="btn btn-ghost-light btn-lg" to="/support">Talk to us</Link>
            </div>
            <p className="cta-band-foot">
              Pathology department on this site:{' '}
              <strong>{pathologyCount}</strong> courses ·{' '}
              <strong>{pathologyFacultyCount}</strong> faculty
            </p>
          </div>
        </Reveal>
      </div>
    </>
  );
}