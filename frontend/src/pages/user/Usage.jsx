import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { FiTrendingUp, FiZap, FiCalendar, FiBarChart2 } from 'react-icons/fi';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const pad = (n) => String(n).padStart(2, '0');

// Fill every day of the current month so the chart has no gaps
const buildDaily = (rows) => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const map = {};
  rows.forEach(r => { map[r.date] = r.events; });
  return Array.from({ length: daysInMonth }, (_, i) => {
    const key = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(i + 1)}`;
    return { day: i + 1, events: map[key] || 0 };
  });
};

// Always show the last 6 months, including months with no events
const buildMonthly = (rows) => {
  const map = {};
  rows.forEach(r => { map[r.month] = r.events; });
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    return { month: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, events: map[key] || 0 };
  });
};

const CustomTooltip = ({active, payload, label}) => {
  if (active && payload?.length) {
    return (
      <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'0.75rem 1rem'}}>
        <p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:'4px'}}>{label}</p>
        <p style={{fontWeight:700,color:'var(--primary-light)'}}>{payload[0].value.toLocaleString()} events</p>
      </div>
    );
  }
  return null;
};

// Generate some basic colors for the pie chart
const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function UserUsage() {
  const [usage, setUsage] = useState({ current_events: 0, event_limit: 10000, percentage: 0 });
  const [history, setHistory] = useState({ daily: [], monthly: [], containers: [], today: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const [u, h] = await Promise.all([api.get('/user/usage'), api.get('/user/usage/history')]);
      setUsage(u.data);
      setHistory(h.data);
      setLastUpdated(new Date());
    } catch {
      // keep previous values on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 10000); // live refresh
    return () => clearInterval(timer);
  }, []);

  const eventLimit = usage.event_limit || 10000;
  const currentEvents = usage.current_events || 0;
  const usagePct = Math.min(100, Math.round((currentEvents / eventLimit) * 100));

  const now = new Date();
  const dayOfMonth = now.getDate();
  const avgPerDay = Math.round(currentEvents / dayOfMonth);
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const dailyData = buildDaily(history.daily);
  const monthlyData = buildMonthly(history.monthly);

  const containerBreakdown = history.containers.map((c, i) => ({
    name: c.name,
    value: Number(c.this_month) || 0,
    color: COLORS[i % COLORS.length]
  })).filter(c => c.value > 0);

  if (containerBreakdown.length === 0) {
    containerBreakdown.push({ name: 'No Events', value: 1, color: 'rgba(255,255,255,0.1)' });
  }

  return (
    <div style={{maxWidth:1200}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Usage Analytics</h1>
          <p className="page-subtitle">Track your event consumption and performance metrics</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.8rem',color:'var(--text-muted)'}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981'}} />
          Live{lastUpdated ? ` · updated ${lastUpdated.toLocaleTimeString()}` : loading ? ' · loading…' : ''}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4 gap-lg" style={{marginBottom:'1.5rem'}}>
        <div className="stat-card indigo">
          <div className="stat-icon indigo"><FiZap /></div>
          <div className="stat-value">{currentEvents.toLocaleString()}</div>
          <div className="stat-label">Events This Month</div>
          <div className="stat-change up"><FiTrendingUp /> {usagePct}% of limit · {history.today.toLocaleString()} today</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><FiBarChart2 /></div>
          <div className="stat-value">{Math.max(0, eventLimit - currentEvents).toLocaleString()}</div>
          <div className="stat-label">Remaining Events</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiTrendingUp /></div>
          <div className="stat-value">{avgPerDay.toLocaleString()}</div>
          <div className="stat-label">Avg Events/Day</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><FiCalendar /></div>
          <div className="stat-value">{resetDate}</div>
          <div className="stat-label">Resets On</div>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-header">
          <h3 className="card-title">Monthly Quota</h3>
          <span className={`badge badge-${usagePct > 90 ? 'danger' : usagePct > 70 ? 'warning' : 'success'}`}>
            {usagePct}% used
          </span>
        </div>
        <div style={{marginBottom:'0.75rem'}}>
          <div className="progress-bar" style={{height:12}}>
            <div className="progress-fill" style={{
              width:`${usagePct}%`,
              background: usagePct > 90 ? 'linear-gradient(90deg,#ef4444,#f87171)' :
                usagePct > 70 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'var(--gradient-primary)'
            }} />
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',color:'var(--text-muted)'}}>
          <span>{currentEvents.toLocaleString()} events used</span>
          <span>{eventLimit.toLocaleString()} event limit</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
        {/* Daily Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Daily Events (This Month)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{fill:'#475569',fontSize:10}} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{fill:'#475569',fontSize:10}} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="events" stroke="#06b6d4" strokeWidth={2} fill="url(#usageGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Pie */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">By Container</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={containerBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4}>
                {containerBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v.toLocaleString()} events`]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginTop:'0.75rem'}}>
            {containerBreakdown.filter(c => c.name !== 'No Events').map((c, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'0.82rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <div style={{width:10,height:10,borderRadius:2,background:c.color,flexShrink:0}} />
                  <span style={{color:'var(--text-secondary)'}}>{c.name}</span>
                </div>
                <span style={{fontWeight:600,color:'var(--text-primary)'}}>{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Monthly Event Trend</h3>
          <p className="text-sm text-muted">Last 6 months</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false} width={45} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="events" fill="url(#barGrad)" radius={[4,4,0,0]}>
              {monthlyData.map((_, i) => (
                <Cell key={i} fill={i === monthlyData.length - 1 ? '#818cf8' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
