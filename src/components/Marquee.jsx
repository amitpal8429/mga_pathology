import { Link } from 'react-router-dom';
import Icon from './Icon';

// Endless ticker of focus areas. The second copy is hidden from assistive tech and from the tab order.
export default function Marquee({ items }) {
  if (!items?.length) return null;
  const row = (hidden) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((a, i) => (
        <li key={a.label}>
          <Link to={`/courses?area=${encodeURIComponent(a.label)}`} tabIndex={hidden ? -1 : undefined} className={`p${i % 4}`}>
            <Icon name="heart" size={14} /> {a.label}
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" aria-label="Pathology focus areas">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
