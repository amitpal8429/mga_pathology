// ---------------------------------------------------------------------------
// WHICH COURSES / FACULTY COUNT AS "PATHOLOGY"
// The API has no reliable department field for courses (its `category` values are inconsistent, e.g.
// "Pathology Neurology" is tagged "Orthopedic"), so a course is treated as Pathology when its NAME
// contains one of the keywords below. Faculty are matched on their department / qualification text.
//
// This file is plain ESM with no Vite-specific code, so the React app AND scripts/generate-sitemap.mjs
// share exactly the same rules. Tune the lists here:
//   includeSlugs – force a course in even if no keyword matches
//   excludeSlugs – force a course out even if a keyword matches
// ---------------------------------------------------------------------------
export const PATHOLOGY_RULES = {
  courseKeywords: ['patholog', 'histolog', 'cytolog', 'hemat', 'haemat', 'transfusion', 'blood bank', 'cytogenet', 'immunohisto', 'molecular diagnos'],
  includeSlugs: [],
  excludeSlugs: [],
  facultyKeywords: ['patholog', 'histolog', 'cytolog', 'hemat', 'haemat', 'transfusion']
};

const norm = (s) => String(s ?? '').toLowerCase();

export function isPathologyCourse(course, rules = PATHOLOGY_RULES) {
  if (!course) return false;
  if (rules.excludeSlugs.includes(course.slug)) return false;
  if (rules.includeSlugs.includes(course.slug)) return true;
  const name = norm(course.name);
  return rules.courseKeywords.some((k) => name.includes(k));
}

export function isPathologyFaculty(faculty, rules = PATHOLOGY_RULES) {
  if (!faculty) return false;
  const text = `${norm(faculty.department)} ${norm(faculty.qualification)}`;
  return rules.facultyKeywords.some((k) => text.includes(k));
}
