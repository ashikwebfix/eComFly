/**
 * eComFly brand mark: three data streams converging into one first-party endpoint.
 */
export default function Logo({ size = 32, showText = true, className = '' }) {
  return (
    <span className={`brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        focusable="false"
        style={{ flexShrink: 0 }}
      >
        <rect width="32" height="32" rx="9" fill="#0b1220" />
        <path d="M7 10.5h6.5c3 0 4 2 5.5 5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 16h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 21.5h6.5c3 0 4-2 5.5-5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="22.5" cy="16" r="3.2" fill="#fff" stroke="#0b1220" strokeWidth="1.6" />
      </svg>
      {showText && <span className="logo-text">eComFly</span>}
    </span>
  );
}
