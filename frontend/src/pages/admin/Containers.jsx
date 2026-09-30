import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiServer, FiSearch, FiRefreshCw, FiStopCircle, FiPlay, FiExternalLink } from 'react-icons/fi';

const ALL_CONTAINERS = [
  { id:'c1', name:'Main Store Tracking', user:'Ahmed Hassan', email:'ahmed@store.com', status:'running', auto_domain:'main-abc123.ecomfly.io', custom_domain:'track.mystore.com', events:32400, created:'2024-10-01', region:'SGP' },
  { id:'c2', name:'Marketing Tracking', user:'Ahmed Hassan', email:'ahmed@store.com', status:'running', auto_domain:'mktg-xyz789.ecomfly.io', custom_domain:null, events:12400, created:'2024-10-10', region:'SGP' },
  { id:'c3', name:'Pro Analytics', user:'Rahim Uddin', email:'rahim@shop.com', status:'running', auto_domain:'pro-def456.ecomfly.io', custom_domain:'data.shoprahim.com', events:89200, created:'2024-09-15', region:'SGP' },
  { id:'c4', name:'Dev Container', user:'Sara Islam', email:'sara@brand.com', status:'stopped', auto_domain:'dev-ghi789.ecomfly.io', custom_domain:null, events:4200, created:'2024-10-27', region:'SGP' },
  { id:'c5', name:'Error Test', user:'Nadia Rahman', email:'nadia@fashion.com', status:'error', auto_domain:'err-jkl012.ecomfly.io', custom_domain:null, events:0, created:'2024-10-22', region:'SGP' },
];

export default function AdminContainers() {
  const [containers, setContainers] = useState(ALL_CONTAINERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = containers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.user.toLowerCase().includes(search.toLowerCase()) ||
      c.auto_domain.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id, current) => {
    const next = current === 'running' ? 'stopped' : 'running';
    setContainers(prev => prev.map(c => c.id === id ? {...c, status:next} : c));
    toast.success(`Container ${next}`);
  };

  const STATUS = {
    running: 'success', stopped: 'danger', error: 'danger', pending: 'warning'
  };

  return (
    <div style={{maxWidth:1400}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Container Management</h1>
          <p className="page-subtitle">{containers.length} total containers · {containers.filter(c=>c.status==='running').length} running</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:'1.25rem',padding:'1rem'}}>
        <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:220,position:'relative'}}>
            <FiSearch style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}} />
            <input type="text" className="form-input" placeholder="Search containers..."
              value={search} onChange={e => setSearch(e.target.value)} style={{paddingLeft:'2.25rem'}} />
          </div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            {['all','running','stopped','error'].map(f => (
              <button key={f} className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(f)} style={{textTransform:'capitalize'}}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Container</th>
                <th>User</th>
                <th>Status</th>
                <th>Domain</th>
                <th>Events (Month)</th>
                <th>Region</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
                      <div style={{width:30,height:30,background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'var(--radius-sm)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',color:'var(--primary-light)',flexShrink:0}}>
                        <FiServer />
                      </div>
                      <span style={{fontWeight:600,color:'var(--text-primary)',fontSize:'0.875rem'}}>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{fontSize:'0.82rem'}}>
                      <div style={{fontWeight:500,color:'var(--text-primary)'}}>{c.user}</div>
                      <div style={{color:'var(--text-muted)',fontSize:'0.72rem'}}>{c.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${STATUS[c.status] || 'neutral'}`}>{c.status}</span>
                  </td>
                  <td>
                    <div>
                      <code style={{fontSize:'0.75rem',color:'var(--accent-light)',display:'block'}}>{c.auto_domain}</code>
                      {c.custom_domain && <code style={{fontSize:'0.72rem',color:'var(--success-light)'}}>{c.custom_domain}</code>}
                    </div>
                  </td>
                  <td style={{fontWeight:600}}>{c.events.toLocaleString()}</td>
                  <td><span className="badge badge-neutral">{c.region}</span></td>
                  <td style={{fontSize:'0.82rem'}}>{c.created}</td>
                  <td>
                    <div style={{display:'flex',gap:'0.375rem'}}>
                      <button
                        className={`btn btn-sm ${c.status === 'running' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleStatus(c.id, c.status)}
                        title={c.status === 'running' ? 'Stop' : 'Start'}
                      >
                        {c.status === 'running' ? <FiStopCircle /> : <FiPlay />}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toast.success('Container restarted')} title="Restart">
                        <FiRefreshCw />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`.btn-success{background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.3);color:var(--success-light);}.btn-success:hover{background:rgba(16,185,129,0.25);}.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap;}.page-title{font-size:1.8rem;font-weight:800;background:var(--gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.25rem;}.page-subtitle{color:var(--text-secondary);font-size:0.9rem;}`}</style>
    </div>
  );
}
