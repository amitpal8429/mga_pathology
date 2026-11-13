import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPathologyCourses } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../hooks/useSeo';
import PageHero from '../components/PageHero';
import CourseCard from '../components/CourseCard';
import Icon from '../components/Icon';
import { EmptyState, ErrorState, Skeletons } from '../components/States';
import { flat, typeLabel } from '../utils/format';
import { focusArea, focusAreas } from '../utils/pathology';

const PAGE = 12;

const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name),
  'fee-asc': (a, b) => a.total_fee - b.total_fee || a.name.localeCompare(b.name),
  'fee-desc': (a, b) => b.total_fee - a.total_fee || a.name.localeCompare(b.name),
  duration: (a, b) => a.duration - b.duration || a.name.localeCompare(b.name),
  start: (a, b) => String(a.start_date).localeCompare(String(b.start_date)) || a.name.localeCompare(b.name)
};

export default function Courses() {
  useSeo({
    title: 'Pathology courses',
    description: 'Browse pathology fellowships and PG diplomas from Medical Global Academy.',
    path: '/courses'
  });
  const [params, setParams] = useSearchParams();
  const [shown, setShown] = useState(PAGE);
  const q = params.get('q') || '';
  const type = params.get('type') || '';
  const area = params.get('area') || '';
  const sort = params.get('sort') || 'name';

  const { data: courses, error, loading, retry } = useAsync(getPathologyCourses, []);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
    setShown(PAGE);
  };

  const { types, areas, results } = useMemo(() => {
    const list = courses || [];
    const types = [...new Set(list.map((c) => c.type))].sort();
    const areas = focusAreas(list);
    const needle = q.trim().toLowerCase();
    const results = list
      .filter((c) => (!type || c.type === type) && (!area || focusArea(c) === area))
      .filter((c) => !needle || `${c.name} ${c.type} ${flat(c.description)}`.toLowerCase().includes(needle))
      .sort(SORTS[sort] || SORTS.name);
    return { types, areas, results };
  }, [courses, q, type, area, sort]);

  return (
    <>
      <PageHero crumbs={[{ label: 'Courses' }]} eyebrow="Pathology department" title="Pathology courses & programs" text="Fellowships and PG diplomas in histopathology, cytopathology, hematology and laboratory medicine." />
      <div className="container">
        <div className="filters">
          <div className="search-field">
            <Icon name="search" size={18} />
            <input className="input" type="search" value={q} onChange={(e) => update('q', e.target.value)} placeholder="Search pathology courses…" aria-label="Search courses" />
          </div>
          <select className="select" value={area} onChange={(e) => update('area', e.target.value)} aria-label="Focus area">
            <option value="">All focus areas</option>
            {areas.map((a) => <option key={a.label} value={a.label}>{a.label} ({a.count})</option>)}
          </select>
          <select className="select" value={sort} onChange={(e) => update('sort', e.target.value === 'name' ? '' : e.target.value)} aria-label="Sort">
            <option value="name">Sort: A–Z</option>
            <option value="fee-asc">Fee: low to high</option>
            <option value="fee-desc">Fee: high to low</option>
            <option value="duration">Duration: shortest</option>
            <option value="start">Start date</option>
          </select>
        </div>

        <div className="chips" role="group" aria-label="Program type">
          <button className={`chip ${!type ? 'on' : ''}`} onClick={() => update('type', '')}>All</button>
          {types.map((t) => (
            <button key={t} className={`chip ${type === t ? 'on' : ''}`} onClick={() => update('type', t)}>{typeLabel(t)}</button>
          ))}
        </div>

        <div className="results-meta">
          <span>{loading ? 'Loading…' : `${results.length} course${results.length === 1 ? '' : 's'} found`}</span>
          {(q || type || area) && <button className="link-btn" onClick={() => { setParams({}, { replace: true }); setShown(PAGE); }}>Clear filters</button>}
        </div>

        <div className="grid-cards">
          {loading && <Skeletons count={6} />}
          {error && <ErrorState error={error} onRetry={retry} />}
          {!loading && !error && results.length === 0 && <EmptyState>No pathology courses match your filters. Try clearing the search.</EmptyState>}
          {results.slice(0, shown).map((c) => <CourseCard key={c.slug} course={c} />)}
        </div>

        {results.length > shown && (
          <div className="load-more">
            <button className="btn btn-outline btn-lg" onClick={() => setShown((n) => n + PAGE)}>Show more ({results.length - shown} left)</button>
          </div>
        )}
      </div>
    </>
  );
}
