import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  FiGrid, FiUsers, FiServer, FiCreditCard, FiSettings,
  FiLogOut, FiMenu, FiX, FiShield, FiDollarSign
} from 'react-icons/fi';
import Logo from '../Logo';
import './DashboardLayout.css';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin', label: 'Overview', icon: <FiGrid />, exact: true },
  { path: '/admin/users', label: 'Users', icon: <FiUsers /> },
  { path: '/admin/containers', label: 'Containers', icon: <FiServer /> },
  { path: '/admin/plans', label: 'Plans & Pricing', icon: <FiDollarSign /> },
  { path: '/admin/payments', label: 'Payments', icon: <FiCreditCard /> },
  { path: '/admin/settings', label: 'Settings', icon: <FiSettings /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-logo">
            <Logo />
          </NavLink>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><FiX /></button>
        </div>

        <div className="admin-badge">
          <FiShield />
          <span>Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Administration</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="link-icon">{item.icon}</span>
              <span className="link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <div style={{fontSize:'0.82rem', fontWeight:600, color:'var(--text-primary)'}}>{user?.name}</div>
              <div style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>Administrator</div>
            </div>
          </div>
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <span className="link-icon"><FiLogOut /></span>
            <span className="link-label">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <button className="mobile-menu-trigger" onClick={() => setSidebarOpen(true)}><FiMenu /></button>
          <div className="admin-header-badge">
            <FiShield />
            <span>Administrator</span>
          </div>
          <div className="header-spacer" />
          <div style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>
            Logged in as <strong style={{color:'var(--primary-light)'}}>{user?.email}</strong>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
