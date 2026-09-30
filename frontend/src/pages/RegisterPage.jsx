import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import { RiRadarLine } from 'react-icons/ri';
import './AuthPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Welcome to eComFly 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const perks = ['Free 10,000 events/month', '1 sGTM container included', 'No credit card required'];

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-grid" />
      </div>

      <div className="auth-container">
        <div className="auth-card auth-card-wide">
          <Link to="/" className="auth-logo">
            <div className="logo-icon"><RiRadarLine /></div>
            <span className="logo-text">eComFly</span>
          </Link>

          <div className="auth-header">
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start tracking server-side in minutes</p>
          </div>

          <div className="auth-perks">
            {perks.map((p, i) => (
              <div key={i} className="auth-perk">
                <FiCheck className="perk-icon" />
                <span>{p}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input type="text" className="form-input padded-input" placeholder="John Doe"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input type="email" className="form-input padded-input" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input type={showPw ? 'text' : 'password'} className="form-input padded-input padded-right"
                    placeholder="Min 6 characters" value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})} required />
                  <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input type={showPw ? 'text' : 'password'} className="form-input padded-input"
                    placeholder="Repeat password" value={form.confirmPassword}
                    onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{justifyContent:'center'}}>
              {loading ? <><div className="spinner"/><span>Creating account...</span></> : <><span>Create Free Account</span><FiArrowRight /></>}
            </button>

            <p className="auth-terms">
              By registering, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
