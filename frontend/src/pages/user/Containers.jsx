import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FiServer, FiPlus, FiTrash2, FiExternalLink, FiCopy,
  FiRefreshCw, FiAlertCircle, FiCheckCircle, FiClock, FiX
} from 'react-icons/fi';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Containers.css';

const STATUS_MAP = {
  running: { label: 'Running', badge: 'success', icon: <FiCheckCircle /> },
  stopped: { label: 'Stopped', badge: 'danger', icon: <FiAlertCircle /> },
  pending: { label: 'Pending', badge: 'warning', icon: <FiClock /> },
  error: { label: 'Error', badge: 'danger', icon: <FiAlertCircle /> },
};

export default function UserContainers() {
  const { user } = useAuth();
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', container_config: '', notes: '' });

  useEffect(() => { fetchContainers(); }, []);

  const fetchContainers = async () => {
    try {
      const res = await api.get('/containers');
      setContainers(res.data.containers || []);
    } catch {
      toast.error('Failed to load containers');
      setContainers([]);
    } finally {
      setLoading(false);
    }
  };

  const createContainer = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Container name is required');
    setCreating(true);
    try {
      const res = await api.post('/containers', form);
      setContainers(prev => [res.data.container, ...prev]);
      toast.success('Container created successfully! 🚀');
      setShowCreateModal(false);
      setForm({ name: '', container_config: '', notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating container');
    } finally {
      setCreating(false);
    }
  };

  const deleteContainer = async (id, name) => {
    if (!confirm(`Delete container "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/containers/${id}`);
      setContainers(prev => prev.filter(c => c.id !== id));
      toast.success('Container deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting container');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="containers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Containers</h1>
          <p className="page-subtitle">Manage your sGTM server-side tracking containers</p>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
          <div style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>
            <strong>{containers.length}</strong> / {user?.container_limit || 1} Containers Used
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreateModal(true)}
            disabled={containers.length >= (user?.container_limit || 1)}
            title={containers.length >= (user?.container_limit || 1) ? "Container limit reached. Upgrade your plan." : ""}
          >
            <FiPlus /> Create Container
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert alert-info mb-xl">
        <FiAlertCircle />
        <div>
          <strong>How to connect:</strong> After creating a container, copy the server URL and paste it in Google Tag Manager as your <strong>Server Container URL</strong>.
        </div>
      </div>

      {/* Containers Grid */}
      {loading ? (
        <div className="flex items-center justify-center" style={{height:200}}>
          <div className="spinner spinner-lg" />
        </div>
      ) : containers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FiServer /></div>
          <div className="empty-state-title">No containers yet</div>
          <div className="empty-state-desc">Create your first sGTM container and get a tracking domain instantly.</div>
          <button className="btn btn-primary mt-md" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create First Container
          </button>
        </div>
      ) : (
        <div className="containers-grid">
          {containers.map(container => {
            const status = STATUS_MAP[container.status] || STATUS_MAP.pending;
            const trackingUrl = `https://${container.custom_domain || container.auto_domain}`;

            return (
              <div key={container.id} className="container-card">
                <div className="container-card-header">
                  <div className="container-info">
                    <div className="container-icon"><FiServer /></div>
                    <div>
                      <h3 className="container-name">{container.name}</h3>
                      <p className="container-meta">Created {new Date(container.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`badge badge-${status.badge}`}>
                    {status.icon} {status.label}
                  </span>
                </div>

                {/* Server URL */}
                <div className="container-domain-section">
                  <p className="domain-label">Server URL (use in GTM)</p>
                  <div className="domain-row">
                    <code className="domain-value">{trackingUrl}</code>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(trackingUrl, 'Server URL')}>
                      <FiCopy />
                    </button>
                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                      <FiExternalLink />
                    </a>
                  </div>
                </div>

                {/* Auto Domain */}
                <div className="container-detail-row">
                  <span className="detail-label">Auto Domain</span>
                  <div className="detail-value-row">
                    <code className="detail-code">{container.auto_domain}</code>
                    <button className="icon-copy-btn" onClick={() => copyToClipboard(container.auto_domain, 'Domain')}>
                      <FiCopy />
                    </button>
                  </div>
                </div>

                {/* Custom Domain */}
                {container.custom_domain && (
                  <div className="container-detail-row">
                    <span className="detail-label">Custom Domain</span>
                    <div className="detail-value-row">
                      <code className="detail-code custom">{container.custom_domain}</code>
                      <span className="badge badge-success" style={{fontSize:'0.65rem'}}>Active</span>
                    </div>
                  </div>
                )}

                {/* Container Config */}
                {container.container_config && (
                  <div className="container-detail-row">
                    <span className="detail-label">Config String</span>
                    <code className="detail-code">{container.container_config.substring(0, 15)}...</code>
                  </div>
                )}

                {/* Stats */}
                <div className="container-stats">
                  <div className="container-stat">
                    <span className="cstat-value">{(container.events_count || 0).toLocaleString()}</span>
                    <span className="cstat-label">Events this month</span>
                  </div>
                  <div className="container-stat">
                    <span className="cstat-value" style={{color: container.status === 'running' ? 'var(--success-light)' : 'var(--danger-light)'}}>
                      {container.status === 'running' ? '99.9%' : '0%'}
                    </span>
                    <span className="cstat-label">Uptime</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="container-actions">
                  <Link to={`/dashboard/containers/${container.id}`} className="btn btn-secondary btn-sm flex-1" style={{justifyContent:'center'}}>
                    Manage
                  </Link>
                  <Link to="/dashboard/domains" className="btn btn-secondary btn-sm" title="Add custom domain">
                    <FiExternalLink />
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteContainer(container.id, container.name)} title="Delete">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          {containers.length < (user?.container_limit || 1) && (
            <button className="container-card new-container-card" onClick={() => setShowCreateModal(true)}>
              <div className="new-container-inner">
                <div className="new-container-icon"><FiPlus /></div>
                <span>Create New Container</span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create sGTM Container</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}><FiX /></button>
            </div>
            <form onSubmit={createContainer}>
              <div className="modal-body">
                <div className="alert alert-info mb-lg" style={{marginBottom:'1.25rem'}}>
                  <FiAlertCircle />
                  <div style={{fontSize:'0.82rem'}}>
                    An auto-generated domain (e.g., <code>abc123.bookingfixr.com</code>) will be assigned instantly.
                    You can add your own domain from the Domains section.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Container Name *</label>
                  <input type="text" className="form-input" placeholder="e.g., Main Store Tracking"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Container Configuration String *</label>
                  <input type="text" className="form-input" placeholder="e.g. aW5mb3JtYXRpb24..."
                    value={form.container_config} onChange={e => setForm({...form, container_config: e.target.value})} required />
                  <p className="form-hint">The long configuration string provided by GTM when you manually provision a server container.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Optional notes about this container..."
                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><div className="spinner"/><span>Creating...</span></> : <><FiPlus /><span>Create Container</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
