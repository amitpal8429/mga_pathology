// Mock API data shaped like the real responses (course-list, faculty-list, course-details).
export const courses = [
  { id: 18, name: 'PG Diploma in Clinical Pathology', slug: 'pg-diploma-in-clinical-pathology', type: 'Pg Diploma', category_id: null, image: '1.jpg', description: 'A program on clinical pathology. It covers laboratory medicine. It also covers quality control. More text here.', fee: 50000, total_fee: 130000, online_cpd: 130000, hybrid_cpd: 150000, start_date: '2099-07-01', duration: 12, top_courses: 1, category: null, updated_at: '2026-09-30T06:25:45.000000Z' },
  { id: 62, name: 'Fellowship in Histopathology', slug: 'fellowship-in-histopathology', type: 'Fellowship', category_id: 37, image: null, description: 'Tissue diagnosis. Biopsy reporting and immunohistochemistry.', fee: 50000, total_fee: 150000, online_cpd: 150000, hybrid_cpd: 180000, start_date: '2026-08-01', duration: 12, top_courses: 0, category: { id: 37, name: 'Orthopedic' }, updated_at: '2026-10-27T05:12:03.000000Z' },
  { id: 63, name: 'Fellowship in Hematology and Transfusion Medicine', slug: 'fellowship-in-hematology-and-transfusion-medicine', type: 'Fellowship', category_id: null, image: 'n.jpg', description: 'Blood disorders, blood banking and transfusion safety.', fee: 50000, total_fee: 150000, online_cpd: 150000, hybrid_cpd: 180000, start_date: '2026-08-01', duration: 12, top_courses: 0, category: null },
  { id: 28, name: 'Fellowship in Cytopathology', slug: 'fellowship-in-cytopathology', type: 'Fellowship', category_id: null, image: 'p.jpg', description: 'Cytology smears and FNAC interpretation.', fee: 50000, total_fee: 150000, online_cpd: 150000, hybrid_cpd: 180000, start_date: '2026-07-01', duration: 12, top_courses: 0, category: null },
  // not pathology
  { id: 1, name: 'Certificate In Family Medicine', slug: 'certificate-in-family-medicine', type: 'Certificate', category_id: 2, image: 'f.jpg', description: 'Family medicine for general practice.', fee: 20000, total_fee: 80000, online_cpd: 0, hybrid_cpd: 0, start_date: '2026-06-01', duration: 6, top_courses: 0, category: { id: 2, name: 'Medicine' } },
  { id: 20, name: 'Pg Diploma in Dermatology', slug: 'pg-diploma-in-dermatology', type: 'Pg Diploma', category_id: 5, image: null, description: 'Derm.', fee: 50000, total_fee: 130000, online_cpd: 130000, hybrid_cpd: 150000, start_date: '2026-07-01', duration: 12, top_courses: 1, category: { id: 5, name: 'Dermatology' } },
  { id: 25, name: 'Fellowship in Orthopedic', slug: 'fellowship-in-orthopedic', type: 'Fellowship', category_id: 37, image: null, description: 'Joint replacement.', fee: 50000, total_fee: 150000, online_cpd: 150000, hybrid_cpd: 180000, start_date: '2026-07-01', duration: 12, top_courses: 1, category: { id: 37, name: 'Orthopedic' } }
];

export const faculty = [
  { id: 21, name: 'Dr. Neeraj Kumar', qualification: 'MBBS,MD', department: 'Pathology', phone: '8492862174', email: null, image_url: null },
  { id: 50, name: 'Dr. Soumita Roy', qualification: 'MD,DNB, PGPN', department: 'Histopathology', phone: '9831771940', email: null, image_url: null },
  { id: 47, name: 'Dr. Vismaya Molly Siby', qualification: 'DNB PATHOLOGY', department: 'HEMATOLOGY', phone: '9447747539', email: null, image_url: null },
  { id: 3, name: 'Dr. Poonam Pawadi', qualification: 'MBBS/MD DGO', department: 'Medicine', phone: null, email: null, image_url: null },
  { id: 17, name: 'Dr. Dev Rajan', qualification: 'MS', department: 'Orthopedic,Surgery', phone: null, email: null, image_url: null },
  { id: 30, name: 'FACULTY1102', qualification: 'MBBS', department: 'Pathology', phone: '9310027474', email: 'faculty1102@gmail.com', image_url: 'https://x/y.jpg' }
];

export const detail = {
  ...courses[1],
  what_you_learn: [{ id: 1, heading: 'Industry leaders', description: 'Learn from leaders.' }],
  highlight: [{ id: 1, highlight: 'Comprehensive 12-Month Program.' }],
  workshop: { title: 'Workshops', subtitle: 'Foundations.', parts: [{ id: 7, title: 'Online Training', subtitle: 'Core', key_points: [{ id: 46, content: 'Experienced doctors.' }] }] },
  module: [
    { id: 11, module: 'Foundations', sessions: [{ id: 1, title: 'Principles of tissue processing' }, { id: 2, title: 'levels.' }, { id: 3, title: 'Contact Us www.x.com' }] },
    { id: 12, module: 'Biopsy reporting', sessions: [{ id: 4, title: 'Frozen section workflow' }] }
  ]
};

// A non-pathology course detail exists on the API too (it must NOT be reachable through this site).
export const familyDetail = { ...courses[4], module: [], highlight: [], what_you_learn: [] };

export function mockFetch(url) {
  const u = decodeURIComponent(String(url));
  let body = null;
  if (u.endsWith('/faculty-list')) body = faculty;
  else if (u.endsWith('/course-list')) body = courses;
  else if (u.endsWith('/course-details/fellowship-in-histopathology')) body = detail;
  else if (u.endsWith('/course-details/certificate-in-family-medicine')) body = familyDetail;
  if (!body) return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
  return Promise.resolve({ ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(body)) });
}
