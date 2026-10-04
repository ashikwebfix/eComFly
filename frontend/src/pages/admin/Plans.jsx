import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave, FiCheck, FiStar } from 'react-icons/fi';

const INITIAL_PLANS = [
  {
    id:'p1', name:'Free', price:0, event_limit:10000, container_limit:1, domain_limit:0,
    support_level:'Community', is_active:true, is_featured:false,
    features:['10K events/month','1 container','Auto subdomain','Basic analytics','Community support']
  },
  {
    id:'p2', name:'Starter', price:2900, event_limit:100000, container_limit:3, domain_limit:1,
    support_level:'Email (48h)', is_active:true, is_featured:true,
    features:['100K events/month','3 containers','1 custom domain','Advanced analytics','Email support','Container monitoring']
  },
  {
    id:'p3', name:'Pro', price:7900, event_limit:500000, container_limit:10, domain_limit:5,
    support_level:'Priority (24h)', is_active:true, is_featured:false,
    features:['500K events/month','10 containers','5 custom domains','Priority support','Usage alerts','Advanced reports']
  },
  {
    id:'p4', name:'Enterprise', price:0, event_limit:0, container_limit:0, domain_limit:0,
    support_level:'Dedicated', is_active:true, is_featured:false,
    features:['Unlimited events','Unlimited containers','Unlimited domains','SLA guarantee','Dedicated manager','Custom integrations']
  },
];

