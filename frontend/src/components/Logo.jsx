// Mark: an ordered column of squares that gradually breaks apart, a nod to entropy.
export default function Logo({ size = 30 }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <g fill="currentColor">
          <rect x="2" y="2" width="8" height="8" rx="1.5" />
          <rect x="2" y="12" width="8" height="8" rx="1.5" />
          <rect x="2" y="22" width="8" height="8" rx="1.5" />
          <rect x="12" y="2" width="8" height="8" rx="1.5" opacity=".85" />
          <rect x="12.5" y="13" width="7" height="7" rx="1.5" opacity=".65" />
          <rect x="13" y="23" width="6" height="6" rx="1.5" opacity=".5" />
          <rect x="23" y="1" width="6" height="6" rx="1.5" opacity=".55" transform="rotate(8 26 4)" />
          <rect x="23.5" y="13" width="5" height="5" rx="1" opacity=".4" transform="rotate(-12 26 15.5)" />
          <rect x="22" y="25" width="4" height="4" rx="1" opacity=".25" transform="rotate(20 24 27)" />
        </g>
      </svg>
      <span className="logo__text">
        <strong>Entropy</strong> Soft
      </span>
    </span>
  );
}
