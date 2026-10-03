import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ecf_token');
    const storedUser = localStorage.getItem('ecf_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        localStorage.removeItem('ecf_token');
        localStorage.removeItem('ecf_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('ecf_token', token);
    localStorage.setItem('ecf_user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token, user: userData } = res.data;
    localStorage.setItem('ecf_token', token);
    localStorage.setItem('ecf_user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('ecf_token');
    localStorage.removeItem('ecf_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('ecf_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Pull the latest profile, plan limits and usage from the server
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      updateUser(res.data.user);
    } catch {
      // ignore - the 401 interceptor handles expired sessions
    }
  };

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    refreshUser();
    const timer = setInterval(refreshUser, 20000);
    return () => clearInterval(timer);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
