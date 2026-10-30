import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

export interface User {
  id: string;
  full_name: string;
  email: string;
  institution?: string;
  primary_domain?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    institution?: string;
    primary_domain?: string;
  }) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nexussynth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('nexussynth_token');
  });
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const currentToken = localStorage.getItem('nexussynth_token');
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('nexussynth_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session verification failed, logging out');
      localStorage.removeItem('nexussynth_token');
      localStorage.removeItem('nexussynth_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('nexussynth_token', receivedToken);
    localStorage.setItem('nexussynth_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const register = async (data: {
    full_name: string;
    email: string;
    password: string;
    institution?: string;
    primary_domain?: string;
  }) => {
    const res = await api.post('/auth/register', data);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('nexussynth_token', receivedToken);
    localStorage.setItem('nexussynth_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const loginDemo = async () => {
    const res = await api.post('/auth/demo');
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('nexussynth_token', receivedToken);
    localStorage.setItem('nexussynth_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const logout = () => {
    localStorage.removeItem('nexussynth_token');
    localStorage.removeItem('nexussynth_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginDemo,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
