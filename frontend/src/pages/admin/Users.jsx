import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiUsers, FiSearch, FiFilter, FiArrowRight, FiEye, FiEdit,
  FiTrash2, FiUserCheck, FiUserX, FiDownload
} from 'react-icons/fi';

const ALL_USERS = [
  { id:'u1', name:'Ahmed Hassan', email:'ahmed@store.com', plan:'Starter', containers:2, events:32400, eventLimit:100000, joined:'2024-10-28', status:'active', lastLogin:'2024-10-29' },
  { id:'u2', name:'Sara Islam', email:'sara@brand.com', plan:'Free', containers:1, events:4200, eventLimit:10000, joined:'2024-10-27', status:'active', lastLogin:'2024-10-28' },
  { id:'u3', name:'Rahim Uddin', email:'rahim@shop.com', plan:'Pro', containers:5, events:312000, eventLimit:500000, joined:'2024-10-26', status:'active', lastLogin:'2024-10-29' },
  { id:'u4', name:'Fatima Khatun', email:'fatima@market.com', plan:'Free', containers:1, events:9800, eventLimit:10000, joined:'2024-10-25', status:'pending', lastLogin:'2024-10-25' },
  { id:'u5', name:'Karim Sheikh', email:'karim@ecom.com', plan:'Starter', containers:3, events:78000, eventLimit:100000, joined:'2024-10-24', status:'active', lastLogin:'2024-10-27' },
  { id:'u6', name:'Nadia Rahman', email:'nadia@fashion.com', plan:'Pro', containers:8, events:430000, eventLimit:500000, joined:'2024-10-20', status:'suspended', lastLogin:'2024-10-20' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(ALL_USERS);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'all' || u.plan.toLowerCase() === planFilter.toLowerCase();
    return matchSearch && matchPlan;
  });

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUsers(prev => prev.map(u => u.id === id ? {...u, status: newStatus} : u));
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
  };

  return (
    <div style={{maxWidth:1400}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} total users on the platform</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => toast.success('Export started')}>
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:'1.25rem',padding:'1rem'}}>
        <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:250,position:'relative'}}>
            <FiSearch style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',fontSize:'0.9rem'}} />
            <input
              type="text" className="form-input" placeholder="Search users..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{paddingLeft:'2.25rem'}}
            />
          </div>
          <select className="form-select" style={{width:'auto',minWidth:160}}
            value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Containers</th>
                <th>Events Usage</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const usagePct = Math.round((u.events / u.eventLimit) * 100);
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                        <div style={{width:34,height:34,background:'var(--gradient-primary)',borderRadius:'var(--radius-sm)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,color:'white',flexShrink:0}}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{fontWeight:600,color:'var(--text-primary)',fontSize:'0.875rem'}}>{u.name}</div>
                          <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${u.plan === 'Pro' ? 'info' : u.plan === 'Starter' ? 'primary' : u.plan === 'Enterprise' ? 'warning' : 'neutral'}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td style={{textAlign:'center'}}>{u.containers}</td>
                    <td style={{minWidth:180}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <div className="progress-bar" style={{flex:1,height:6}}>
                          <div className="progress-fill" style={{
                            width:`${usagePct}%`,
                            background: usagePct > 90 ? 'linear-gradient(90deg,#ef4444,#f87171)' :
                              usagePct > 70 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'var(--gradient-primary)'
                          }} />
                        </div>
                        <span style={{fontSize:'0.72rem',color:'var(--text-muted)',whiteSpace:'nowrap'}}>{usagePct}%</span>
                      </div>
                      <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'2px'}}>
                        {u.events.toLocaleString()} / {u.eventLimit.toLocaleString()}
                      </div>
                    </td>
                    <td style={{fontSize:'0.82rem'}}>{u.joined}</td>
                    <td>
                      <span className={`badge badge-${u.status === 'active' ? 'success' : u.status === 'suspended' ? 'danger' : 'warning'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div style={{display:'flex',gap:'0.375rem'}}>
                        <Link to={`/admin/users/${u.id}`} className="btn btn-ghost btn-sm" title="View Details">
                          <FiEye />
                        </Link>
                        <button
                          className={`btn btn-sm ${u.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleStatus(u.id, u.status)}
                          title={u.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          {u.status === 'active' ? <FiUserX /> : <FiUserCheck />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><FiUsers /></div>
            <div className="empty-state-title">No users found</div>
          </div>
        )}
      </div>

      <style>{`.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap;}.page-title{font-size:1.8rem;font-weight:800;background:var(--gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.25rem;}.page-subtitle{color:var(--text-secondary);font-size:0.9rem;}`}</style>
    </div>
  );
}
