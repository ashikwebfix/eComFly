import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiExternalLink, FiServer, FiGlobe, FiZap, FiRefreshCw, FiEdit2, FiX } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const CHART_DATA = Array.from({length: 24}, (_, i) => ({
  hour: `${i}:00`,
  events: 0,
}));

export default function ContainerDetail() {
  const { id } = useParams();
  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', container_config: '', notes: '' });

  useEffect(() => {
    fetchContainer();
  }, [id]);

  const fetchContainer = async () => {
    try {
      const res = await api.get(`/containers/${id}`);
      setContainer(res.data.container);
    } catch {
      toast.error('Failed to load container details');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const openEditModal = () => {
    setEditForm({
      name: container.name || '',
      container_config: container.container_config || '',
      notes: container.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.container_config.trim()) {
      return toast.error('Name and Config string are required');
    }
    setSaving(true);
    try {
      const res = await api.put(`/containers/${id}`, editForm);
      setContainer(res.data.container);
      toast.success('Container updated successfully!');
      setShowEditModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating container');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-xl"><div className="spinner spinner-lg"></div></div>;
  if (!container) return <div className="p-xl text-center">Container not found</div>;

  return (
    <div style={{maxWidth:1100}}>
      <div style={{marginBottom:'1.5rem'}}>
        <Link to="/dashboard/containers" className="btn btn-ghost btn-sm" style={{marginBottom:'1rem'}}>
          <FiArrowLeft /> Back to Containers
        </Link>
        <div className="page-header">
          <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
            <div style={{width:48,height:48,background:'rgba(35,80,240,0.15)',border:'1px solid rgba(35,80,240,0.3)',borderRadius:'var(--radius-lg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',color:'var(--primary-light)'}}>
              <FiServer />
            </div>
            <div>
              <h1 className="page-title" style={{marginBottom:0}}>{container.name}</h1>
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginTop:'4px'}}>
                <span className="badge badge-success" style={{display:'flex',alignItems:'center',gap:'4px'}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'var(--success)',display:'inline-block',animation:'pulse 2s infinite'}} />
                  Running
                </span>
                <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>Region: {container.server_region}</span>
                <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>v{container.container_version}</span>
              </div>
            </div>
          </div>
          <div style={{display:'flex', gap:'0.5rem'}}>
            <button className="btn btn-secondary" onClick={openEditModal}>
              <FiEdit2 /> Edit
            </button>
            <button className="btn btn-secondary" onClick={() => toast.success('Container restarted')}>
              <FiRefreshCw /> Restart
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-4 gap-lg" style={{marginBottom:'1.5rem'}}>
        <div className="stat-card indigo">
          <div className="stat-icon indigo"><FiZap /></div>
          <div className="stat-value">{container.events_today}</div>
          <div className="stat-label">Events Today</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><FiZap /></div>
          <div className="stat-value">{container.events_count.toLocaleString()}</div>
          <div className="stat-label">Events This Month</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiServer /></div>
          <div className="stat-value">99.9%</div>
          <div className="stat-label">Uptime</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><FiGlobe /></div>
          <div className="stat-value">{container.custom_domain ? '2' : '1'}</div>
          <div className="stat-label">Active Domains</div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'1.5rem'}}>
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Events Today (24h)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2350f0" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#2350f0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eaecf0" />
              <XAxis dataKey="hour" tick={{fill:'#667085',fontSize:9}} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{fill:'#667085',fontSize:10}} axisLine={false} tickLine={false} width={35} />
              <Tooltip />
              <Area type="monotone" dataKey="events" stroke="#2350f0" strokeWidth={2} fill="url(#detailGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Config Panel */}
        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          {/* GTM Setup */}
          <div className="card">
            <h3 className="card-title" style={{marginBottom:'1rem'}}>GTM Server URL</h3>
            <div style={{background:'var(--bg-void)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'0.875rem',marginBottom:'0.875rem'}}>
              <div style={{fontSize:'0.68rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.5rem'}}>Server Container URL</div>
              <div style={{display:'flex',alignItems:'center',gap:'0.375rem'}}>
                <code style={{flex:1,fontSize:'0.78rem',color:'var(--accent-light)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  https://{container.custom_domain || container.auto_domain}
                </code>
                <button className="btn btn-ghost btn-sm" onClick={() => copy(`https://${container.custom_domain || container.auto_domain}`, 'URL')}>
                  <FiCopy />
                </button>
              </div>
            </div>
            <div style={{fontSize:'0.78rem',color:'var(--text-muted)',lineHeight:1.5}}>
              Paste this URL in Google Tag Manager → Admin → Container Settings → Server Container URL
            </div>
          </div>

          {/* Domain Info */}
          <div className="card">
            <h3 className="card-title" style={{marginBottom:'1rem'}}>Domains</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <div style={{padding:'0.75rem',background:'var(--bg-surface)',borderRadius:'var(--radius-md)'}}>
                <div style={{fontSize:'0.68rem',color:'var(--text-muted)',textTransform:'uppercase',marginBottom:'4px'}}>Auto Domain</div>
                <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                  <code style={{fontSize:'0.78rem',color:'var(--text-secondary)',flex:1}}>{container.auto_domain}</code>
                  <button className="icon-copy-btn" onClick={() => copy(container.auto_domain, 'Domain')}><FiCopy style={{fontSize:'0.75rem'}} /></button>
                </div>
              </div>
              {container.custom_domain && (
                <div style={{padding:'0.75rem',background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'var(--radius-md)'}}>
                  <div style={{fontSize:'0.68rem',color:'var(--success-light)',textTransform:'uppercase',marginBottom:'4px',fontWeight:700}}>✓ Custom Domain (Active)</div>
                  <code style={{fontSize:'0.78rem',color:'var(--success-light)'}}>{container.custom_domain}</code>
                </div>
              )}
              <Link to="/dashboard/domains" className="btn btn-secondary btn-sm" style={{justifyContent:'center'}}>
                <FiGlobe /> Manage Domains
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Container Info */}
      <div className="card" style={{marginTop:'1.5rem'}}>
        <h3 className="card-title" style={{marginBottom:'1rem'}}>Container Details</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
          {[
            {label:'Container ID', value: container.id},
            {label:'GTM Container', value: container.gtm_container_id || 'Not set'},
            {label:'Server Region', value: container.server_region},
            {label:'GTM Version', value: `v${container.container_version}`},
            {label:'Created', value: new Date(container.created_at).toLocaleDateString()},
            {label:'Notes', value: container.notes || '—'},
          ].map((item, i) => (
            <div key={i} style={{padding:'0.875rem',background:'var(--bg-surface)',borderRadius:'var(--radius-md)'}}>
              <div style={{fontSize:'0.68rem',color:'var(--text-muted)',textTransform:'uppercase',marginBottom:'4px',letterSpacing:'0.05em'}}>{item.label}</div>
              <div style={{fontSize:'0.875rem',fontWeight:600,color:'var(--text-primary)'}}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`.icon-copy-btn{background:none;border:none;color:var(--text-muted);cursor:pointer;padding:2px 4px;border-radius:4px;font-size:0.85rem;transition:color 0.15s;display:flex;align-items:center;}.icon-copy-btn:hover{color:var(--primary-light);}`}</style>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEditModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Edit Container</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Container Name *</label>
                  <input type="text" className="form-input" 
                    value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Container Configuration String *</label>
                  <input type="text" className="form-input"
                    value={editForm.container_config} onChange={e => setEditForm({...editForm, container_config: e.target.value})} required />
                  <p className="form-hint">Updating this string will restart the underlying server with the new config.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea"
                    value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner"/><span>Saving...</span></> : <span>Save Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
