import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiCheck, FiMenu, FiX, FiMail, FiTwitter, FiLinkedin,
  FiShield, FiGlobe, FiBarChart2, FiServer, FiZap, FiActivity, FiCopy,
  FiCreditCard, FiSmartphone, FiRepeat, FiPlus,
} from 'react-icons/fi';
import {
  SiShopify, SiWoocommerce, SiGoogletagmanager, SiGoogleanalytics,
  SiMeta, SiGoogleads, SiTiktok, SiSnapchat, SiPinterest,
} from 'react-icons/si';
import Logo from '../components/Logo';
import HeroPipeline from '../components/home/HeroPipeline';
import RoiCalculator from '../components/home/RoiCalculator';
import Pricing from '../components/home/Pricing';
import { useRevealOnScroll, useCountUp } from '../hooks/useMotion';
import './HomePage.css';

const STATS = [
  { end: 99.9, decimals: 1, suffix: '%', label: 'Uptime SLA' },
  { end: 50, decimals: 0, suffix: 'ms', label: 'Average latency' },
  { end: 10, decimals: 0, suffix: 'M+', label: 'Events tracked' },
  { end: 500, decimals: 0, suffix: '+', label: 'Stores onboarded' },
];

const INTEGRATIONS = [
  { name: 'Shopify', Icon: SiShopify },
  { name: 'WooCommerce', Icon: SiWoocommerce },
  { name: 'Google Tag Manager', Icon: SiGoogletagmanager },
  { name: 'Google Analytics 4', Icon: SiGoogleanalytics },
  { name: 'Meta', Icon: SiMeta },
  { name: 'Google Ads', Icon: SiGoogleads },
  { name: 'TikTok', Icon: SiTiktok },
  { name: 'Snapchat', Icon: SiSnapchat },
  { name: 'Pinterest', Icon: SiPinterest },
];

const PROBLEMS = [
  {
    title: 'Ad blockers drop your pixels',
    desc: 'Scripts loaded from third-party domains are blocked before they fire, so purchases never reach your ad platforms.',
  },
  {
    title: 'Safari and Firefox cut cookies short',
    desc: 'Intelligent Tracking Prevention expires browser-set cookies within days, breaking attribution for returning buyers.',
  },
  {
    title: 'Algorithms optimise on partial data',
    desc: 'Meta and Google bid against the conversions they can see. Fewer signals means higher CPA and weaker lookalikes.',
  },
];

const FEATURES = [
  {
    Icon: FiZap,
    title: 'One-click sGTM deployment',
    desc: 'Create a server container from the dashboard. We provision, secure and scale the infrastructure for you.',
  },
  {
    Icon: FiGlobe,
    title: 'First-party domains',
    desc: 'Get an instant auto-generated subdomain, or serve tracking from your own domain with a single A record.',
  },
  {
    Icon: FiShield,
    title: 'Privacy-first by design',
    desc: 'You decide exactly what leaves your server. Built to support GDPR and CCPA consent workflows.',
  },
  {
    Icon: FiBarChart2,
    title: 'Real-time usage analytics',
    desc: 'Track event volume, container health and usage trends per container, with alerts before you hit a limit.',
  },
  {
    Icon: FiActivity,
    title: 'Health monitoring',
    desc: 'Every container is watched around the clock, so a silent tracking outage never costs you a campaign.',
  },
  {
    Icon: FiServer,
    title: 'Isolated infrastructure',
    desc: 'Each container runs in isolation on enterprise-grade servers backed by a 99.9% uptime SLA.',
  },
];

