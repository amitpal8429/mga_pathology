import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import { imageUrls, palette } from '../utils/format';

// The API gives only a file name, so try each configured base URL; fall back to a colourful placeholder.
export default function CourseImage({ course, className = '' }) {
  const urls = useMemo(() => imageUrls(course), [course?.image]);
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [course?.slug]);

  if (!urls.length || i >= urls.length) {
    return (
      <div className={`ph p${palette(course?.slug || course?.name)} ${className}`} role="img" aria-label={course?.name}>
        <Icon name="heart" size={54} />
      </div>
    );
  }
  return <img className={className} src={urls[i]} alt={course?.name || ''} loading="lazy" onError={() => setI((n) => n + 1)} />;
}
