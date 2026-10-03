import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  FiGrid, FiServer, FiGlobe, FiCreditCard, FiBarChart2,
  FiSettings, FiLogOut, FiMenu, FiX, FiBell, FiChevronDown
} from 'react-icons/fi';
import { RiRadarLine } from 'react-icons/ri';
import './DashboardLayout.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <FiGrid />, exact: true },
  { path: '/dashboard/containers', label: 'Containers', icon: <FiServer /> },
  { path: '/dashboard/domains', label: 'Domains', icon: <FiGlobe /> },
  { path: '/dashboard/usage', label: 'Usage', icon: <FiBarChart2 /> },
  { path: '/dashboard/billing', label: 'Billing', icon: <FiCreditCard /> },
  { path: '/dashboard/settings', label: 'Settings', icon: <FiSettings /> },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-logo">
            <div className="logo-icon"><RiRadarLine /></div>
            <span className="logo-text">eComFly</span>
          </NavLink>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        {/* Plan Badge */}
        <div className="sidebar-plan">
          <div className="sidebar-plan-info">
            <span className="plan-label">Current Plan</span>
            <span className="plan-name">{user?.plan_name || 'Free'}</span>
          </div>
          <NavLink to="/dashboard/billing" className="plan-upgrade">
            Upgrade
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
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
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <span className="link-icon"><FiLogOut /></span>
            <span className="link-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <button className="mobile-menu-trigger" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>

          <div className="header-spacer" />

          <div className="header-right">
            {/* Usage Quick View */}
            <div className="header-usage">
              <span className="usage-text">
                {(user?.current_events || 0).toLocaleString()} / {(user?.event_limit || 10000).toLocaleString()} events
              </span>
              <div className="usage-mini-bar">
                <div
                  className="usage-mini-fill"
                  style={{ width: `${Math.min(100, ((user?.current_events || 0) / (user?.event_limit || 10000)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="notif-wrapper" style={{ position: 'relative' }}>
              <button 
                className="header-icon-btn" 
                aria-label="Notifications"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setUserMenuOpen(false);
                }}
              >
                <FiBell />
                <span className="notif-dot" />
              </button>

              {notifOpen && (
                <div className="user-dropdown" style={{ minWidth: '280px' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: '600', fontSize: '0.9rem' }}>
                    Notifications
                  </div>
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No new notifications right now.
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="user-menu-wrapper">
              <button 
                className="user-menu-trigger" 
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotifOpen(false);
                }}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-email">{user?.email}</span>
                </div>
                <FiChevronDown className={`chevron ${userMenuOpen ? 'rotated' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <NavLink to="/dashboard/settings" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <FiSettings /> Account Settings
                  </NavLink>
                  <NavLink to="/dashboard/billing" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <FiCreditCard /> Billing
                  </NavLink>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
