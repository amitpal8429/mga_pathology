import { useInView } from '../hooks/useInView';

// Fades and lifts its children in when scrolled into view. `delay` is in ms (use it to stagger siblings).
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, seen] = useInView();
  return (
    <Tag ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`.trim()} style={delay ? { transitionDelay: `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  );
}