const FAQS = [
  {
    q: 'What is server-side tracking?',
    a: 'Server-side tracking moves your analytics and ad-platform tags from the visitor’s browser to a server you control. Because requests come from your own domain, they are not blocked by ad blockers, cookies last longer, and you control exactly which data is shared with each platform.',
  },
  {
    q: 'Do I need a developer to set this up?',
    a: 'No. eComFly handles hosting, SSL and scaling. You paste one server URL into Google Tag Manager and, if you want to use your own domain, add a single DNS record. We show you every step in the dashboard.',
  },
  {
    q: 'Which platforms does it work with?',
    a: 'Any storefront that can run Google Tag Manager, including Shopify, WooCommerce and custom builds. Events can be forwarded to GA4, Meta Conversions API, Google Ads, TikTok and any other destination supported by server-side GTM.',
  },
  {
    q: 'How do I connect my own domain?',
    a: 'Use the auto-generated subdomain instantly, or add a Type A DNS record pointing your domain to the IP address we provide. We verify the record and activate your custom domain automatically.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Bank Transfer, bKash and Nagad. After you submit your payment details, our team verifies the payment and activates your plan, usually within a few hours.',
  },
  {
    q: 'Can I upgrade or downgrade anytime?',
    a: 'Yes. Upgrade whenever you like from the billing dashboard. Downgrades take effect at the end of your current billing cycle.',
  },
  {
    q: 'What happens if I hit my event limit?',
    a: 'We alert you at 80% and 95% of your limit. At 100% your container keeps running but events are throttled, so upgrade to continue tracking without interruption.',
  },
  {
    q: 'Is the free plan really free?',
    a: 'Yes. You get 10,000 events per month, one sGTM container and an auto-generated subdomain. No credit card required, and no time limit.',
  },
];