const emptyPlan = { name:'', price:0, event_limit:10000, container_limit:1, domain_limit:0, support_level:'Email (48h)', is_active:true, is_featured:false, features:[''] };

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/plans/all');
      setPlans(data.plans || []);
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditingPlan(null); setForm({...emptyPlan, features:[]}); setShowModal(true); };
  const openEdit = (plan) => { setEditingPlan(plan); setForm({...plan}); setShowModal(true); };

  const savePlan = async () => {
    if (!form.name.trim()) return toast.error('Plan name required');
    try {
      if (editingPlan) {
        const { data } = await api.put(`/plans/${editingPlan.id}`, form);
        setPlans(prev => prev.map(p => p.id === editingPlan.id ? data.plan : p));
        toast.success('Plan updated!');
      } else {
        const { data } = await api.post('/plans', form);
        setPlans(prev => [...prev, data.plan]);
        toast.success('Plan created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    }
  };

  const deletePlan = async (id, name) => {
    if (!confirm(`Delete plan "${name}"?`)) return;
    try {
      await api.delete(`/plans/${id}`);
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plan deleted');
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm(f => ({...f, features:[...f.features, featureInput.trim()]}));
    setFeatureInput('');
  };

  const removeFeature = (i) => setForm(f => ({...f, features:f.features.filter((_,j)=>j!==i)}));

  return (
    <div style={{maxWidth:1200}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Plans & Pricing</h1>
          <p className="page-subtitle">Manage subscription plans and features</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Create Plan
        </button>
      </div>

      {loading ? (
        <div style={{textAlign:'center', padding:'3rem', color:'var(--text-muted)'}}>Loading plans...</div>
      ) : (
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.25rem'}}>
        {plans.map(plan => (
          <div key={plan.id} className="card" style={{position:'relative',border:plan.is_featured?'1px solid rgba(35,80,240,0.4)':undefined}}>
            {plan.is_featured && (
              <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#2350f0,#5b7cf5)',color:'white',padding:'0.25rem 0.875rem',borderRadius:999,fontSize:'0.7rem',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap'}}>
                <FiStar /> Featured
              </div>
            )}

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.875rem'}}>
              <div>
                <h3 style={{fontSize:'1.1rem',fontWeight:700,marginBottom:'2px'}}>{plan.name}</h3>
                <span className={`badge badge-${plan.is_active ? 'success' : 'danger'}`}>{plan.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{display:'flex',gap:'0.375rem'}}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(plan)} title="Edit"><FiEdit /></button>
                <button className="btn btn-danger btn-sm" onClick={() => deletePlan(plan.id, plan.name)} title="Delete"><FiTrash2 /></button>
              </div>
            </div>

            <div style={{display:'flex',alignItems:'baseline',gap:'2px',marginBottom:'1rem'}}>
              <span style={{color:'var(--text-secondary)'}}>৳</span>
              <span style={{fontSize:'2rem',fontWeight:900,fontFamily:'var(--font-display)',color:'var(--text-primary)',lineHeight:1}}>
                {plan.price === 0 ? (plan.event_limit === 0 ? 'Custom' : '0') : plan.price.toLocaleString()}
              </span>
              {plan.price > 0 && <span style={{color:'var(--text-muted)',fontSize:'0.875rem'}}>/mo</span>}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.625rem',marginBottom:'1rem',fontSize:'0.82rem'}}>
              {[
                {label:'Events/mo', value: plan.event_limit === 0 ? 'Unlimited' : plan.event_limit.toLocaleString()},
                {label:'Containers', value: plan.container_limit === 0 ? 'Unlimited' : plan.container_limit},
                {label:'Custom Domains', value: plan.domain_limit === 0 && plan.price > 0 ? 'Unlimited' : plan.domain_limit === 0 ? 'None' : plan.domain_limit},
                {label:'Support', value: plan.support_level},
              ].map((item,i) => (
                <div key={i} style={{padding:'0.5rem',background:'var(--bg-surface)',borderRadius:'var(--radius-sm)'}}>
                  <div style={{color:'var(--text-muted)',fontSize:'0.65rem',textTransform:'uppercase',marginBottom:'2px'}}>{item.label}</div>
                  <div style={{fontWeight:600,color:'var(--text-primary)'}}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
              {plan.features.map((f,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.8rem',color:'var(--text-secondary)'}}>
                  <FiCheck style={{color:'var(--success-light)',flexShrink:0,fontSize:'0.75rem'}} /> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal modal-lg" style={{maxWidth:700}}>
            <div className="modal-header">
              <h2 className="modal-title">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <div className="form-group">
                  <label className="form-label">Plan Name *</label>
                  <input type="text" className="form-input" placeholder="e.g., Growth"
                    value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (BDT/month)</label>
                  <input type="number" className="form-input" placeholder="0 for free or custom"
                    value={form.price} onChange={e => setForm({...form, price:parseInt(e.target.value)||0})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Limit (0 = unlimited)</label>
                  <input type="number" className="form-input"
                    value={form.event_limit} onChange={e => setForm({...form, event_limit:parseInt(e.target.value)||0})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Container Limit (0 = unlimited)</label>
                  <input type="number" className="form-input"
                    value={form.container_limit} onChange={e => setForm({...form, container_limit:parseInt(e.target.value)||0})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Custom Domain Limit (0 = none)</label>
                  <input type="number" className="form-input"
                    value={form.domain_limit} onChange={e => setForm({...form, domain_limit:parseInt(e.target.value)||0})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Support Level</label>
                  <select className="form-select" value={form.support_level} onChange={e => setForm({...form, support_level:e.target.value})}>
                    <option>Community</option>
                    <option>Email (48h)</option>
                    <option>Priority (24h)</option>
                    <option>Dedicated</option>
                  </select>
                </div>
              </div>

              <div style={{display:'flex',gap:'1.5rem',marginBottom:'1.25rem'}}>
                <label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer',fontSize:'0.875rem',color:'var(--text-secondary)'}}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active:e.target.checked})} />
                  Active (visible to users)
                </label>
                <label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer',fontSize:'0.875rem',color:'var(--text-secondary)'}}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured:e.target.checked})} />
                  Featured (highlighted on homepage)
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Features</label>
                <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'0.75rem'}}>
                  {form.features.map((f,i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.5rem 0.75rem',background:'var(--bg-surface)',borderRadius:'var(--radius-sm)'}}>
                      <FiCheck style={{color:'var(--success-light)',fontSize:'0.8rem'}} />
                      <span style={{flex:1,fontSize:'0.85rem',color:'var(--text-secondary)'}}>{f}</span>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeFeature(i)} style={{padding:'2px 6px'}}><FiX /></button>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:'0.5rem'}}>
                  <input type="text" className="form-input" placeholder="Add a feature..."
                    value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                  <button type="button" className="btn btn-secondary" onClick={addFeature}><FiPlus /></button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={savePlan}>
                <FiSave /> {editingPlan ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap;}.page-title{font-size:1.8rem;font-weight:800;background:var(--gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.25rem;}.page-subtitle{color:var(--text-secondary);font-size:0.9rem;}`}</style>
    </div>
  );
}
