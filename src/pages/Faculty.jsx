import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPathologyFaculty } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../hooks/useSeo';
import PageHero from '../components/PageHero';
import FacultyCard from '../components/FacultyCard';
import Icon from '../components/Icon';
import { EmptyState, ErrorState, Skeletons } from '../components/States';
import { deptLabel, deptList } from '../utils/format';

export default function Faculty() {
  useSeo({ title: 'Pathology faculty', description: 'Meet the pathology specialists who teach and mentor the Medical Global Academy Pathology programs.', path: '/faculty' });
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const dept = (params.get('dept') || '').toLowerCase();
  const { data, error, loading, retry } = useAsync(getPathologyFaculty, []);

  const { labels, results } = useMemo(() => {
    const list = data || [];
    const labels = {};
    list.forEach((f) => deptList(f).forEach((d) => { labels[d.toLowerCase()] ||= deptLabel(d); }));
    const needle = q.trim().toLowerCase();
    const results = list.filter((f) => {
      const ds = deptList(f).map((x) => x.toLowerCase());
      return (!dept || ds.includes(dept)) && (!needle || `${f.name} ${f.qualification} ${f.department}`.toLowerCase().includes(needle));
    });
    return { labels, results };
  }, [data, q, dept]);

  const setDept = (key) => {
    const next = new URLSearchParams(params);
    key ? next.set('dept', key) : next.delete('dept');
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHero crumbs={[{ label: 'Faculty' }]} eyebrow="Our team" title="Learn from pathology specialists" text="The doctors who teach, mentor and guide our Pathology programs." />
      <div className="container">
        <div className="filters" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
          <div className="search-field">
            <Icon name="search" size={18} />
            <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, qualification or sub-speciality…" aria-label="Search faculty" />
          </div>
          <select className="select" value={labels[dept] ? dept : ''} onChange={(e) => setDept(e.target.value)} aria-label="Department">
            <option value="">All pathology departments</option>
            {Object.keys(labels).sort().map((k) => <option key={k} value={k}>{labels[k]}</option>)}
          </select>
        </div>
        <div className="results-meta"><span>{loading ? 'Loading…' : `${results.length} faculty member${results.length === 1 ? '' : 's'}`}</span></div>
        <div className="grid-fac">
          {loading && <Skeletons count={4} height={230} />}
          {error && <ErrorState error={error} onRetry={retry} />}
          {!loading && !error && results.length === 0 && <EmptyState>No pathology faculty match your search.</EmptyState>}
          {results.map((f) => <FacultyCard key={f.id} faculty={f} />)}
        </div>
      </div>
    </>
  );
}
