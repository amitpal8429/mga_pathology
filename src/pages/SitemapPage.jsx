import { Link } from 'react-router-dom';
import { getPathologyCourses } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../hooks/useSeo';
import PageHero from '../components/PageHero';
import { COMPANY_LINKS, LEGAL_LINKS } from '../config/site';
import { courseUrl, typePlural } from '../utils/format';

// Human-readable sitemap (the XML version for search engines lives at /sitemap.xml).
export default function SitemapPage() {
  useSeo({
    title: 'Sitemap',
    description: 'All pages and pathology courses on the MGA Pathology website.',
    path: '/sitemap',
  });

  const { data: courses, loading } = useAsync(
    () => getPathologyCourses().catch(() => []),
    []
  );

  // Group courses by type, sort alphabetically
  const groups = (courses || []).reduce((m, c) => {
    (m[c.type] ||= []).push(c);
    return m;
  }, {});
  Object.values(groups).forEach((list) =>
    list.sort((a, b) => a.name.localeCompare(b.name))
  );
  const groupKeys = Object.keys(groups).sort();

  const totalCourses = (courses || []).length;
  const totalPages = COMPANY_LINKS.length + LEGAL_LINKS.length + 3; // home, courses, faculty

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Sitemap' }]}
        eyebrow="Sitemap"
        title="Everything on one page"
        text="Find any page or pathology course quickly. Search engines can use our XML sitemap."
      />

      <div className="container sitemap-wrap">
        {/* ---------- Quick stats strip ---------- */}
        <div className="sitemap-stats">
          <div className="sitemap-stat">
            <b>{totalPages}</b>
            <span>Pages</span>
          </div>
          <div className="sitemap-stat">
            <b>{totalCourses}</b>
            <span>Courses</span>
          </div>
          <div className="sitemap-stat">
            <b>{groupKeys.length}</b>
            <span>Course types</span>
          </div>
        </div>

        {/* ---------- Sections ---------- */}
        <div className="sitemap-sections">
          {/* Main pages */}
          <section className="sitemap-section">
            <header className="sitemap-section-head">
              <h2>Main pages</h2>
              <a
                href="/sitemap.xml"
                className="sitemap-xml-link"
                title="XML sitemap for search engines"
              >
                XML ↗
              </a>
            </header>
            <ul className="sitemap-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/courses">Pathology courses</Link></li>
              <li><Link to="/faculty">Faculty</Link></li>
              {COMPANY_LINKS.map((l) => (
                <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </section>

          {/* Legal */}
          <section className="sitemap-section">
            <header className="sitemap-section-head">
              <h2>Legal</h2>
            </header>
            <ul className="sitemap-links">
              {LEGAL_LINKS.map((l) => (
                <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
              ))}
              <li>
                <a href="/sitemap.xml">sitemap.xml (for search engines)</a>
              </li>
            </ul>
          </section>

          {/* Loading state */}
          {loading && (
            <section className="sitemap-section sitemap-loading">
              <p>Loading courses…</p>
            </section>
          )}

          {/* Empty state */}
          {!loading && groupKeys.length === 0 && (
            <section className="sitemap-section">
              <p className="sitemap-empty">No courses found.</p>
            </section>
          )}

          {/* Courses grouped by type */}
          {groupKeys.map((type) => {
            const list = groups[type];
            return (
              <section key={type} className="sitemap-section">
                <header className="sitemap-section-head">
                  <h2>{typePlural(type)}</h2>
                  <span className="sitemap-count">
                    {list.length} course{list.length === 1 ? '' : 's'}
                  </span>
                </header>
                <ul className="sitemap-links sitemap-links--cols">
                  {list.map((c) => (
                    <li key={c.slug}>
                      <Link to={courseUrl(c.slug)}>{c.name}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}