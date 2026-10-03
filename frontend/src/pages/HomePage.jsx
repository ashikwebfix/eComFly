import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiServer, FiZap, FiShield, FiGlobe, FiBarChart2, FiCheck,
  FiArrowRight, FiStar, FiMail, FiTwitter, FiLinkedin, FiMenu, FiX, FiSun, FiMoon,
  FiActivity, FiBox, FiLayers
} from 'react-icons/fi';
import { RiRocketLine, RiRadarLine, RiSpeedLine, RiCodeSSlashLine } from 'react-icons/ri';
import { useTheme } from '../contexts/ThemeContext';
import './HomePage.css';

const PLANS = [
  {
    name: 'Free',
    price: '0',
    period: 'forever',
    events: '10,000',
    color: 'neutral',
    badge: null,
    features: [
      '10,000 events / month',
      '1 sGTM container',
      '1 auto-generated subdomain',
      'Basic analytics dashboard',
      'Community support',
      'SSL included',
    ],
    notIncluded: [
      'Custom domain',
      'Priority support',
      'Advanced analytics',
      'Multiple containers',
    ]
  },
  {
    name: 'Starter',
    price: '29',
    period: 'month',
    events: '100,000',
    color: 'indigo',
    badge: 'Popular',
    features: [
      '100,000 events / month',
      '3 sGTM containers',
      '3 auto-generated subdomains',
      '1 custom domain',
      'Advanced analytics',
      'Email support (48h)',
      'SSL included',
      'Container health monitoring',
    ],
    notIncluded: [
      'Priority support',
      'Unlimited containers',
    ]
  },
  {
    name: 'Pro',
    price: '79',
    period: 'month',
    events: '500,000',
    color: 'cyan',
    badge: 'Best Value',
    features: [
      '500,000 events / month',
      '10 sGTM containers',
      '10 auto-generated subdomains',
      '5 custom domains',
      'Advanced analytics & reports',
      'Priority email support (24h)',
      'SSL included',
      'Container health monitoring',
      'Usage alerts & notifications',
    ],
    notIncluded: []
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    events: 'Unlimited',
    color: 'gold',
    badge: 'Enterprise',
    features: [
      'Unlimited events',
      'Unlimited containers',
      'Unlimited custom domains',
      'Dedicated infrastructure',
      'SLA guarantee',
      'Dedicated account manager',
      'Custom integrations',
      'On-premise option',
    ],
    notIncluded: []
  },
];

const FEATURES = [
  {
    icon: <RiRocketLine />,
    color: 'indigo',
    title: 'Instant sGTM Deployment',
    desc: 'Deploy server-side Google Tag Manager containers in seconds. No DevOps knowledge required — we handle the infrastructure.'
  },
  {
    icon: <FiGlobe />,
    color: 'cyan',
    title: 'Auto-Generated Domains',
    desc: 'Get a secure subdomain instantly. Or bring your own domain and point a Type A record to our IP for a seamless setup.'
  },
  {
    icon: <FiShield />,
    color: 'green',
    title: 'Privacy-First Tracking',
    desc: 'Server-side tracking bypasses ad blockers, improves data accuracy, and keeps you compliant with GDPR and CCPA.'
  },
  {
    icon: <FiBarChart2 />,
    color: 'amber',
    title: 'Real-Time Analytics',
    desc: 'Monitor event counts, container performance, and usage trends from a beautiful, intuitive dashboard.'
  },
  {
    icon: <FiZap />,
    color: 'indigo',
    title: 'Event-Based Pricing',
    desc: 'Pay only for what you use. Start free with 10k events and upgrade as your business grows.'
  },
  {
    icon: <FiServer />,
    color: 'cyan',
    title: 'VPS-Powered Infrastructure',
    desc: 'Enterprise-grade servers with 99.9% uptime SLA. Isolated containers ensure your tracking is always reliable.'
  },
];