function Stat({ end, decimals, suffix, label }) {
  const [ref, value] = useCountUp(end, { decimals });
  return (
    <div className="stat" ref={ref}>
      <span className="stat-num">
        {value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        <small>{suffix}</small>
      </span>
      <span className="stat-lbl">{label}</span>
    </div>
  );
}

export default function HomePage() {
  const rootRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [copied, setCopied] = useState(false);

  useRevealOnScroll(rootRef);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        setShowSticky(window.scrollY > 720);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText('https://track.yourstore.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable */ }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="home" ref={rootRef}>
      {/* Announcement */}
      <div className="announce">
        <p>
          <strong>Free plan:</strong> 10,000 events a month, no credit card.
          <Link to="/register"> Start in 60 seconds <FiArrowRight aria-hidden="true" /></Link>
        </p>
      </div>

      {/* Navbar */}
      <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo" aria-label="eComFly home"><Logo /></Link>

          <nav className="nav-links" aria-label="Primary">
            <a href="#problem">Why server-side</a>
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="nav-actions">
            <Link to="/login" className="nav-signin">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Start free</Link>
          </div>

          <button
            className="nav-burger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu" id="mobile-menu">
            <a href="#problem" onClick={closeMenu}>Why server-side</a>
            <a href="#how" onClick={closeMenu}>How it works</a>
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#pricing" onClick={closeMenu}>Pricing</a>
            <a href="#faq" onClick={closeMenu}>FAQ</a>
            <Link to="/login" onClick={closeMenu}>Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-lg" onClick={closeMenu}>Start free</Link>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-bg" aria-hidden="true" />
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-dot" /> Managed server-side GTM hosting</p>
              <h1 className="hero-title">
                Track every sale your pixels <em>miss.</em>
              </h1>
              <p className="hero-sub">
                eComFly hosts your server-side Google Tag Manager container on your own domain.
                Go live in 60 seconds, bypass ad blockers, and give Meta, Google and TikTok the
                complete conversion data they need to optimise.
              </p>

              <div className="hero-cta">
                <Link to="/register" className="btn btn-primary btn-xl">
                  Start free <FiArrowRight />
                </Link>
                <a href="#calculator" className="btn btn-secondary btn-xl">
                  Estimate your lost revenue
                </a>
              </div>

              <ul className="hero-assure">
                <li><FiCheck aria-hidden="true" /> No credit card</li>
                <li><FiCheck aria-hidden="true" /> 10,000 free events / month</li>
                <li><FiCheck aria-hidden="true" /> No DevOps required</li>
              </ul>
            </div>

            <div className="hero-visual">
              <HeroPipeline />
            </div>
          </div>

          <div className="wrap">
            <div className="stats" role="list">
              {STATS.map((s) => <Stat key={s.label} {...s} />)}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="logos" aria-label="Works with">
          <div className="wrap">
            <p className="logos-label">Plugs into the stack you already run</p>
            <ul className="logos-row">
              {INTEGRATIONS.map(({ name, Icon }) => (
                <li key={name} title={name}>
                  <Icon aria-hidden="true" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Problem */}
        <section className="section" id="problem">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <p className="kicker">The problem</p>
              <h2>Your browser tracking is leaking revenue.</h2>
              <p className="lede">
                Every blocked pixel is a sale your ad platforms never learn from. The gap grows
                as browsers tighten privacy, and you keep paying to optimise on incomplete data.
              </p>
            </div>

            <div className="problems">
              {PROBLEMS.map((p, i) => (
                <article key={p.title} className="problem" data-reveal style={{ '--d': `${i * 80}ms` }}>
                  <span className="problem-n">0{i + 1}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="section section-tint" aria-labelledby="calc-title">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <p className="kicker">Revenue calculator</p>
              <h2 id="calc-title">See what server-side tracking is worth to you.</h2>
              <p className="lede">Adjust the sliders to match your store. The result updates instantly.</p>
            </div>
            <div data-reveal><RoiCalculator /></div>
          </div>
        </section>

        {/* How it works */}
        <section className="section" id="how">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <p className="kicker">How it works</p>
              <h2>From sign-up to live tracking in three steps.</h2>
            </div>

            <ol className="steps">
              <li className="step" data-reveal>
                <div className="step-ui" aria-hidden="true">
                  <div className="mini">
                    <span className="mini-label">Container name</span>
                    <div className="mini-input">my-store</div>
                    <div className="mini-btn">Create container</div>
                  </div>
                </div>
                <span className="step-n">Step 1</span>
                <h3>Create a container</h3>
                <p>Sign up and spin up your sGTM container in one click. A secure tracking subdomain is ready instantly.</p>
              </li>

              <li className="step" data-reveal style={{ '--d': '90ms' }}>
                <div className="step-ui">
                  <div className="mini">
                    <span className="mini-label">Server container URL</span>
                    <div className="mini-code">
                      <code>https://track.yourstore.com</code>
                      <button type="button" onClick={copyUrl} aria-label="Copy example URL">
                        {copied ? <FiCheck /> : <FiCopy />}
                      </button>
                    </div>
                    <span className="mini-hint">Paste into GTM → Admin → Container settings</span>
                  </div>
                </div>
                <span className="step-n">Step 2</span>
                <h3>Connect Tag Manager</h3>
                <p>Copy your server URL into Google Tag Manager as the server container URL. Optionally add your own domain.</p>
              </li>

              <li className="step" data-reveal style={{ '--d': '180ms' }}>
                <div className="step-ui" aria-hidden="true">
                  <div className="mini">
                    <span className="mini-label">Events today</span>
                    <div className="mini-bars">
                      {[38, 52, 44, 68, 59, 82, 74, 96].map((h, i) => (
                        <i key={i} style={{ '--h': `${h}%`, '--i': i }} />
                      ))}
                    </div>
                    <span className="mini-hint"><b className="live-dot" /> Receiving events</span>
                  </div>
                </div>
                <span className="step-n">Step 3</span>
                <h3>Track and scale</h3>
                <p>Events flow through your private server. Monitor usage and upgrade only when your store outgrows the plan.</p>
              </li>
            </ol>

            <div className="center" data-reveal>
              <Link to="/register" className="btn btn-dark btn-lg">Create your container <FiArrowRight /></Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section section-tint" id="features">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <p className="kicker">Platform</p>
              <h2>Everything between your storefront and your ad platforms.</h2>
              <p className="lede">We run the infrastructure so you can focus on campaigns, not servers.</p>
            </div>

            <div className="features">
              {FEATURES.map(({ Icon, title, desc }, i) => (
                <article key={title} className="feature" data-reveal style={{ '--d': `${(i % 3) * 70}ms` }}>
                  <span className="feature-icon"><Icon aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="section" id="pricing">
          <div className="wrap">
            <div className="section-head center" data-reveal>
              <p className="kicker">Pricing</p>
              <h2>Simple pricing that scales with your events.</h2>
              <p className="lede">Start free and upgrade only when you need more volume. Prices in Bangladeshi Taka, billed monthly.</p>
            </div>

            <Pricing />

            <ul className="assurances" data-reveal>
              <li><FiRepeat aria-hidden="true" /><span><strong>Switch plans anytime.</strong> Upgrades are instant; downgrades apply next cycle.</span></li>
              <li><FiShield aria-hidden="true" /><span><strong>SSL on every plan.</strong> Included for your subdomain and custom domains.</span></li>
              <li><FiCreditCard aria-hidden="true" /><span><strong>Pay locally.</strong> Bank Transfer, bKash and Nagad, verified by our team.</span></li>
            </ul>

            <div className="pay" data-reveal>
              <span className="pay-label">Accepted payment methods</span>
              <span className="pay-pill"><FiCreditCard aria-hidden="true" /> Bank Transfer</span>
              <span className="pay-pill"><FiSmartphone aria-hidden="true" /> bKash</span>
              <span className="pay-pill"><FiSmartphone aria-hidden="true" /> Nagad</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section section-tint" id="faq">
          <div className="wrap faq-grid">
            <div className="faq-intro" data-reveal>
              <p className="kicker">FAQ</p>
              <h2>Questions, answered.</h2>
              <p className="lede">Can’t find what you’re looking for? Start free and see for yourself, or reach out to our team.</p>
              <div className="faq-actions">
                <Link to="/register" className="btn btn-primary">Start free <FiArrowRight /></Link>
                <a className="btn btn-secondary" href="mailto:hello@ecomfly.com">Email us</a>
              </div>
            </div>

            <div className="faq-list" data-reveal>
              {FAQS.map((f) => (
                <details key={f.q} name="faq" className="faq">
                  <summary>
                    <span>{f.q}</span>
                    <FiPlus aria-hidden="true" />
                  </summary>
                  <div className="faq-a"><p>{f.a}</p></div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final" aria-labelledby="final-title">
          <div className="wrap">
            <div className="final-card" data-reveal>
              <div className="final-grid" aria-hidden="true" />
              <h2 id="final-title">Your ad platforms are only as good as the data you feed them.</h2>
              <p>Set up server-side tracking today and start counting the conversions you’ve been missing.</p>
              <div className="final-cta">
                <Link to="/register" className="btn btn-primary btn-xl">Start free <FiArrowRight /></Link>
                <a href="#pricing" className="btn btn-secondary btn-xl">Compare plans</a>
              </div>
              <p className="final-note">No credit card · Free plan never expires · Cancel anytime</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <Link to="/" aria-label="eComFly home"><Logo /></Link>
            <p>Managed server-side tracking for ecommerce, simplified.</p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
              <a href="mailto:hello@ecomfly.com" aria-label="Email"><FiMail /></a>
            </div>
          </div>

          <nav className="footer-col" aria-label="Product">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <nav className="footer-col" aria-label="Account">
            <h4>Account</h4>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Create account</Link>
          </nav>
          <nav className="footer-col" aria-label="Legal">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </nav>
        </div>
        <div className="wrap footer-bottom">
          <p>© {new Date().getFullYear()} eComFly. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className={`sticky-cta ${showSticky ? 'is-on' : ''}`} aria-hidden={!showSticky}>
        <div>
          <strong>Start tracking server-side</strong>
          <span>Free · no credit card</span>
        </div>
        <Link to="/register" className="btn btn-primary" tabIndex={showSticky ? 0 : -1}>Start free</Link>
      </div>
    </div>
  );
}
