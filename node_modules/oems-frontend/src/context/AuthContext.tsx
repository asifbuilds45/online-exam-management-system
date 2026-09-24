import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<UserProfile>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('oems_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('oems_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('oems_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session refresh failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password = 'password', role?: UserRole): Promise<UserProfile> => {
    const res = await api.post('/auth/login', { email, password, role });
    const { token: authToken, user: userProfile } = res.data;

    setToken(authToken);
    setUser(userProfile);

    localStorage.setItem('oems_token', authToken);
    localStorage.setItem('oems_user', JSON.stringify(userProfile));

    return userProfile;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('oems_token');
    localStorage.removeItem('oems_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
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