const STATS = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50ms', label: 'Avg Latency' },
  { value: '10M+', label: 'Events Tracked' },
  { value: '500+', label: 'Happy Customers' },
];

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const faqs = [
    {
      q: 'What is server-side tracking?',
      a: 'Server-side tracking moves your analytics from the browser to a secure server. This bypasses ad blockers, improves data accuracy, and gives you full control over what data is sent — leading to better conversions and compliance.'
    },
    {
      q: 'How do I connect my domain?',
      a: 'You can use our auto-generated subdomain instantly. To use your own domain, simply add a Type A DNS record pointing to our provided IP address. The system will verify and activate it automatically.'
    },
    {
      q: 'What payment methods are accepted?',
      a: 'We accept Bank Transfer, bKash, and Nagad. After payment, our team manually verifies and activates your plan within a few hours.'
    },
    {
      q: 'Can I upgrade my plan anytime?',
      a: 'Yes! You can upgrade your plan at any time from your billing dashboard. Downgrades take effect at the end of your billing cycle.'
    },
    {
      q: 'What happens when I hit my event limit?',
      a: 'We notify you at 80% and 95% usage. When you hit 100%, your container continues running but events are throttled. Upgrade to continue tracking without interruption.'
    },
    {
      q: 'Is there a free plan?',
      a: 'Yes! Our free plan includes 10,000 events per month, 1 sGTM container, and an auto-generated subdomain — no credit card required.'
    },
  ];

  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <RiRadarLine />
            </div>
            <span className="logo-text">eComFly</span>
          </Link>

          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>

          <div className="nav-actions">
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '0.4rem 0.6rem' }} 
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
            {mobileMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {mobileMenu && (
          <div className="mobile-menu">
            <a href="#features" className="mobile-nav-link" onClick={() => setMobileMenu(false)}>Features</a>
            <a href="#pricing" className="mobile-nav-link" onClick={() => setMobileMenu(false)}>Pricing</a>
            <a href="#faq" className="mobile-nav-link" onClick={() => setMobileMenu(false)}>FAQ</a>
            <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenu(false)}>Sign In</Link>
            <Link to="/register" className="btn btn-primary w-full" onClick={() => setMobileMenu(false)}>Get Started Free</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <RiSpeedLine />
            <span>Server-Side Tracking Made Simple</span>
          </div>

          <h1 className="hero-title">
            Deploy sGTM Containers <br />
            <span className="gradient-text">in Under 60 Seconds</span>
          </h1>

          <p className="hero-subtitle">
            eComFly gives your ecommerce business enterprise-grade server-side tracking infrastructure.
            Bypass ad blockers, improve conversion data, and scale your analytics — all without any DevOps hassle.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-xl">
              Start for Free <FiArrowRight />
            </Link>
            <a href="#pricing" className="btn btn-secondary btn-xl">
              View Pricing
            </a>
          </div>

          <p className="hero-note">✓ Free plan available · ✓ No credit card required · ✓ Deploy in 60 seconds</p>
        </div>

        {/* 3D Hero Visual Element */}
        <div className="hero-visual-wrapper">
          <div className="floating-badge badge-1">
            <FiLayers /> Server-Side
          </div>
          <div className="floating-badge badge-2">
            <RiCodeSSlashLine /> GTM Ready
          </div>
          <div className="floating-badge badge-3">
            <FiActivity /> 99.9% Uptime
          </div>
          
          <div className="hero-dashboard-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="mockup-url">app.ecomfly.com/deploy</div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-line w-full"></div>
                <div className="mockup-line w-3/4"></div>
                <div className="mockup-line w-1/2"></div>
                <div className="mockup-line w-full mt-auto"></div>
              </div>
              <div className="mockup-content">
                <div className="mockup-card">
                  <div className="mockup-card-title"></div>
                  <div className="mockup-chart">
                    <div className="mockup-bar" style={{height: '40%'}}></div>
                    <div className="mockup-bar" style={{height: '65%'}}></div>
                    <div className="mockup-bar" style={{height: '45%'}}></div>
                    <div className="mockup-bar" style={{height: '90%'}}></div>
                    <div className="mockup-bar" style={{height: '75%'}}></div>
                    <div className="mockup-bar" style={{height: '100%'}}></div>
                  </div>
                </div>
                <div className="mockup-card-small-group">
                  <div className="mockup-card-small"></div>
                  <div className="mockup-card-small"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          {STATS.map((stat, i) => (
            <div key={i} className="stat-item">
              <span className="stat-number">{stat.value}</span>
              <span className="stat-label-text">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CRO Section */}
      <section id="cro" className="section cro-section">
        <div className="section-inner">
          <div className="cro-container">
            <div className="cro-content">
              <span className="section-tag tag-amber">Conversion Optimization</span>
              <h2 className="section-title">Recover <span className="gradient-text-amber">20-30%</span> of Lost Data</h2>
              <p className="cro-desc">
                Ad blockers and ITP (Intelligent Tracking Prevention) are silently killing your ROAS. By moving your tracking server-side, you feed Facebook CAPI and Google Ads the pristine, first-party data they need to optimize campaigns.
              </p>
              <ul className="cro-list">
                <li><FiCheck className="icon-green" /> Decrease Cost Per Acquisition (CPA)</li>
                <li><FiCheck className="icon-green" /> Boost Return on Ad Spend (ROAS)</li>
                <li><FiCheck className="icon-green" /> Feed 100% accurate data to algorithms</li>
                <li><FiCheck className="icon-green" /> Completely immune to browser ad-blockers</li>
              </ul>
            </div>
            <div className="cro-visual">
              <div className="cro-card">
                <div className="cro-card-header">
                  <div>
                    <h4 className="cro-card-title">Campaign ROAS</h4>
                    <p className="cro-card-subtitle">Last 30 Days vs Previous</p>
                  </div>
                  <div className="cro-badge">+ 34.2%</div>
                </div>
                <div className="cro-chart">
                  <div className="cro-bar-group">
                    <div className="cro-bar cro-bar-old">
                      <div className="cro-bar-fill" style={{ height: '45%' }}></div>
                    </div>
                    <span className="cro-label">Browser<br/>Only</span>
                  </div>
                  <div className="cro-bar-group">
                    <div className="cro-bar cro-bar-new">
                      <div className="cro-bar-fill" style={{ height: '95%' }}></div>
                    </div>
                    <span className="cro-label">Server-Side<br/>(eComFly)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Why eComFly?</span>
            <h2 className="section-title">Everything you need for <br /><span className="gradient-text">server-side tracking</span></h2>
            <p className="section-subtitle">
              A complete platform that handles the complexity of sGTM so you can focus on growing your business.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card feature-${f.color}`}>
                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-dark">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Simple Setup</span>
            <h2 className="section-title">Get tracking in <span className="gradient-text">3 simple steps</span></h2>
          </div>

          <div className="steps-grid">
            {[
              { num: '01', title: 'Create Container', desc: 'Sign up and create your sGTM container with one click. Get an auto-generated tracking domain instantly.', icon: <FiServer /> },
              { num: '02', title: 'Connect Tag Manager', desc: 'Copy the server URL and paste it into your Google Tag Manager as the server container URL.', icon: <FiZap /> },
              { num: '03', title: 'Track & Scale', desc: 'Events flow through your private server. Monitor, analyze, and scale as your business grows.', icon: <FiBarChart2 /> },
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{step.num}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                {i < 2 && <div className="step-arrow"><FiArrowRight /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">Simple, <span className="gradient-text">event-based pricing</span></h2>
            <p className="section-subtitle">
              Start free. Scale as you grow. Offline payment via Bank Transfer, bKash & Nagad.
            </p>
          </div>

          <div className="pricing-grid">
            {PLANS.map((plan, i) => (
              <div key={i} className={`pricing-card ${plan.color} ${plan.badge === 'Popular' ? 'featured' : ''}`}>
                {plan.badge && <div className={`pricing-badge ${plan.color}`}>{plan.badge}</div>}

                <div className="pricing-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-events">{plan.events} events/mo</div>
                  <div className="plan-price">
                    {plan.price === 'Custom' ? (
                      <span className="price-custom">Custom</span>
                    ) : (
                      <>
                        <span className="price-currency">৳</span>
                        <span className="price-amount">{plan.price}</span>
                        {plan.period && <span className="price-period">/{plan.period}</span>}
                      </>
                    )}
                  </div>
                </div>

                <div className="plan-features">
                  {plan.features.map((f, j) => (
                    <div key={j} className="plan-feature">
                      <FiCheck className="feature-check" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((f, j) => (
                    <div key={j} className="plan-feature disabled">
                      <FiX className="feature-x" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/register"
                  className={`btn w-full ${plan.badge === 'Popular' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                >
                  {plan.price === 'Custom' ? 'Contact Us' : plan.price === '0' ? 'Start Free' : 'Get Started'}
                  <FiArrowRight />
                </Link>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            <p className="payment-title">Accepted Payment Methods</p>
            <div className="payment-badges">
              <div className="payment-badge">🏦 Bank Transfer</div>
              <div className="payment-badge">📱 bKash</div>
              <div className="payment-badge">📱 Nagad</div>
              <div className="payment-badge">✅ Manual Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section section-dark">
        <div className="section-inner section-narrow">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">Frequently asked <span className="gradient-text">questions</span></h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`}>
                <button className="faq-question" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="faq-toggle">{activeFaq === i ? '−' : '+'}</span>
                </button>
                {activeFaq === i && (
                  <div className="faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="cta-bg">
          <div className="cta-orb" />
        </div>
        <div className="section-inner text-center">
          <div className="cta-content">
            <h2 className="cta-title">Ready to supercharge your tracking?</h2>
            <p className="cta-subtitle">Join hundreds of ecommerce stores already using eComFly for server-side analytics.</p>
            <Link to="/register" className="btn btn-primary btn-xl">
              Start Free Today <FiArrowRight />
            </Link>
            <p className="cta-note">No credit card required · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="logo-icon"><RiRadarLine /></div>
              <span className="logo-text">eComFly</span>
            </Link>
            <p className="footer-tagline">Server-side tracking for ecommerce, simplified.</p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
              <a href="#" aria-label="Email"><FiMail /></a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <Link to="/register">Get Started</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 eComFly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
