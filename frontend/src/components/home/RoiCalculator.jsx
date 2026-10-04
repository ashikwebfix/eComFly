import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const fmt = (n) => Math.round(n).toLocaleString('en-US');
const STARTER_PRICE = 29;

export default function RoiCalculator() {
  const [spend, setSpend] = useState(10000);
  const [roas, setRoas] = useState(4);
  const [lost, setLost] = useState(25);

  const reported = spend * roas;
  const L = lost / 100;
  const recovered = (reported * L) / (1 - L);
  const multiple = recovered / STARTER_PRICE;

  const pct = (v, min, max) => `${((v - min) / (max - min)) * 100}%`;

  return (
    <div className="roi" id="calculator">
      <div className="roi-inputs">
        <div className="roi-field">
          <label htmlFor="roi-spend">
            <span>Monthly ad spend</span>
            <output>${fmt(spend)}</output>
          </label>
          <input
            id="roi-spend"
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={spend}
            onChange={(e) => setSpend(+e.target.value)}
            style={{ '--p': pct(spend, 1000, 100000) }}
          />
          <div className="roi-scale"><span>$1K</span><span>$100K</span></div>
        </div>

        <div className="roi-field">
          <label htmlFor="roi-roas">
            <span>Reported ROAS</span>
            <output>{roas.toFixed(1)}×</output>
          </label>
          <input
            id="roi-roas"
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={roas}
            onChange={(e) => setRoas(+e.target.value)}
            style={{ '--p': pct(roas, 1, 10) }}
          />
          <div className="roi-scale"><span>1×</span><span>10×</span></div>
        </div>

        <div className="roi-field">
          <label htmlFor="roi-lost">
            <span>Conversions your pixels miss</span>
            <output>{lost}%</output>
          </label>
          <input
            id="roi-lost"
            type="range"
            min="5"
            max="40"
            step="1"
            value={lost}
            onChange={(e) => setLost(+e.target.value)}
            style={{ '--p': pct(lost, 5, 40) }}
          />
          <div className="roi-scale"><span>5%</span><span>40%</span></div>
          <p className="roi-hint">Stores typically see 20–30% of conversions blocked or truncated by ad blockers and browser privacy limits.</p>
        </div>
      </div>

      <div className="roi-result">
        <p className="roi-result-label">Revenue your ad platforms can&apos;t see</p>
        <p className="roi-result-value" aria-live="polite">
          ${fmt(recovered)}<span>/month</span>
        </p>

        <div className="roi-compare" aria-hidden="true">
          <div className="roi-compare-row">
            <span>Tracked today</span>
            <div><i style={{ width: `${(reported / (reported + recovered)) * 100}%` }} /></div>
            <b>${fmt(reported)}</b>
          </div>
          <div className="roi-compare-row accent">
            <span>With server-side</span>
            <div><i style={{ width: '100%' }} /></div>
            <b>${fmt(reported + recovered)}</b>
          </div>
        </div>

        {multiple >= 1.5 && (
          <p className="roi-multiple">
            That&apos;s <strong>{multiple >= 10 ? Math.round(multiple) : multiple.toFixed(1)}×</strong> the monthly cost of the Starter plan.
          </p>
        )}

        <Link to="/register" className="btn btn-primary btn-lg roi-cta">
          Start recovering it free <FiArrowRight />
        </Link>
        <p className="roi-fine">Estimate based on your inputs. Actual recovery varies by store and traffic mix.</p>
      </div>
    </div>
  );
}
