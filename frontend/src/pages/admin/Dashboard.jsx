import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiServer, FiZap, FiDollarSign, FiTrendingUp, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CHART_DATA = Array.from({length:30}, (_, i) => ({
  day: i+1,
  events: Math.floor(Math.random()*8000+2000),
  users: Math.floor(Math.random()*5+1),
}));

const RECENT_SIGNUPS = [
  { id:'u1', name:'Ahmed Hassan', email:'ahmed@store.com', plan:'Starter', containers:2, joined:'2024-10-28', status:'active' },
  { id:'u2', name:'Sara Islam', email:'sara@brand.com', plan:'Free', containers:1, joined:'2024-10-27', status:'active' },
  { id:'u3', name:'Rahim Uddin', email:'rahim@shop.com', plan:'Pro', containers:5, joined:'2024-10-26', status:'active' },
  { id:'u4', name:'Fatima Khatun', email:'fatima@market.com', plan:'Free', containers:1, joined:'2024-10-25', status:'pending' },
];

export default function AdminDashboard() {
  const stats = [
    { label:'Total Users', value:'247', change:'+12', color:'indigo', icon:<FiUsers /> },
    { label:'Active Containers', value:'189', change:'+8', color:'cyan', icon:<FiServer /> },
    { label:'Events Today', value:'48,291', change:'+5%', color:'green', icon:<FiZap /> },
    { label:'Revenue (Month)', value:'৳87,100', change:'+18%', color:'amber', icon:<FiDollarSign /> },
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
          <Link to="/admin/plans" className="btn btn-primary btn-sm"><FiDollarSign /> Manage Plans</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4 gap-lg" style={{marginBottom:'1.5rem'}}>
        {stats.map((s,i) => (
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
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{fill:'#475569',fontSize:10}} axisLine={false} tickLine={false} interval={4}/>
              <YAxis tick={{fill:'#475569',fontSize:10}} axisLine={false} tickLine={false} width={50}/>
              <Tooltip />
              <Area type="monotone" dataKey="events" stroke="#6366f1" strokeWidth={2} fill="url(#adminGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Plan Distribution</h3></div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.875rem',padding:'0.5rem 0'}}>
            {[
              {plan:'Free', count:142, pct:57, color:'var(--text-muted)'},
              {plan:'Starter', count:68, pct:28, color:'var(--primary)'},
              {plan:'Pro', count:30, pct:12, color:'var(--accent)'},
              {plan:'Enterprise', count:7, pct:3, color:'var(--warning)'},
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

      {/* Alerts */}
      <div className="card" style={{marginBottom:'1.5rem',border:'1px solid rgba(245,158,11,0.2)',background:'rgba(245,158,11,0.04)'}}>
        <div className="card-header">
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',color:'var(--warning-light)'}}>
            <FiAlertCircle />
            <h3 className="card-title" style={{color:'var(--warning-light)'}}>Pending Actions</h3>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
          {[
            {label:'Pending Payments', count:4, link:'/admin/payments'},
            {label:'Unverified Domains', count:2, link:'/admin/containers'},
            {label:'Support Requests', count:1, link:'/admin/users'},
          ].map((item,i) => (
            <Link key={i} to={item.link} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.875rem',background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:'var(--radius-md)',textDecoration:'none',transition:'all 0.2s'}}>
              <span style={{fontSize:'0.875rem',color:'var(--text-secondary)'}}>{item.label}</span>
              <span style={{fontWeight:800,color:'var(--warning-light)',fontSize:'1.1rem'}}>{item.count}</span>
            </Link>
          ))}
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
                <th>Containers</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SIGNUPS.map(u => (
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
                  <td><span className={`badge badge-${u.plan === 'Pro' ? 'info' : u.plan === 'Starter' ? 'primary' : 'neutral'}`}>{u.plan}</span></td>
                  <td>{u.containers}</td>
                  <td style={{fontSize:'0.82rem'}}>{u.joined}</td>
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
