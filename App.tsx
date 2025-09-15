import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { User } from './types.ts';
import api from './mockApi.ts';
import Login from './Login.tsx';
import Layout from './Layout.tsx';
import Dashboard from './Dashboard.tsx';
import BscView from './BscView.tsx';
import AdminView from './AdminView.tsx';

interface AuthContextType {
  user: User | null;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      api.getUserById(storedUserId).then(u => {
        if (u) setUser(u);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (userId: string) => {
    setLoading(true);
    const userToLogin = await api.getUserById(userId);
    if (userToLogin) {
      setUser(userToLogin);
      localStorage.setItem('userId', userId);
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('userId');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <Login />;
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/bsc/new" element={<BscView />} />
                <Route path="/bsc/:id" element={<BscView />} />
                <Route path="/admin" element={<AdminView />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
