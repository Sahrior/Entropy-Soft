import { Link } from 'react-router-dom';

/** One button component for links (router or external) and real buttons. */
export default function Button({
  to, href, external, onClick, variant = 'primary', size = 'md', icon, className = '', children, ...rest
}) {
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim();
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href) {
    const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return <a href={href} className={cls} {...ext} {...rest}>{content}</a>;
  }
  return <button type="button" className={cls} onClick={onClick} {...rest}>{content}</button>;
}
