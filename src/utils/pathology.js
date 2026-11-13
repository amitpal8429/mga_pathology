import { isPathologyCourse, isPathologyFaculty } from '../config/pathology-rules';
import { flat, visibleFaculty } from './format';

export const pathologyCourses = (list) => (list || []).filter((c) => isPathologyCourse(c));
export const pathologyFaculty = (list) => visibleFaculty(list || []).filter((f) => isPathologyFaculty(f));

const SMALL = /^(and|of|in|the|for|&)$/i;
const titleCase = (s) =>
  s
    .split(' ')
    .map((w, i) => (i > 0 && SMALL.test(w) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

// Friendly sub-speciality for a pathology course, derived from its name
// ("Fellowship in Histopathology" -> "Histopathology"). The API's own `category` is unreliable, so it is not used.
export function focusArea(course) {
  let n = flat(course?.name);
  n = n.replace(/^(pg diploma|fellowship|certificate)\s+in\s+/i, '');
  return titleCase(n || flat(course?.name));
}

// [{ label, count }] sorted A-Z
export function focusAreas(courses) {
  const map = new Map();
  (courses || []).forEach((c) => {
    const k = focusArea(c);
    map.set(k, (map.get(k) || 0) + 1);
  });
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label));
}
