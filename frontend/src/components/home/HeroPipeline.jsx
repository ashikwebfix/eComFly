import { useEffect, useRef, useState } from 'react';
import { FiMousePointer, FiShoppingCart, FiCreditCard, FiLock } from 'react-icons/fi';
import { SiGoogleanalytics, SiMeta, SiGoogleads, SiTiktok } from 'react-icons/si';

/* Geometry of the diagram (viewBox 0 0 560 320) */
const SOURCES = [
  { y: 80, label: 'page_view', Icon: FiMousePointer },
  { y: 160, label: 'add_to_cart', Icon: FiShoppingCart },
  { y: 240, label: 'purchase', Icon: FiCreditCard },
];

const DESTS = [
  { y: 50, label: 'GA4', Icon: SiGoogleanalytics, color: '#e37400' },
  { y: 123, label: 'Meta CAPI', Icon: SiMeta, color: '#0668e1' },
  { y: 197, label: 'Google Ads', Icon: SiGoogleads, color: '#1a73e8' },
  { y: 270, label: 'TikTok', Icon: SiTiktok, color: '#0b1220' },
];

const HUB = { x: 212, y: 104, w: 136, h: 112 };

const inPath = (cy) => `M130,${cy} C171,${cy} 171,160 212,160`;
const outPath = (cy) => `M348,160 C389,160 389,${cy} 430,${cy}`;

const CYCLE = 3.2; // seconds for one full source -> hub -> destination loop

