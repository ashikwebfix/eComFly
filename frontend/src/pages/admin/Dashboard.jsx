import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiServer, FiZap, FiDollarSign, FiTrendingUp, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../utils/api';

const CHART_DATA = Array.from({length:30}, (_, i) => ({
  day: i+1,
  events: 0,
  users: 0,
}));

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_containers: 0,
    total_events_today: 0,
  });
  const [recentSignups, setRecentSignups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      // Get most recent 5 users
      setRecentSignups(usersRes.data.users?.slice(0, 5) || []);
    } catch (err) {
      console.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { label:'Total Users', value: stats.total_users, change: 'Live', color:'indigo', icon:<FiUsers /> },
    { label:'Active Containers', value: stats.total_containers, change:'Live', color:'cyan', icon:<FiServer /> },
    { label:'Events Today', value: stats.total_events_today.toLocaleString(), change:'Live', color:'green', icon:<FiZap /> },
    { label:'Active Users', value: stats.active_users, change:'Live', color:'amber', icon:<FiUsers /> },
  ];

  return (
    <div style={{maxWidth:1400}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Overview</h1>
          <p className="page-subtitle">Platform-wide metrics and management</p>
        </div>
        <div style={{display:'flex',gap:'0.75rem'}}>
          <Link to="/admin/users" className="btn btn-secondary btn-sm"><FiUsers /> Manage Users</Link>
          <Link to="/admin/plans" className="btn btn-primary btn-sm"><span style={{fontWeight:'bold'}}>TK</span> Manage Plans</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4 gap-lg" style={{marginBottom:'1.5rem'}}>
        {dashboardStats.map((s,i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change up"><FiTrendingUp />{s.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Platform Events (Last 30 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2350f0" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2350f0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eaecf0" />
              <XAxis dataKey="day" tick={{fill:'#667085',fontSize:10}} axisLine={false} tickLine={false} interval={4}/>
              <YAxis tick={{fill:'#667085',fontSize:10}} axisLine={false} tickLine={false} width={50}/>
              <Tooltip />
              <Area type="monotone" dataKey="events" stroke="#2350f0" strokeWidth={2} fill="url(#adminGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Plan Distribution</h3></div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.875rem',padding:'0.5rem 0'}}>
            {[
              {plan:'Free', count: stats.total_users, pct: 100, color:'var(--text-muted)'},
            ].map((p,i) => (
              <div key={i}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',marginBottom:'4px'}}>
                  <span style={{color:'var(--text-secondary)',fontWeight:500}}>{p.plan}</span>
                  <span style={{color:'var(--text-primary)',fontWeight:700}}>{p.count} <span style={{color:'var(--text-muted)',fontWeight:400}}>({p.pct}%)</span></span>
                </div>
                <div className="progress-bar" style={{height:6}}>
                  <div className="progress-fill" style={{width:`${p.pct}%`,background:p.color}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Signups */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent User Signups</h3>
          <Link to="/admin/users" className="btn btn-secondary btn-sm">View All <FiArrowRight /></Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Events limit</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentSignups.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                      <div style={{width:32,height:32,background:'var(--gradient-primary)',borderRadius:'var(--radius-sm)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'white',flexShrink:0}}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{fontWeight:600,color:'var(--text-primary)',fontSize:'0.875rem'}}>{u.name}</div>
                        <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${u.plan_name === 'Pro' ? 'info' : u.plan_name === 'Starter' ? 'primary' : 'neutral'}`}>{u.plan_name || 'Free'}</span></td>
                  <td>{u.event_limit}</td>
                  <td style={{fontSize:'0.82rem'}}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${u.status === 'active' ? 'success' : 'warning'}`}>{u.status}</span></td>
                  <td><Link to={`/admin/users/${u.id}`} className="btn btn-ghost btn-sm">View <FiArrowRight /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap;}.page-title{font-size:1.8rem;font-weight:800;background:var(--gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.25rem;}.page-subtitle{color:var(--text-secondary);font-size:0.9rem;}`}</style>
    </div>
  );
}
