import { FiCheck } from 'react-icons/fi';

const POINTS = [
  'Live in 60 seconds. No servers to manage',
  'First-party domain, immune to ad blockers',
  'Clean data for Meta, Google and TikTok',
];

/** Brand panel shown beside the login / register form on wide screens. */
export default function AuthAside({ heading = 'Every conversion, counted.', sub }) {
  return (
    <aside className="auth-aside" aria-hidden={false}>
      <div className="auth-aside-inner">
        <p className="auth-aside-eyebrow">Server-side tracking</p>
        <h2 className="auth-aside-title">{heading}</h2>
        {sub && <p className="auth-aside-sub">{sub}</p>}

        <ul className="auth-aside-list">
          {POINTS.map((p) => (
            <li key={p}>
              <span className="auth-aside-check"><FiCheck /></span>
              {p}
            </li>
          ))}
        </ul>

        <div className="auth-aside-meter" role="img" aria-label="Events captured: 98 percent with eComFly versus 71 percent browser only">
          <div className="auth-meter-row">
            <span>Browser pixel only</span>
            <span className="auth-meter-val muted">71%</span>
          </div>
          <div className="auth-meter-track"><div className="auth-meter-fill muted" style={{ '--w': '71%' }} /></div>

          <div className="auth-meter-row">
            <span>With eComFly</span>
            <span className="auth-meter-val">98%</span>
          </div>
          <div className="auth-meter-track"><div className="auth-meter-fill" style={{ '--w': '98%' }} /></div>
          <p className="auth-meter-note">Illustrative share of purchase events captured.</p>
        </div>
      </div>
    </aside>
  );
}
