import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FiServer, FiZap, FiActivity, FiArrowRight, FiAlertTriangle,
  FiCheckCircle, FiClock, FiTrendingUp
} from 'react-icons/fi';
import api from '../../utils/api';
import './Dashboard.css';

const MOCK_CHART = Array.from({length: 30}, (_, i) => ({
  day: `${i+1}`,
  events: Math.floor(Math.random() * 800 + 200),
}));

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">Day {label}</p>
        <p className="tooltip-value">{payload[0].value.toLocaleString()} events</p>
      </div>
    );
  }
  return null;
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ containers: 0, activeDomains: 0, eventsToday: 0 });
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contRes] = await Promise.all([
        api.get('/containers'),
      ]);
      setContainers(contRes.data.containers || []);
      setStats({
        containers: contRes.data.containers?.length || 0,
        activeDomains: contRes.data.containers?.filter(c => c.custom_domain)?.length || 0,
        eventsToday: Math.floor(Math.random() * 500 + 100),
      });
    } catch {
      // Use mock data for demo
      setContainers([]);
    } finally {
      setLoading(false);
    }
  };

  const eventLimit = user?.event_limit || 10000;
  const currentEvents = user?.current_events || 0;
  const usagePct = Math.min(100, Math.round((currentEvents / eventLimit) * 100));
  const usageColor = usagePct > 90 ? 'danger' : usagePct > 70 ? 'amber' : 'green';

  return (
    <div className="user-dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name}</strong>! Here's your tracking overview.
          </p>
        </div>
        <Link to="/dashboard/containers" className="btn btn-primary">
          <FiServer />
          New Container
        </Link>
      </div>

      {/* Usage Alert */}
      {usagePct >= 80 && (
        <div className={`alert alert-${usagePct >= 95 ? 'danger' : 'warning'} mb-xl`}>
          <FiAlertTriangle />
          <div>
            <strong>Usage Alert:</strong> You've used {usagePct}% of your monthly events.
            {usagePct >= 95 && ' Upgrade now to avoid interruptions.'}
            {' '}<Link to="/dashboard/billing" className="auth-link">Upgrade Plan →</Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-4 gap-lg mb-xl">
        <div className="stat-card indigo">
          <div className="stat-icon indigo"><FiServer /></div>
          <div className="stat-value">{stats.containers}</div>
          <div className="stat-label">Active Containers</div>
          <div className="stat-change up"><FiTrendingUp /> Running</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><FiZap /></div>
          <div className="stat-value">{currentEvents.toLocaleString()}</div>
          <div className="stat-label">Events This Month</div>
          <div className="stat-change up"><FiTrendingUp /> {usagePct}% used</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiActivity /></div>
          <div className="stat-value">{stats.eventsToday}</div>
          <div className="stat-label">Events Today</div>
          <div className="stat-change up"><FiTrendingUp /> Live</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><FiClock /></div>
          <div className="stat-value">{user?.plan_name || 'Free'}</div>
          <div className="stat-label">Current Plan</div>
          <Link to="/dashboard/billing" className="stat-change" style={{color:'var(--primary-light)', textDecoration:'none'}}>
            Upgrade <FiArrowRight />
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-main-grid">
        {/* Event Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Event Volume (Last 30 Days)</h3>
              <p className="text-sm text-muted mt-xs">Daily event tracking activity</p>
            </div>
            <div className="badge badge-success">
              <span className="live-dot" />
              Live
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MOCK_CHART} margin={{top:5, right:10, left:0, bottom:5}}>
              <defs>
                <linearGradient id="eventGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{fill:'#475569', fontSize:11}} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{fill:'#475569', fontSize:11}} axisLine={false} tickLine={false} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="events" stroke="#6366f1" strokeWidth={2}
                fill="url(#eventGrad)" dot={false} activeDot={{r:4, fill:'#6366f1'}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right Column */}
        <div className="dashboard-right-col">
          {/* Usage */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Monthly Usage</h3>
              <span className={`badge badge-${usageColor === 'danger' ? 'danger' : usageColor === 'amber' ? 'warning' : 'success'}`}>
                {usagePct}%
              </span>
            </div>
            <div className="usage-details">
              <div className="usage-numbers">
                <span className="usage-current">{currentEvents.toLocaleString()}</span>
                <span className="usage-sep"> / </span>
                <span className="usage-limit">{eventLimit.toLocaleString()} events</span>
              </div>
              <div className="progress-bar" style={{marginTop:'0.75rem'}}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${usagePct}%`,
                    background: usagePct > 90 ? 'linear-gradient(90deg, #ef4444, #f87171)' :
                      usagePct > 70 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                      'var(--gradient-primary)'
                  }}
                />
              </div>
              <div className="flex justify-between mt-sm">
                <span className="text-xs text-muted">0</span>
                <span className="text-xs text-muted">{(eventLimit - currentEvents).toLocaleString()} remaining</span>
              </div>
            </div>
            <Link to="/dashboard/billing" className="btn btn-secondary w-full mt-md" style={{justifyContent:'center'}}>
              Upgrade Plan <FiArrowRight />
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="card-title mb-lg">Quick Actions</h3>
            <div className="quick-actions">
              {[
                { to: '/dashboard/containers', icon: <FiServer />, label: 'Create Container', color: 'indigo' },
                { to: '/dashboard/domains', icon: <FiActivity />, label: 'Add Domain', color: 'cyan' },
                { to: '/dashboard/billing', icon: <FiZap />, label: 'Upgrade Plan', color: 'amber' },
                { to: '/dashboard/usage', icon: <FiTrendingUp />, label: 'View Usage', color: 'green' },
              ].map((action, i) => (
                <Link key={i} to={action.to} className={`quick-action quick-action-${action.color}`}>
                  <span className={`quick-action-icon ${action.color}`}>{action.icon}</span>
                  <span className="quick-action-label">{action.label}</span>
                  <FiArrowRight className="quick-action-arrow" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Containers List */}
      <div className="card mt-xl">
        <div className="card-header">
          <div>
            <h3 className="card-title">Your Containers</h3>
            <p className="text-sm text-muted mt-xs">Active sGTM containers</p>
          </div>
          <Link to="/dashboard/containers" className="btn btn-secondary btn-sm">
            View All <FiArrowRight />
          </Link>
        </div>

        {containers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FiServer /></div>
            <div className="empty-state-title">No containers yet</div>
            <div className="empty-state-desc">Create your first sGTM container to start tracking</div>
            <Link to="/dashboard/containers" className="btn btn-primary mt-md">
              <FiServer /> Create Container
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Container Name</th>
                  <th>Status</th>
                  <th>Domain</th>
                  <th>Events (Month)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {containers.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td><strong style={{color:'var(--text-primary)'}}>{c.name}</strong></td>
                    <td>
                      <span className={`badge badge-${c.status === 'running' ? 'success' : c.status === 'stopped' ? 'danger' : 'warning'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <code style={{fontSize:'0.78rem', color:'var(--accent-light)'}}>
                        {c.custom_domain || c.auto_domain}
                      </code>
                    </td>
                    <td>{(c.events_count || 0).toLocaleString()}</td>
                    <td>
                      <Link to={`/dashboard/containers/${c.id}`} className="btn btn-ghost btn-sm">
                        Manage <FiArrowRight />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
