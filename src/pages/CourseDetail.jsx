import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPathologyCourse, getPathologyCourses } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../hooks/useSeo';
import { useScrollSpy } from '../hooks/useScrollSpy';
import CourseCard from '../components/CourseCard';
import CourseImage from '../components/CourseImage';
import ModuleList from '../components/ModuleList';
import Icon from '../components/Icon';
import { ErrorState, Skeletons } from '../components/States';
import { SITE } from '../config/site';
import { courseUrl, excerpt, futureDate, money, paragraphs, palette, typeLabel, whatsappLink } from '../utils/format';
import { focusArea } from '../utils/pathology';

// ✅ Global function to open popup from anywhere
const openEnquiry = () => {
  window.dispatchEvent(new Event('enq:open'));
};

function Detail({ d, all, slug }) {
  const listed = all.find((c) => c.slug === d.slug) || {};
  const type = d.type || listed.type;
  const area = focusArea({ name: d.name });
  const start = futureDate(listed.start_date || d.start_date);
  const total = money(d.total_fee);
  const fee = money(d.fee);
  const online = money(listed.online_cpd || d.online_cpd);
  const hybrid = money(listed.hybrid_cpd || d.hybrid_cpd);
  const isTop = Number(listed.top_courses ?? d.top_courses) === 1;
  const hasHybrid = Number(listed.hybrid_cpd || d.hybrid_cpd) > 0;
  const tone = palette(d.slug || d.name);

  const highlights = d.highlight || [];
  
  // ✅ FIX: "Hands-On" ko hide/remove karne ke liye logic
  const learn = (d.what_you_learn || []).filter((l) => {
    // Agar heading ya description me "hands-on" hai, toh us card ko hide kar do
    const text = `${l.heading || ''} ${l.description || ''}`.toLowerCase();
    return !text.includes('hands-on');
  }).map((l) => {
    // Agar text me kahin "Hands-On" word bacha hai, toh use normal text se replace kar do
    return {
      ...l,
      heading: (l.heading || '').replace(/hands-on/gi, 'Practical'),
      description: (l.description || '').replace(/hands-on/gi, 'Practical')
    };
  });

  const workshop = d.workshop;
  const modules = d.module || [];

  const sections = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'highlights', label: 'Highlights', show: highlights.length > 0 },
    { id: 'learn', label: 'What you will learn', show: learn.length > 0 },
    { id: 'training', label: 'Training', show: !!workshop },
    { id: 'curriculum', label: 'Curriculum', show: modules.length > 0 }
  ].filter((s) => s.show);
  const active = useScrollSpy(sections.map((s) => s.id));

  useSeo({
    title: d.name,
    description: excerpt(d.description, 155),
    path: courseUrl(slug),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: d.name,
      description: excerpt(d.description, 300),
      provider: { '@type': 'Organization', name: SITE.parent, sameAs: SITE.mainSite },
      ...(total ? { offers: { '@type': 'Offer', priceCurrency: SITE.currency, price: String(d.total_fee), category: type } } : {})
    }
  });

  const related = useMemo(
    () =>
      all
        .filter((c) => c.slug !== d.slug)
        .sort((a, b) => Number(b.type === type) - Number(a.type === type) || Number(b.top_courses) - Number(a.top_courses))
        .slice(0, 3),
    [all, d.slug, type]
  );

  const wa = whatsappLink(`Hello, I would like to know more about ${d.name}`);

  const facts = [
    { icon: 'clock', label: 'Duration', value: `${d.duration} months` },
    { icon: 'calendar', label: 'Starts', value: start || 'Enrolling now' },
    { icon: 'laptop', label: 'Mode', value: hasHybrid ? 'Online / Hybrid' : 'Online' },
    { icon: 'award', label: 'Level', value: typeLabel(type) }
  ];

  return (
    <>
      <section className={`d-hero p${tone}`}>
        <div className="container d-hero-grid">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> / <Link to="/courses">Courses</Link> / <Link to={`/courses?type=${encodeURIComponent(type || '')}`}>{typeLabel(type)}</Link>
            </nav>
            <div className="d-pills">
              <span className="tag tag-white">{typeLabel(type)}</span>
              <span className="tag tag-white">{area}</span>
              {isTop && <span className="tag tag-sun"><Icon name="star" size={12} /> Top course</span>}
            </div>
            <h1>{d.name}</h1>
            <p className="d-lead">{excerpt(d.description, 210)}</p>
            <div className="d-actions">
              <button 
                className="btn btn-sun btn-lg" 
                onClick={openEnquiry} 
                style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <Icon name="mail" size={18} /> Enquire now
              </button>
              
              <a className="btn btn-ghost-light btn-lg" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={18} /> WhatsApp</a>
            </div>
          </div>
          <div className="d-visual">
            <div className="d-frame"><CourseImage course={{ ...d, ...listed, image: d.image || listed.image }} /></div>
            <div className="d-sticker"><small>Total fee</small><b>{total || fee || 'On request'}</b></div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="facts">
          {facts.map((f) => (
            <div className="fact" key={f.label}>
              <span className="fi"><Icon name={f.icon} size={22} /></span>
              <div><small>{f.label}</small><b>{f.value}</b></div>
            </div>
          ))}
        </div>

        <div className="d-layout">
          <div>
            <nav className="tabs" aria-label="Course sections">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : ''}>{s.label}</a>
              ))}
            </nav>

            <section id="overview" className="panel">
              <h2>About this program</h2>
              {paragraphs(d.description).map((p, i) => <p key={i}>{p}</p>)}
            </section>

            {highlights.length > 0 && (
              <section id="highlights" className="panel">
                <h2>Program highlights</h2>
                <ul className="ticks">
                  {highlights.map((h) => <li key={h.id}><Icon name="check" size={22} />{h.highlight}</li>)}
                </ul>
              </section>
            )}

            {learn.length > 0 && (
              <section id="learn" className="panel">
                <h2>What you will learn</h2>
                <div className="learn-grid">
                  {learn.map((l, i) => (
                    <div className={`learn-item p${i % 4}`} key={l.id || i}>
                      <span className="n">{String(i + 1).padStart(2, '0')}</span>
                      <h4>{l.heading}</h4>
                      <p>{l.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {workshop && (
              <section id="training" className="panel">
                <h2>{(workshop.title || 'Training').replace(/hands-on/gi, 'Practical')}</h2>
                {workshop.subtitle && <p>{workshop.subtitle.replace(/hands-on/gi, 'Practical')}</p>}
                {(workshop.parts || []).map((p) => (
                  <div className="train-part" key={p.id}>
                    <h4>{(p.title || '').replace(/hands-on/gi, 'Practical')}</h4>
                    {p.subtitle && <p className="small">{p.subtitle.replace(/hands-on/gi, 'Practical')}</p>}
                    <ul className="ticks">
                      {(p.key_points || []).map((k) => (
                        <li key={k.id}>
                          <Icon name="check" size={22} />
                          {(k.content || '').replace(/hands-on/gi, 'Practical')}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {modules.length > 0 && (
              <section id="curriculum" className="panel">
                <h2>Curriculum</h2>
                <ModuleList modules={modules} />
              </section>
            )}
          </div>

          <aside className="enrol">
            <div className="enrol-top">
              <small>Total program fee</small>
              <div className="price">{total || fee || 'Enquire'}</div>
            </div>
            <div className="enrol-body">
              <ul className="kv">
                <li><span>Program</span><b>{typeLabel(type)}</b></li>
                <li><span>Focus area</span><b>{area}</b></li>
                <li><span>Duration</span><b>{d.duration} months</b></li>
                <li><span>Start</span><b>{start || 'Enrolling now'}</b></li>
                {fee && <li><span>Registration fee</span><b>{fee}</b></li>}
                {online && <li><span>Online + CPD</span><b>{online}</b></li>}
                {hybrid && <li><span>Hybrid + CPD</span><b>{hybrid}</b></li>}
              </ul>
              
              <button 
                className="btn btn-primary btn-block btn-lg" 
                onClick={openEnquiry} 
                style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <Icon name="mail" size={18} /> Enquire now
              </button>
              
              <a className="btn btn-coral btn-block" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={18} /> WhatsApp us</a>
              <a className="btn btn-outline btn-block" href={`tel:${SITE.phoneRaw}`}><Icon name="phone" size={18} /> {SITE.phone}</a>
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head"><h2>More pathology programs</h2></div>
            <div className="grid-cards">{related.map((c) => <CourseCard key={c.slug} course={c} />)}</div>
          </div>
        </section>
      )}

      <div className="mobile-cta">
        <button 
          className="btn btn-primary" 
          onClick={openEnquiry} 
          style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Enquire
        </button>
        <a className="btn btn-coral" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
    </>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const { data, error, loading, retry } = useAsync(() => Promise.all([getPathologyCourse(slug), getPathologyCourses()]), [slug]);

  if (loading) {
    return <div className="container" style={{ padding: '60px 22px' }}><Skeletons count={1} height={420} /></div>;
  }
  if (error || !data?.[0]?.name) {
    return (
      <div className="container" style={{ padding: '60px 22px' }}>
        <ErrorState error={error || new Error('Course not found')} onRetry={retry} backTo={{ to: '/courses', label: 'Browse pathology courses' }} />
      </div>
    );
  }
  return <Detail d={data[0]} all={data[1]} slug={slug} />;
}