import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import Logo from '../components/Logo';
import AuthAside from '../components/AuthAside';
import './AuthPage.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`, { duration: 700 });
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-main">
        <div className="auth-container">
        <div className="auth-card">
          {/* Logo */}
          <Link to="/" className="auth-logo" aria-label="eComFly home">
            <Logo />
          </Link>

          <div className="auth-header">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your eComFly account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input padded-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input padded-input padded-right"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{justifyContent:'center'}}>
              {loading ? <><div className="spinner"/><span>Signing in...</span></> : <><span>Sign In</span><FiArrowRight /></>}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Create one free</Link></p>
          </div>

          <div className="auth-demo-note">
            <p className="text-xs text-muted">Demo: admin@ecomfly.com / admin123</p>
          </div>
        </div>
        </div>
      </main>
      <AuthAside heading="Welcome back to cleaner data." />
    </div>
  );
}
