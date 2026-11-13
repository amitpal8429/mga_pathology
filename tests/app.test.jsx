import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import { clearApiCache } from '../src/api/client';
import { isPathologyCourse, isPathologyFaculty } from '../src/config/pathology-rules';
import { cleanSessions, deptLabel, deptList, futureDate, money, paragraphs } from '../src/utils/format';
import { focusArea, focusAreas, pathologyCourses, pathologyFaculty } from '../src/utils/pathology';
import { courses, detail, faculty, mockFetch } from './fixtures';

beforeEach(() => {
  clearApiCache();
  vi.stubGlobal('fetch', mockFetch);
});

const go = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

describe('pathology rules', () => {
  it('keeps only pathology courses', () => {
    expect(pathologyCourses(courses).map((c) => c.slug)).toEqual([
      'pg-diploma-in-clinical-pathology',
      'fellowship-in-histopathology',
      'fellowship-in-hematology-and-transfusion-medicine',
      'fellowship-in-cytopathology'
    ]);
  });
  it('does not confuse orthopedic surgery with orthopedic pathology', () => {
    expect(isPathologyCourse({ name: 'Fellowship in Orthopedic Surgery', slug: 'x' })).toBe(false);
    expect(isPathologyCourse({ name: 'Fellowship in Orthopedic Pathology', slug: 'y' })).toBe(true);
  });
  it('does not use the unreliable API category', () => {
    // "Histopathology" is tagged "Orthopedic" by the API, but is still a pathology course
    expect(isPathologyCourse(courses[1])).toBe(true);
  });
  it('matches the real pathology course names', () => {
    ['Fellowship in Clinical Pathology', 'Fellowship in Histopathology and Cytology', 'Pg Diploma in Hematology',
      'Fellowship in Transfusion Medicine', 'Fellowship in Molecular Diagnostics', 'Fellowship in Cytogenetics',
      'Fellowship in Blood Bank Technology'].forEach((name) => expect(isPathologyCourse({ name, slug: name })).toBe(true));
    ['Fellowship in Fetal Medicine', 'Pg Diploma in Dermatology', 'Fellowship in Urology', 'Certificate In Family Medicine'].forEach((name) =>
      expect(isPathologyCourse({ name, slug: name })).toBe(false));
  });
  it('keeps only pathology faculty and hides placeholders', () => {
    expect(pathologyFaculty(faculty).map((f) => f.name)).toEqual(['Dr. Neeraj Kumar', 'Dr. Soumita Roy', 'Dr. Vismaya Molly Siby']);
    expect(isPathologyFaculty({ department: 'Medicine', qualification: 'MD' })).toBe(false);
  });
  it('derives friendly focus areas', () => {
    expect(focusArea({ name: 'Fellowship in Histopathology' })).toBe('Histopathology');
    expect(focusArea({ name: 'PG Diploma in Clinical Pathology' })).toBe('Clinical Pathology');
    expect(focusArea({ name: 'Fellowship in Hematology and Transfusion Medicine' })).toBe('Hematology and Transfusion Medicine');
    expect(focusAreas(pathologyCourses(courses))).toHaveLength(4);
  });
});

describe('utils', () => {
  it('formats money in INR', () => expect(money(80000)).toMatch(/80,000/));
  it('splits comma departments and tidies casing', () => {
    expect(deptList({ department: 'Orthopedic,Surgery' })).toEqual(['Orthopedic', 'Surgery']);
    expect(deptLabel('HISTOPATHOLOGY')).toBe('Histopathology');
  });
  it('drops junk curriculum fragments', () => {
    expect(cleanSessions(detail.module[0].sessions).map((s) => s.title)).toEqual(['Principles of tissue processing']);
  });
  it('treats past dates as empty', () => {
    expect(futureDate('2020-01-01')).toBe('');
    expect(futureDate('2099-07-01')).toMatch(/2099/);
  });
  it('regroups description into paragraphs', () => expect(paragraphs('One. Two. Three. Four.')).toHaveLength(2));
});

