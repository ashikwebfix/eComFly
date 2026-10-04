import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// User Dashboard
import DashboardLayout from './components/layouts/DashboardLayout';
import UserDashboard from './pages/user/Dashboard';
import UserContainers from './pages/user/Containers';
import UserDomains from './pages/user/Domains';
import UserBilling from './pages/user/Billing';
import UserUsage from './pages/user/Usage';
import UserSettings from './pages/user/Settings';
import ContainerDetail from './pages/user/ContainerDetail';

// Admin Dashboard
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminContainers from './pages/admin/Containers';
import AdminPlans from './pages/admin/Plans';
import AdminPayments from './pages/admin/Payments';
import AdminSettings from './pages/admin/Settings';
import AdminUserDetail from './pages/admin/UserDetail';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center" style={{height:'100vh'}}><div className="spinner spinner-lg"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* User Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<UserDashboard />} />
        <Route path="containers" element={<UserContainers />} />
        <Route path="containers/:id" element={<ContainerDetail />} />
        <Route path="domains" element={<UserDomains />} />
        <Route path="billing" element={<UserBilling />} />
        <Route path="usage" element={<UserUsage />} />
        <Route path="settings" element={<UserSettings />} />
      </Route>

      {/* Admin Dashboard */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="containers" element={<AdminContainers />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
        <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0b1220',
              border: '1px solid #e4e7ec',
              boxShadow: '0 12px 32px -8px rgba(16,24,40,0.16)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: "'Geist', 'Inter', sans-serif",
            },
            success: {
              iconTheme: { primary: '#12a373', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#dc3a2f', secondary: '#ffffff' },
            },
          }}
        />
        </AuthProvider>
    </BrowserRouter>
  );
}
