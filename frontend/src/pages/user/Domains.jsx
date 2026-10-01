import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiGlobe, FiPlus, FiTrash2, FiCopy, FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import api from '../../utils/api';



const SERVER_IP = '45.134.211.80'; // Example IP

export default function UserDomains() {
  const [domains, setDomains] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ domain: '', container_id: '' });
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDomains();
    api.get('/containers').then(r => setContainers(r.data.containers || [])).catch(() => {});
  }, []);

  const fetchDomains = async () => {
    try {
      const res = await api.get('/domains');
      setDomains(res.data.domains || []);
    } catch {
      toast.error('Failed to load domains');
    }
  };

  const addDomain = async (e) => {
    e.preventDefault();
    if (!form.domain.trim()) return toast.error('Domain required');
    setLoading(true);
    try {
      const res = await api.post('/domains', form);
      toast.success('Domain added! Point your DNS A record to verify.');
      setDomains(prev => [res.data.domain, ...prev]);
      setShowModal(false);
      setForm({ domain: '', container_id: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add domain');
    } finally {
      setLoading(false);
    }
  };

  const removeDomain = async (id) => {
    if (!confirm('Remove this domain?')) return;
    try {
      await api.delete(`/domains/${id}`);
      setDomains(prev => prev.filter(d => d.id !== id));
      toast.success('Domain removed');
    } catch {
      toast.error('Failed to remove domain');
    }
  };

  return (
    <div style={{maxWidth:1200}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Custom Domains</h1>
          <p className="page-subtitle">Use your own domain for server-side tracking</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Domain
        </button>
      </div>

      {/* DNS Instructions Card */}
      <div className="card mb-xl" style={{marginBottom:'1.5rem'}}>
        <div className="card-header">
          <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
            <FiInfo style={{color:'var(--accent-light)'}} />
            <h3 className="card-title">DNS Setup Instructions</h3>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
          <div>
            <h4 style={{fontSize:'0.875rem',fontWeight:600,marginBottom:'0.75rem',color:'var(--text-secondary)'}}>Step 1: Add your domain below</h4>
            <p style={{fontSize:'0.85rem',color:'var(--text-muted)',lineHeight:1.6}}>Enter the subdomain you want to use for tracking (e.g., <code style={{color:'var(--accent-light)'}}>track.yourdomain.com</code>)</p>
          </div>
          <div>
            <h4 style={{fontSize:'0.875rem',fontWeight:600,marginBottom:'0.75rem',color:'var(--text-secondary)'}}>Step 2: Create DNS Type A Record</h4>
            <div style={{background:'var(--bg-void)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'0.875rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                <div style={{display:'flex',gap:'2rem'}}>
                  <div><div style={{fontSize:'0.65rem',color:'var(--text-muted)',marginBottom:'2px',textTransform:'uppercase'}}>Type</div><strong style={{color:'var(--text-primary)'}}>A</strong></div>
                  <div><div style={{fontSize:'0.65rem',color:'var(--text-muted)',marginBottom:'2px',textTransform:'uppercase'}}>Name</div><strong style={{color:'var(--text-primary)'}}>track (or @)</strong></div>
                  <div><div style={{fontSize:'0.65rem',color:'var(--text-muted)',marginBottom:'2px',textTransform:'uppercase'}}>Value / Points To</div><strong style={{color:'var(--accent-light)',fontFamily:'monospace'}}>{SERVER_IP}</strong></div>
                  <div><div style={{fontSize:'0.65rem',color:'var(--text-muted)',marginBottom:'2px',textTransform:'uppercase'}}>TTL</div><strong style={{color:'var(--text-primary)'}}>Auto</strong></div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => {navigator.clipboard.writeText(SERVER_IP); toast.success('IP copied!');}}>
                  <FiCopy /> Copy IP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Domains Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Domains ({domains.length})</h3>
        </div>
        {domains.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FiGlobe /></div>
            <div className="empty-state-title">No custom domains</div>
            <div className="empty-state-desc">Add your own domain for branded tracking URLs</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Container</th>
                  <th>Status</th>
                  <th>DNS Verified</th>
                  <th>Added</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {domains.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <FiGlobe style={{color:'var(--accent-light)'}} />
                        <code style={{color:'var(--accent-light)',fontSize:'0.85rem'}}>{d.domain}</code>
                      </div>
                    </td>
                    <td>{d.container_name || '—'}</td>
                    <td>
                      <span className={`badge badge-${d.status === 'active' ? 'success' : 'warning'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      {d.verified
                        ? <span style={{color:'var(--success-light)',display:'flex',alignItems:'center',gap:'4px'}}><FiCheckCircle />Verified</span>
                        : <span style={{color:'var(--warning-light)',display:'flex',alignItems:'center',gap:'4px'}}><FiAlertCircle />Pending DNS</span>
                      }
                    </td>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => removeDomain(d.id)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add Custom Domain</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={addDomain}>
              <div className="modal-body">
                <div className="alert alert-warning" style={{marginBottom:'1.25rem'}}>
                  <FiAlertCircle />
                  <div style={{fontSize:'0.82rem'}}>
                    After adding, create a <strong>DNS Type A record</strong> pointing to <strong style={{color:'var(--accent-light)',fontFamily:'monospace'}}>{SERVER_IP}</strong>. DNS propagation can take up to 24 hours.
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Domain Name *</label>
                  <input type="text" className="form-input" placeholder="track.yourdomain.com"
                    value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} required />
                  <p className="form-hint">Enter the full subdomain you want to use (no https://)</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Link to Container</label>
                  <select className="form-select" value={form.container_id} onChange={e => setForm({...form, container_id: e.target.value})}>
                    <option value="">Select a container...</option>
                    {containers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><div className="spinner"/><span>Adding...</span></> : <><FiPlus /> Add Domain</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
