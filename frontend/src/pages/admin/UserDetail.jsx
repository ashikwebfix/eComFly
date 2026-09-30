import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEdit, FiSave, FiServer, FiZap, FiCreditCard, FiX } from 'react-icons/fi';

const USER_DATA = {
  u1: { id:'u1', name:'Ahmed Hassan', email:'ahmed@store.com', plan:'Starter', plan_id:'p2', containers:2, events:32400, eventLimit:100000, joined:'2024-10-28', status:'active', lastLogin:'2024-10-29', paymentHistory:[
    {date:'2024-10-01', amount:2900, method:'bKash', status:'paid'},
    {date:'2024-09-01', amount:2900, method:'Bank Transfer', status:'paid'},
  ]},
};

const PLANS = [
  { id:'p1', name:'Free', event_limit:10000 },
  { id:'p2', name:'Starter', event_limit:100000 },
  { id:'p3', name:'Pro', event_limit:500000 },
  { id:'p4', name:'Enterprise', event_limit:0 },
];

export default function AdminUserDetail() {
  const { id } = useParams();
  const userData = USER_DATA[id] || {
    id, name:'Unknown User', email:'unknown@example.com', plan:'Free', plan_id:'p1',
    containers:0, events:0, eventLimit:10000, joined:'2024-10-01', status:'active',
    lastLogin:'2024-10-01', paymentHistory:[]
  };

  const [user, setUser] = useState(userData);
  const [editPlan, setEditPlan] = useState(false);
  const [newPlanId, setNewPlanId] = useState(user.plan_id);
  const [newLimit, setNewLimit] = useState(user.eventLimit);

  const saveChanges = () => {
    const plan = PLANS.find(p => p.id === newPlanId);
    setUser(prev => ({...prev, plan: plan?.name || prev.plan, plan_id: newPlanId, eventLimit: newLimit}));
    setEditPlan(false);
    toast.success('User plan updated!');
  };

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
              { label:'Usage', value:`${Math.round(user.events/user.eventLimit*100)}%`, icon:<FiZap />, color:'amber' },
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
                  <select className="form-select" value={newPlanId} onChange={e => {
                    setNewPlanId(e.target.value);
                    const plan = PLANS.find(p => p.id === e.target.value);
                    if (plan) setNewLimit(plan.event_limit);
                  }}>
                    {PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
                onClick={() => {
                  setUser(prev => ({...prev, status: prev.status === 'active' ? 'suspended' : 'active'}));
                  toast.success(`User ${user.status === 'active' ? 'suspended' : 'activated'}`);
                }}>
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