describe('pages', () => {
  it('Home shows only pathology courses and counts', async () => {
    const { container } = go('/');
    expect((await screen.findAllByText('PG Diploma in Clinical Pathology')).length).toBeGreaterThan(0);
    expect(screen.queryByText('Pg Diploma in Dermatology')).toBeNull();
    expect(screen.queryByText('Fellowship in Orthopedic')).toBeNull();
    await waitFor(() => expect(container.querySelector('.hero-stats li:nth-child(1) b').textContent).toBe('4'));
    expect(container.querySelector('.hero-stats li:nth-child(2) b').textContent).toBe('3');
    expect(screen.getByRole('heading', { name: 'PG Diplomas' })).toBeTruthy();
    expect(container.querySelectorAll('.bubble').length).toBe(4);
  });

  it('Courses lists only pathology courses and filters by type, area and search', async () => {
    const a = go('/courses');
    expect(await screen.findByText('4 courses found')).toBeTruthy();
    expect(screen.queryByText('Certificate In Family Medicine')).toBeNull();
    a.unmount();

    clearApiCache();
    const b = go('/courses?type=Fellowship');
    expect(await screen.findByText('3 courses found')).toBeTruthy();
    b.unmount();

    clearApiCache();
    go('/courses?area=Histopathology');
    expect(await screen.findByText('1 course found')).toBeTruthy();
    expect(screen.getAllByText('Fellowship in Histopathology').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Search courses'), { target: { value: 'zzz' } });
    expect(await screen.findByText(/No pathology courses match/)).toBeTruthy();
  });

  it('Course detail renders sections, cleaned curriculum, and fees', async () => {
    go('/courses/fellowship-in-histopathology');
    expect(await screen.findByRole('heading', { level: 1, name: 'Fellowship in Histopathology' })).toBeTruthy();
    expect(screen.getByText('Comprehensive 12-Month Program.')).toBeTruthy();
    expect(screen.getByText('Industry leaders')).toBeTruthy();
    expect(screen.getByText('2 modules · 2 topics')).toBeTruthy(); // junk removed
    expect(screen.getAllByText(/1,50,000/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Histopathology').length).toBeGreaterThan(0); // focus area, not the API's "Orthopedic"
    expect(document.getElementById('ld-json').textContent).toContain('"@type":"Course"');
    expect(document.title).toContain('Fellowship in Histopathology');
  });

  it('refuses course pages that are not pathology, even though the API has them', async () => {
    go('/courses/certificate-in-family-medicine');
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText(/not part of the Pathology department/)).toBeTruthy();
  });

  it('Course detail shows an error for an unknown slug', async () => {
    go('/courses/nope');
    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('Faculty shows only pathology faculty, hides test records and never shows contact data', async () => {
    const { container } = go('/faculty');
    expect(await screen.findByText('Dr. Neeraj Kumar')).toBeTruthy();
    expect(screen.queryByText('FACULTY1102')).toBeNull();
    expect(screen.queryByText('Dr. Poonam Pawadi')).toBeNull();
    expect(screen.getByText('3 faculty members')).toBeTruthy();
    expect(container.textContent).not.toMatch(/8492862174|9831771940|faculty1102@gmail\.com/);
    const sel = screen.getByLabelText('Department');
    fireEvent.change(sel, { target: { value: 'histopathology' } });
    expect(await screen.findByText('1 faculty member')).toBeTruthy();
  });

  it.each([
    ['/about', /Accurate diagnosis starts/],
    ['/support', /How can we help/],
    ['/app', /Your classes, wherever/],
    ['/privacy-policy', /Information we collect/],
    ['/terms', /Acceptance of terms/],
    ['/refund', /Cancelling your enrolment/],
    ['/sitemap', /Everything on one page/],
    ['/does-not-exist', /could not find that page/]
  ])('%s renders', async (path, text) => {
    go(path);
    expect(await screen.findByRole('heading', { name: text })).toBeTruthy();
  });

  it('Sitemap page lists only pathology courses', async () => {
    go('/sitemap');
    expect(await screen.findByText('Fellowship in Histopathology')).toBeTruthy();
    expect(screen.queryByText('Pg Diploma in Dermatology')).toBeNull();
  });

  it('Footer links to all requested company and legal pages', async () => {
    const { container } = go('/about');
    await screen.findByText(/Accurate diagnosis starts/);
    const hrefs = [...container.querySelectorAll('footer a')].map((a) => a.getAttribute('href'));
    ['/about', '/support', '/privacy-policy', '/app', '/terms', '/refund', '/sitemap'].forEach((h) => expect(hrefs).toContain(h));
  });
});

describe('enhanced home', () => {
  it('shows the ticker, why-MGA tiles, FAQ and animated stats ending on the real number', async () => {
    const { container } = go('/');
    await screen.findAllByText('PG Diploma in Clinical Pathology');
    expect(container.querySelectorAll('.marquee-row').length).toBe(2);
    expect(container.querySelector('.marquee-row[aria-hidden="true"]')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Live + recorded classes' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Good to know before you enrol/ })).toBeTruthy();
    expect(screen.getByText('Are the programs accredited?')).toBeTruthy();
    expect(screen.getByLabelText('3')).toBeTruthy();
  });
  it('renders the back-to-top button on every page', async () => {
    go('/about');
    expect(await screen.findByLabelText('Back to top')).toBeTruthy();
  });
  it('Support and Home share one FAQ', async () => {
    go('/support');
    expect(await screen.findByText('How do I get certified?')).toBeTruthy();
  });
});
