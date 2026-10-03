import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEdit, FiSave, FiServer, FiZap, FiCreditCard, FiX } from 'react-icons/fi';

const PLANS = [
  { id:'p1', name:'Free', event_limit:10000 },
  { id:'p2', name:'Starter', event_limit:100000 },
  { id:'p3', name:'Pro', event_limit:500000 },
  { id:'p4', name:'Enterprise', event_limit:0 },
];

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newLimit, setNewLimit] = useState(0);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setUser({
        ...data.user,
        plan: data.user.plan_name,
        events: data.user.current_events || 0,
        eventLimit: data.user.event_limit || 0,
        joined: new Date(data.user.created_at).toISOString().split('T')[0],
        lastLogin: new Date(data.user.created_at).toISOString().split('T')[0], // placeholder
        containers: data.user.containers || 0,
        paymentHistory: data.user.paymentHistory || []
      });
      setNewPlanName(data.user.plan_name);
      setNewLimit(data.user.event_limit);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user details');
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plan_name: newPlanName,
          event_limit: newLimit
        })
      });
      if (!res.ok) throw new Error('Failed to update user');
      toast.success('User plan updated!');
      setEditPlan(false);
      fetchUser();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user');
    }
  };

  const toggleStatus = async () => {
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`User ${newStatus}`);
      fetchUser();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div style={{padding:'2rem'}}>Loading user details...</div>;
  if (!user) return <div style={{padding:'2rem'}}>User not found</div>;

  return (
    <div style={{maxWidth:1100}}>
      <Link to="/admin/users" className="btn btn-ghost btn-sm" style={{marginBottom:'1.25rem'}}>
        <FiArrowLeft /> Back to Users
      </Link>

      <div className="page-header">
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <div style={{width:56,height:56,background:'var(--gradient-primary)',borderRadius:'var(--radius-lg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',fontWeight:700,color:'white'}}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="page-title" style={{marginBottom:0}}>{user.name}</h1>
            <p style={{color:'var(--text-secondary)',fontSize:'0.9rem'}}>{user.email}</p>
          </div>
        </div>
        <span className={`badge badge-${user.status === 'active' ? 'success' : 'danger'}`} style={{fontSize:'0.875rem',padding:'0.375rem 0.875rem'}}>
          {user.status}
        </span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1.5rem'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          {/* Stats */}
          <div className="grid grid-3 gap-lg">
            {[
              { label:'Containers', value:user.containers, icon:<FiServer />, color:'indigo' },
              { label:'Events (Month)', value:user.events.toLocaleString(), icon:<FiZap />, color:'cyan' },
              { label:'Usage', value:`${user.eventLimit > 0 ? Math.round(user.events/user.eventLimit*100) : 0}%`, icon:<FiZap />, color:'amber' },
            ].map((s,i) => (
              <div key={i} className={`stat-card ${s.color}`}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Plan Management */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Plan Management</h3>
              {!editPlan && (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditPlan(true)}>
                  <FiEdit /> Edit Plan
                </button>
              )}
            </div>

            {editPlan ? (
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <div className="form-group">
                  <label className="form-label">Plan</label>
                  <select className="form-select" value={newPlanName} onChange={e => {
                    setNewPlanName(e.target.value);
                    const plan = PLANS.find(p => p.name === e.target.value);
                    if (plan) setNewLimit(plan.event_limit);
                  }}>
                    {PLANS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Custom Event Limit</label>
                  <input type="number" className="form-input" value={newLimit} onChange={e => setNewLimit(parseInt(e.target.value))} />
                  <p className="form-hint">Override the plan's default event limit</p>
                </div>
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button className="btn btn-primary" onClick={saveChanges}><FiSave /> Save Changes</button>
                  <button className="btn btn-secondary" onClick={() => setEditPlan(false)}><FiX /> Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                {[
                  {label:'Current Plan', value:user.plan},
                  {label:'Event Limit', value:user.eventLimit.toLocaleString()},
                  {label:'Events Used', value:user.events.toLocaleString()},
                  {label:'Remaining', value:(user.eventLimit - user.events).toLocaleString()},
                ].map((item,i) => (
                  <div key={i} style={{padding:'0.875rem',background:'var(--bg-surface)',borderRadius:'var(--radius-md)'}}>
                    <div style={{fontSize:'0.68rem',color:'var(--text-muted)',textTransform:'uppercase',marginBottom:'4px'}}>{item.label}</div>
                    <div style={{fontSize:'1rem',fontWeight:700,color:'var(--text-primary)'}}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Payment History</h3>
            </div>
            {user.paymentHistory.length === 0 ? (
              <p style={{color:'var(--text-muted)',fontSize:'0.875rem'}}>No payment history</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
                  <tbody>
                    {user.paymentHistory.map((p, i) => (
                      <tr key={i}>
                        <td>{p.date}</td>
                        <td><strong>৳{p.amount.toLocaleString()}</strong></td>
                        <td>{p.method}</td>
                        <td><span className={`badge badge-${p.status === 'paid' ? 'success' : 'warning'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          <div className="card">
            <h3 className="card-title" style={{marginBottom:'1rem'}}>Account Info</h3>
            {[
              {label:'User ID', value:user.id},
              {label:'Joined', value:user.joined},
              {label:'Last Login', value:user.lastLogin},
              {label:'Status', value:user.status},
            ].map((item,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'0.625rem 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>{item.label}</span>
                <span style={{fontSize:'0.82rem',fontWeight:600,color:'var(--text-primary)'}}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="card-title" style={{marginBottom:'1rem'}}>Admin Actions</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'0.625rem'}}>
              <button className="btn btn-secondary w-full" style={{justifyContent:'center'}}
                onClick={() => toast.success('Password reset email sent')}>
                Reset Password
              </button>
              <button className={`btn w-full ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                style={{justifyContent:'center'}}
                onClick={toggleStatus}>
                {user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
              </button>
              <button className="btn btn-danger w-full" style={{justifyContent:'center'}}
                onClick={() => toast.error('Delete requires confirmation — feature locked')}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap;}.page-title{font-size:1.8rem;font-weight:800;background:var(--gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.25rem;}`}</style>
    </div>
  );
}
