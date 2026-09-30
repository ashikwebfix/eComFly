import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiSettings, FiGlobe, FiMail, FiShield } from 'react-icons/fi';

export default function AdminSettings() {
  const [general, setGeneral] = useState({
    site_name: 'eComFly',
    site_url: 'https://ecomfly.io',
    support_email: 'support@ecomfly.io',
    server_ip: '45.134.211.80',
    max_free_events: 10000,
    default_region: 'Singapore',
    maintenance_mode: false,
  });

  const [payment, setPayment] = useState({
    bkash_number: '01700000000',
    bkash_type: 'Personal',
    nagad_number: '01800000000',
    nagad_type: 'Personal',
    bank_name: 'Dutch-Bangla Bank',
    bank_account: '1234567890',
    bank_branch: 'Dhaka Main',
    bank_routing: '090275421',
  });

  return (
    <div style={{maxWidth:900}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">Configure global platform settings</p>
        </div>
      </div>

      {/* General Settings */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-header">
          <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
            <FiSettings style={{color:'var(--primary-light)'}} />
            <h3 className="card-title">General Settings</h3>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
          {[
            {label:'Platform Name', key:'site_name', type:'text'},
            {label:'Platform URL', key:'site_url', type:'text'},
            {label:'Support Email', key:'support_email', type:'email'},
            {label:'Server IP (for DNS A records)', key:'server_ip', type:'text'},
            {label:'Free Plan Event Limit', key:'max_free_events', type:'number'},
            {label:'Default Server Region', key:'default_region', type:'text'},
          ].map(field => (
            <div key={field.key} className="form-group">
              <label className="form-label">{field.label}</label>
              <input type={field.type} className="form-input" value={general[field.key]}
                onChange={e => setGeneral({...general, [field.key]: field.type === 'number' ? parseInt(e.target.value) : e.target.value})} />
            </div>
          ))}
          <div className="form-group" style={{display:'flex',alignItems:'center',gap:'0.75rem',gridColumn:'1/-1'}}>
            <label style={{display:'flex',alignItems:'center',gap:'0.625rem',cursor:'pointer'}}>
              <input type="checkbox" checked={general.maintenance_mode}
                onChange={e => setGeneral({...general, maintenance_mode:e.target.checked})} />
              <span style={{fontSize:'0.875rem',color:'var(--text-secondary)'}}>Maintenance Mode (users cannot login)</span>
            </label>
          </div>
        </div>
        <button className="btn btn-primary mt-lg" onClick={() => toast.success('Settings saved!')}>
          <FiSave /> Save General Settings
        </button>
      </div>

      {/* Payment Settings */}
      <div className="card">
        <div className="card-header">
          <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
            <FiShield style={{color:'var(--primary-light)'}} />
            <h3 className="card-title">Payment Account Settings</h3>
          </div>
        </div>

        <div style={{marginBottom:'1.5rem'}}>
          <div style={{fontSize:'0.82rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>
            📱 bKash
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">bKash Number</label>
              <input type="text" className="form-input" value={payment.bkash_number}
                onChange={e => setPayment({...payment, bkash_number:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select className="form-select" value={payment.bkash_type} onChange={e => setPayment({...payment, bkash_type:e.target.value})}>
                <option>Personal</option><option>Merchant</option><option>Agent</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{marginBottom:'1.5rem',paddingTop:'1rem',borderTop:'1px solid var(--border)'}}>
          <div style={{fontSize:'0.82rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>
            📱 Nagad
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">Nagad Number</label>
              <input type="text" className="form-input" value={payment.nagad_number}
                onChange={e => setPayment({...payment, nagad_number:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select className="form-select" value={payment.nagad_type} onChange={e => setPayment({...payment, nagad_type:e.target.value})}>
                <option>Personal</option><option>Merchant</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{paddingTop:'1rem',borderTop:'1px solid var(--border)',marginBottom:'1.25rem'}}>
          <div style={{fontSize:'0.82rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>
            🏦 Bank Transfer
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            {[
              {label:'Bank Name', key:'bank_name'},
              {label:'Account Number', key:'bank_account'},
              {label:'Branch', key:'bank_branch'},
              {label:'Routing Number', key:'bank_routing'},
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input type="text" className="form-input" value={payment[f.key]}
                  onChange={e => setPayment({...payment, [f.key]:e.target.value})} />
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => toast.success('Payment settings saved!')}>
          <FiSave /> Save Payment Settings
        </button>
      </div>

      <style>{`.mt-lg{margin-top:1.25rem;}.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap;}.page-title{font-size:1.8rem;font-weight:800;background:var(--gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.25rem;}.page-subtitle{color:var(--text-secondary);font-size:0.9rem;}`}</style>
    </div>
  );
}
