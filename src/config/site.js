// Central site settings. Edit here; nothing else needs to change for these options.
export const SITE = {
  name: 'MGA Pathology',
  parent: 'Medical Global Academy',
  department: 'Pathology',
  // Set VITE_SITE_URL (and SITE_URL for the sitemap script) to your real domain before deploying.
  url: (import.meta.env?.VITE_SITE_URL || 'https://your-domain.com').replace(/\/$/, ''),

  // Live API
  apiBase: 'https://24x7.medicalglobalacademy.com/api',
  proxyBase: '/proxy', // dev: vite proxy · prod: Netlify/Vercel rewrite (see public/_redirects, vercel.json)

  // The API returns only a file name for course images (e.g. "1791026728_22.jpg").
  // These base URLs are tried in order; if none load, a colourful placeholder is shown.
  // Put the correct folder FIRST once you know it.
  imageBases: [
    // Confirmed course image folder (from the API's image template)
    'https://24x7.medicalglobalacademy.com/storage/uploads/course/',
    'https://24x7.medicalglobalacademy.com/storage/courses/',
    'https://24x7.medicalglobalacademy.com/storage/course/',
    'https://24x7.medicalglobalacademy.com/storage/',
    'https://24x7.medicalglobalacademy.com/uploads/courses/',
    'https://24x7.medicalglobalacademy.com/uploads/',
    'https://24x7.medicalglobalacademy.com/images/courses/'
  ],

  currency: 'INR',
  hidePlaceholderFaculty: true, // hides test records such as "FACULTY1102"
  cleanSessions: true, // drops stray text fragments from curriculum lists

  email: 'support@medicalglobalacademy.com',
  phone: '+91 92899 94218',
  phoneRaw: '+919289994218',
  whatsapp: '919289994218',
  playStore: 'https://play.google.com/store/apps/details?id=com.medicalglobalacademy.mga.learning',
  mainSite: 'https://medicalglobalacademy.com',

  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/medicalglobalacademy/' },
    { label: 'YouTube', href: 'https://www.youtube.com/@medicalglobalacademy' },
    { label: 'Facebook', href: 'https://www.facebook.com/medicalglobalacademy1/' },
    { label: 'X', href: 'https://x.com/MGA_Courses' }
  ]
};

export const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses' },
  { to: '/faculty', label: 'Faculty' },
  { to: '/about', label: 'About' },
  { to: '/support', label: 'Support' }
];

// Same paths as the main website (medicalglobalacademy.com/...)
export const COMPANY_LINKS = [
  { to: '/about', label: 'About us' },
  { to: '/support', label: 'Support' },
 
];
export const LEGAL_LINKS = [
  { to: '/privacy-policy', label: 'Privacy policy' },
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/refund', label: 'Refund & Cancellation Policy' },
  { to: '/sitemap', label: 'Sitemap' }
];
