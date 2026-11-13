# MGA Pathology (React + Vite, "Stain" theme)

A Pathology-only website for Medical Global Academy. It reads the live MGA APIs and shows **only Pathology department courses and faculty**.

APIs used
- `https://24x7.medicalglobalacademy.com/api/course-list`
- `https://24x7.medicalglobalacademy.com/api/course-details/:slug`
- `https://24x7.medicalglobalacademy.com/api/faculty-list`

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 27 tests (vitest)
SITE_URL=https://your-domain.com npm run build   # also regenerates sitemap.xml + robots.txt
npm run preview
```

Set `VITE_SITE_URL` (canonical / Open Graph URLs) and `SITE_URL` (sitemap) to your real domain. The default is the placeholder `https://your-domain.com`.

## Pages

`/` Home, `/courses` (search, type, focus area, sort, pagination), `/courses/:slug` (detail with tabs, curriculum, sticky enrol card), `/faculty`, `/about`, `/support`, `/app`, `/privacy-policy`, `/terms`, `/refund`, `/sitemap`, plus a 404.

## How "Pathology only" works

The API `category` field is unreliable (for example, Pathology Neurology is tagged "Orthopedic"), so filtering is done on the **course name** with keywords in `src/config/pathology-rules.js`:

`patholog, histolog, cytolog, hemat, haemat, transfusion, blood bank, cytogenet, immunohisto, molecular diagnos`

- Add a course the keywords miss: put its slug in `includeSlugs`.
- Remove a false positive: put its slug in `excludeSlugs`.
- Detail pages for non-pathology slugs are refused ("not part of the Pathology department").
- Faculty are filtered by department and qualification (`facultyKeywords`).
- The sitemap script uses the same rules, so it lists only pathology courses.

## Design: "Stain" theme

Flat, editorial look inspired by histology slides. No 3D, no perspective transforms.

- Palette = the four classic stains: hematoxylin purple, eosin pink, giemsa teal, van Gieson gold, on a warm paper background (tokens in `src/styles/base.css`; `.p0`-`.p3` expose `--pc/--ps/--pd`).
- Type: Fraunces (serif headings), Inter (body), IBM Plex Mono (labels).
- Hero: flat SVG "microscope field" (`src/components/HeroField.jsx`) with crosshair, ruler ticks and scale bar. A ruler strip runs along the hero edge.
- Cards are flat sheets with a coloured stain tab; faculty cards are portrait plates; sections use hairline rules and numbered steps.
- Motion is limited to a gentle reveal, focus-area ticker, progress bar and back-to-top (`enhance.css`), all disabled by `prefers-reduced-motion`.

## Notes

- **API access:** requests go direct first, then fall back to `/proxy` (Vite dev proxy, `public/_redirects` for Netlify, `vercel.json` for Vercel). This avoids CORS problems.
- **Course images:** the API returns only a filename. The first base in `SITE.imageBases` (`src/config/site.js`) is `https://24x7.medicalglobalacademy.com/storage/uploads/course/`, followed by fallbacks. If none load, a coloured placeholder is shown.
- **Faculty privacy:** faculty phone and email are never displayed. Placeholder records such as `FACULTY1102` are hidden.
- **Legal pages:** `src/content/legal.js` contains generic draft text. Replace it with the official MGA Privacy, Terms and Refund wording before going live.
- **Sitemap:** `npm run build` regenerates it from the live API. If the API is unreachable, the existing file is kept. For offline use, set `COURSE_LIST_FILE=path/to/course-list.json`.
- **Contact details** (email, phone, WhatsApp, Play Store link, socials) are in `src/config/site.js`.

## Structure

```
src/config     site settings, pathology rules
src/api        API client (cache, proxy fallback)
src/utils      formatting + pathology helpers
src/hooks      useAsync, useScrollSpy, useSeo
src/components Header, Footer, cards, hero art, etc.
src/pages      one file per route
src/content    legal text
src/styles     base, layout, components, pages
scripts        sitemap generator
tests          vitest + mock API fixtures
```
