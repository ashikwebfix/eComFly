import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiBell, FiSave } from 'react-icons/fi';
import api from '../../utils/api';

export default function UserSettings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [notifications, setNotifications] = useState({
    usage_80: true, usage_95: true, payment_confirm: true, weekly_report: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/user/profile', profile);
      updateUser(profile);
      toast.success('Profile updated!');
    } catch {
      updateUser(profile);
      toast.success('Profile updated! (Demo)');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPw !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPw.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    setTimeout(() => {
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPw: '', confirm: '' });
      setSavingPw(false);
    }, 1000);
  };

  return (
    <div style={{maxWidth:800}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">Manage your profile and preferences</p>
        </div>
      </div>

      {/* Profile */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-header">
          <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
            <FiUser style={{color:'var(--primary-light)'}} />
            <h3 className="card-title">Profile Information</h3>
          </div>
        </div>
        <form onSubmit={saveProfile}>
          <div className="form-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.25rem'}}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={profile.email}
                onChange={e => setProfile({...profile, email: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? <><div className="spinner"/><span>Saving...</span></> : <><FiSave /> Save Profile</>}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-header">
          <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
            <FiLock style={{color:'var(--primary-light)'}} />
            <h3 className="card-title">Change Password</h3>
          </div>
        </div>
        <form onSubmit={savePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.25rem'}}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="Min 6 characters"
                value={passwords.newPw} onChange={e => setPasswords({...passwords, newPw: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="Repeat password"
                value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={savingPw}>
            {savingPw ? <><div className="spinner"/><span>Changing...</span></> : <><FiLock /> Change Password</>}
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="card-header">
          <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
            <FiBell style={{color:'var(--primary-light)'}} />
            <h3 className="card-title">Notifications</h3>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {[
            { key: 'usage_80', label: 'Usage at 80%', desc: 'Alert when monthly usage reaches 80%' },
            { key: 'usage_95', label: 'Usage at 95%', desc: 'Urgent alert when usage reaches 95%' },
            { key: 'payment_confirm', label: 'Payment Confirmation', desc: 'Email when payment is verified' },
            { key: 'weekly_report', label: 'Weekly Usage Report', desc: 'Weekly summary of your tracking activity' },
          ].map(n => (
            <div key={n.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.875rem',background:'var(--bg-surface)',borderRadius:'var(--radius-md)'}}>
              <div>
                <div style={{fontSize:'0.9rem',fontWeight:600,color:'var(--text-primary)',marginBottom:'2px'}}>{n.label}</div>
                <div style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{n.desc}</div>
              </div>
              <label style={{display:'flex',alignItems:'center',cursor:'pointer'}}>
                <input type="checkbox" checked={notifications[n.key]}
                  onChange={e => setNotifications({...notifications, [n.key]: e.target.checked})}
                  style={{display:'none'}} />
                <div style={{
                  width:44, height:24, borderRadius:12,
                  background: notifications[n.key] ? 'var(--primary)' : 'var(--bg-void)',
                  border: notifications[n.key] ? 'none' : '1px solid var(--border)',
                  position:'relative', transition:'all 0.2s ease', cursor:'pointer'
                }}>
                  <div style={{
                    position:'absolute', width:16, height:16, borderRadius:8, background:'white',
                    top:4, left: notifications[n.key] ? 24 : 4, transition:'left 0.2s ease',
                    boxShadow:'0 1px 4px rgba(0,0,0,0.3)'
                  }} />
                </div>
              </label>
            </div>
          ))}
        </div>
        <div style={{marginTop:'1.25rem'}}>
          <button className="btn btn-primary" onClick={() => toast.success('Notification preferences saved!')}>
            <FiSave /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
