import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Role, User } from '../types';

const API_URL = 'http://localhost:5000/api/auth';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    _id: 'bypass_admin_id',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    token: 'bypass_token',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    // Bypass login for demonstration
    // const storedUser = localStorage.getItem('aegisai_user');
    // if (storedUser) {
    //   try {
    //     const parsed = JSON.parse(storedUser);
    //     setUser(parsed);
    //   } catch {
    //     localStorage.removeItem('aegisai_user');
    //   }
    // }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Login failed' };
      }

      setUser(data);
      localStorage.setItem('aegisai_user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Network error. Is the backend server running?' };
    }
  };

  const signup = async (name: string, email: string, password: string, role: Role): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Signup failed' };
      }

      setUser(data);
      localStorage.setItem('aegisai_user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Network error. Is the backend server running?' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aegisai_user');
  };

  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
