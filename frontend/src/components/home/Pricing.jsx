import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiMinus, FiArrowRight, FiChevronDown } from 'react-icons/fi';
import api from '../../utils/api';

const SALES_EMAIL = 'mailto:hello@ecomfly.com?subject=eComFly%20Enterprise';

const PLANS = [
  {
    key: 'Free',
    name: 'Free',
    tagline: 'Try server-side tracking on one store.',
    price: 0,
    events: 10000,
    cta: 'Start free',
    features: [
      '1 sGTM container',
      '1 auto-generated subdomain',
      'Basic analytics dashboard',
      'SSL included',
      'Community support',
    ],
  },
  {
    key: 'Starter',
    name: 'Starter',
    tagline: 'For growing stores that need their own domain.',
    price: 29,
    events: 100000,
    cta: 'Get Starter',
    featured: true,
    badge: 'Most popular',
    features: [
      'Everything in Free, plus:',
      '3 sGTM containers',
      '1 custom domain',
      'Advanced analytics',
      'Container health monitoring',
      'Email support (48h)',
    ],
  },
  {
    key: 'Pro',
    name: 'Pro',
    tagline: 'For scaling brands running multiple stores.',
    price: 79,
    events: 500000,
    cta: 'Get Pro',
    chip: 'Lowest cost per event',
    features: [
      'Everything in Starter, plus:',
      '10 sGTM containers',
      '5 custom domains',
      'Advanced analytics & reports',
      'Usage alerts & notifications',
      'Priority email support (24h)',
    ],
  },
  {
    key: 'Enterprise',
    name: 'Enterprise',
    tagline: 'For agencies and high-volume platforms.',
    price: null,
    events: null,
    cta: 'Talk to sales',
    external: true,
    features: [
      'Everything in Pro, plus:',
      'Unlimited events & containers',
      'Unlimited custom domains',
      'Dedicated infrastructure',
      'SLA guarantee',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },
];

const COMPARE = [
  { label: 'Events per month', values: ['10,000', '100,000', '500,000', 'Unlimited'] },
  { label: 'sGTM containers', values: ['1', '3', '10', 'Unlimited'] },
  { label: 'Auto-generated subdomains', values: ['1', '3', '10', 'Unlimited'] },
  { label: 'Custom domains', values: [false, '1', '5', 'Unlimited'] },
  { label: 'SSL certificates', values: [true, true, true, true] },
  { label: 'Analytics', values: ['Basic', 'Advanced', 'Advanced + reports', 'Custom'] },
  { label: 'Container health monitoring', values: [false, true, true, true] },
  { label: 'Usage alerts', values: [false, false, true, true] },
  { label: 'Support', values: ['Community', 'Email · 48h', 'Priority · 24h', 'Dedicated manager'] },
  { label: 'Dedicated infrastructure', values: [false, false, false, true] },
  { label: 'SLA guarantee', values: [false, false, false, true] },
];

const fmtPrice = (n) => n.toLocaleString('en-US');
const per1k = (p) => {
  const v = (p.price / p.events) * 1000;
  return Number.isInteger(v) ? v : v.toFixed(1);
};

function Cell({ v }) {
  if (v === true) return <FiCheck className="cmp-yes" aria-label="Included" />;
  if (v === false) return <FiMinus className="cmp-no" aria-label="Not included" />;
  return <span>{v}</span>;
}

export default function Pricing() {
  const [plans, setPlans] = useState(PLANS);

  // Keep prices in sync with whatever the admin has configured; fall back to static values.
  useEffect(() => {
    let alive = true;
    api
      .get('/plans')
      .then((res) => {
        if (!alive || !Array.isArray(res.data?.plans)) return;
        const byName = Object.fromEntries(res.data.plans.map((p) => [p.name, p]));
        setPlans((prev) =>
          prev.map((p) => {
            const live = byName[p.key];
            if (!live || p.price === null) return p;
            return {
              ...p,
              price: Number(live.price) || 0,
              events: Number(live.event_limit) || p.events,
            };
          })
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <div className="plans" role="list">
        {plans.map((p) => (
          <article
            key={p.key}
            role="listitem"
            className={`plan ${p.featured ? 'plan-featured' : ''}`}
            data-reveal
          >
            <div className="plan-body">
              <header className="plan-head">
                <h3>{p.name}</h3>
                {p.badge && <span className="plan-chip plan-chip-primary">{p.badge}</span>}
                {p.chip && <span className="plan-chip">{p.chip}</span>}
              </header>
              <p className="plan-tagline">{p.tagline}</p>

              <div className="plan-price">
                {p.price === null ? (
                  <span className="plan-amt plan-amt-text">Custom</span>
                ) : (
                  <>
                    <span className="plan-cur">$</span>
                    <span className="plan-amt">{fmtPrice(p.price)}</span>
                    <span className="plan-per">{p.price === 0 ? 'forever' : '/ month'}</span>
                  </>
                )}
              </div>
              <p className="plan-unit">
                {p.price === null
                  ? 'Volume pricing, tailored to you'
                  : p.price === 0
                    ? 'No credit card required'
                    : `≈ $${per1k(p)} per 1,000 events`}
              </p>

              {p.external ? (
                <a href={SALES_EMAIL} className="btn btn-secondary plan-cta">
                  {p.cta} <FiArrowRight />
                </a>
              ) : (
                <Link to="/register" className={`btn plan-cta ${p.featured ? 'btn-primary' : 'btn-secondary'}`}>
                  {p.cta} <FiArrowRight />
                </Link>
              )}

              <div className="plan-events">
                <strong>{p.events ? p.events.toLocaleString('en-US') : 'Unlimited'}</strong>
                <span>events / month</span>
              </div>

              <ul className="plan-list">
                {p.features.map((f) => {
                  const isHeading = f.endsWith(':');
                  return (
                    <li key={f} className={isHeading ? 'plan-list-head' : ''}>
                      {!isHeading && <FiCheck aria-hidden="true" />}
                      <span>{f}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <details className="compare" data-reveal>
        <summary>
          <span>Compare all features</span>
          <FiChevronDown aria-hidden="true" />
        </summary>
        <div className="compare-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Feature</span></th>
                {PLANS.map((p) => (
                  <th key={p.key} scope="col" className={p.featured ? 'is-featured' : ''}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.values.map((v, i) => (
                    <td key={i} className={PLANS[i].featured ? 'is-featured' : ''}><Cell v={v} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