const EVENT_NAMES = ['page_view', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase', 'page_view', 'add_to_cart'];

const pad = (n) => String(n).padStart(2, '0');
const stamp = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

let uid = 0;
const makeEvent = () => ({
  id: ++uid,
  t: stamp(),
  name: EVENT_NAMES[Math.floor(Math.random() * EVENT_NAMES.length)],
  ms: 28 + Math.floor(Math.random() * 36),
});

function Packet({ path, kind, begin }) {
  // "in" packets travel during the first part of the cycle, "out" packets during the second.
  const motion =
    kind === 'in'
      ? { keyPoints: '0;1;1', keyTimes: '0;0.42;1' }
      : { keyPoints: '0;0;1;1', keyTimes: '0;0.5;0.92;1' };
  const opacity =
    kind === 'in'
      ? { values: '0;1;1;0;0', keyTimes: '0;0.06;0.38;0.42;1' }
      : { values: '0;0;1;1;0;0', keyTimes: '0;0.5;0.56;0.88;0.92;1' };

  return (
    <circle r="4" className={`hp-packet hp-packet-${kind}`} opacity="0">
      <animateMotion
        path={path}
        dur={`${CYCLE}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        calcMode="linear"
        keyPoints={motion.keyPoints}
        keyTimes={motion.keyTimes}
      />
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        values={opacity.values}
        keyTimes={opacity.keyTimes}
      />
    </circle>
  );
}

export default function HeroPipeline() {
  const [events, setEvents] = useState(() => [makeEvent(), makeEvent(), makeEvent(), makeEvent()]);
  const [captured, setCaptured] = useState(98.4);
  const visibleRef = useRef(true);
  const rootRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;

    const el = rootRef.current;
    let io;
    if (el && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }, { threshold: 0.05 });
      io.observe(el);
    }

    const id = setInterval(() => {
      if (!visibleRef.current || document.hidden) return;
      setEvents((prev) => [makeEvent(), ...prev].slice(0, 4));
      setCaptured((c) => Math.min(99.2, Math.max(97.6, +(c + (Math.random() - 0.5) * 0.4).toFixed(1))));
    }, 1600);

    return () => {
      clearInterval(id);
      if (io) io.disconnect();
    };
  }, []);

  return (
    <div className="hp" ref={rootRef}>
      <div className="hp-card">
        <div className="hp-bar">
          <span className="hp-live"><i /> Live</span>
          <span className="hp-url"><FiLock aria-hidden="true" /> track.yourstore.com</span>
          <span className="hp-demo">Preview</span>
        </div>

        <svg
          className="hp-svg"
          viewBox="0 0 560 320"
          role="img"
          aria-label="Diagram: storefront events flow into your eComFly server-side container, which forwards them to Google Analytics, Meta, Google Ads and TikTok."
        >
          <defs>
            <filter id="hp-shadow" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#101828" floodOpacity="0.10" />
            </filter>
          </defs>

          {/* connectors */}
          {SOURCES.map((s) => (
            <g key={`ip-${s.y}`}>
              <path d={inPath(s.y)} className="hp-line" />
              <path d={inPath(s.y)} className="hp-flow" />
            </g>
          ))}
          {DESTS.map((d) => (
            <g key={`op-${d.y}`}>
              <path d={outPath(d.y)} className="hp-line" />
              <path d={outPath(d.y)} className="hp-flow hp-flow-out" />
            </g>
          ))}

          {/* sources */}
          {SOURCES.map((s) => (
            <g key={s.label} className="hp-node">
              <rect x="12" y={s.y - 20} width="118" height="40" rx="10" />
              <s.Icon x="26" y={s.y - 8} size={16} className="hp-src-icon" />
              <text x="50" y={s.y + 4.5} className="hp-mono">{s.label}</text>
            </g>
          ))}

          {/* hub */}
          <g className="hp-hub">
            <circle cx="280" cy="152" r="34" className="hp-pulse" />
            <circle cx="280" cy="152" r="34" className="hp-pulse hp-pulse-2" />
            <rect x={HUB.x} y={HUB.y} width={HUB.w} height={HUB.h} rx="18" filter="url(#hp-shadow)" className="hp-hub-box" />
            {/* mark */}
            <g transform="translate(262 120)">
              <rect width="36" height="36" rx="10" fill="#0b1220" />
              <path d="M8 12h7.5c3.4 0 4.5 2.2 6.2 6.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M8 18h13.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M8 24h7.5c3.4 0 4.5-2.2 6.2-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <circle cx="25.5" cy="18" r="3.6" fill="#fff" stroke="#0b1220" strokeWidth="1.8" />
            </g>
            <text x="280" y="180" textAnchor="middle" className="hp-hub-title">sGTM container</text>
            <text x="280" y="198" textAnchor="middle" className="hp-hub-sub">first-party · SSL</text>
          </g>

          {/* destinations */}
          {DESTS.map((d, i) => (
            <g key={d.label} className="hp-node hp-dest">
              <rect x="430" y={d.y - 18} width="124" height="36" rx="10" />
              <d.Icon x="443" y={d.y - 8} size={16} color={d.color} />
              <text x="467" y={d.y + 4.5} className="hp-dest-label">{d.label}</text>
              <circle cx="535" cy={d.y} r="3.2" className="hp-ok" style={{ animationDelay: `${(i * 0.4).toFixed(1)}s` }} />
            </g>
          ))}

          {/* packets */}
          {SOURCES.map((s, i) => (
            <Packet key={`pk-in-${s.y}`} kind="in" path={inPath(s.y)} begin={i * 0.45} />
          ))}
          {SOURCES.map((s, i) => (
            <Packet key={`pk-in2-${s.y}`} kind="in" path={inPath(s.y)} begin={i * 0.45 + 1.6} />
          ))}
          {DESTS.map((d, i) => (
            <Packet key={`pk-out-${d.y}`} kind="out" path={outPath(d.y)} begin={i * 0.12} />
          ))}
          {DESTS.map((d, i) => (
            <Packet key={`pk-out2-${d.y}`} kind="out" path={outPath(d.y)} begin={i * 0.12 + 1.6} />
          ))}
        </svg>

        <div className="hp-log" aria-live="off">
          <div className="hp-log-head">
            <span>Event stream</span>
            <span>status · latency</span>
          </div>
          <ul>
            {events.map((e) => (
              <li key={e.id} className="hp-log-row">
                <span className="hp-t">{e.t}</span>
                <span className="hp-ev">{e.name}</span>
                <span className="hp-arrow">→ 4 destinations</span>
                <span className="hp-status"><b>200</b> {e.ms}ms</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hp-chip hp-chip-a">
        <span className="hp-chip-k">Events captured</span>
        <span className="hp-chip-v">{captured.toFixed(1)}%</span>
      </div>
      <div className="hp-chip hp-chip-b">
        <span className="hp-chip-dot" />
        <span>0 blocked by ad blockers</span>
      </div>
    </div>
  );
}
