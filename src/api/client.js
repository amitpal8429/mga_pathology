// API layer for the three MGA endpoints.
//   GET {apiBase}/faculty-list
//   GET {apiBase}/course-list
//   GET {apiBase}/course-details/{slug}
// Tries the API directly; on failure (e.g. CORS) retries through /proxy. Responses are cached per session.
// The site only ever exposes the Pathology department: use the getPathology* helpers below.
import { SITE } from '../config/site';
import { pathologyCourses, pathologyFaculty } from '../utils/pathology';

const cache = new Map();

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function apiGet(path) {
  if (cache.has(path)) return cache.get(path);
  const promise = (async () => {
    try {
      return await getJson(SITE.apiBase + path);
    } catch (err) {
      try {
        return await getJson(SITE.proxyBase + path);
      } catch {
        throw err;
      }
    }
  })();
  cache.set(path, promise);
  promise.catch(() => cache.delete(path)); // never cache failures
  return promise;
}

const asList = (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);

// raw endpoints
export const getFaculty = () => apiGet('/faculty-list').then(asList);
export const getCourses = () => apiGet('/course-list').then(asList);
export const getCourse = (slug) =>
  apiGet(`/course-details/${encodeURIComponent(slug)}`).then((d) => (d?.data && !d.name ? d.data : d));

// pathology-only views (these are what the pages use)
export const getPathologyCourses = () => getCourses().then(pathologyCourses);
export const getPathologyFaculty = () => getFaculty().then(pathologyFaculty);

// A course page is only available if the course belongs to the Pathology department.
export async function getPathologyCourse(slug) {
  const list = await getPathologyCourses();
  if (!list.some((c) => c.slug === slug)) throw new Error('This course is not part of the Pathology department.');
  return getCourse(slug);
}

export function clearApiCache() {
  cache.clear();
}
