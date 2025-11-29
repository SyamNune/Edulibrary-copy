import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { api } from '../services/localStorageService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password?: string, role?: Role) => Promise<void>;
  register: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    const storedUser = localStorage.getItem('edu_lib_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password?: string, role: Role = Role.USER) => {
    setIsLoading(true);
    
    try {
      // Admin Login Flow
      if (role === Role.ADMIN) {
        if (username === 'admin' && password === 'admin@123') {
          const adminUser: User = {
            id: 'admin-001',
            username: 'admin',
            role: Role.ADMIN,
            lastLogin: new Date().toISOString()
          };
          
          // Log the admin login event as well
          await api.recordLogin('admin', Role.ADMIN);

          setUser(adminUser);
          localStorage.setItem('edu_lib_user', JSON.stringify(adminUser));
          return;
        } else {
          throw new Error("Invalid Admin Credentials");
        }
      }

      // Regular User Login Flow
      if (role === Role.USER) {
        // Prevent admin from logging in as user
        if (username === 'admin') {
           throw new Error("Please use the Admin Login tab.");
        }

        const users = await api.getUsers();
        const foundUser = users.find(u => u.username === username);

        if (foundUser) {
          // Record the login in history AND update user status
          await api.recordLogin(foundUser.username, Role.USER);
          
          const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
          setUser(updatedUser);
          localStorage.setItem('edu_lib_user', JSON.stringify(updatedUser));
        } else {
          throw new Error("Invalid Credentials. Please sign up if you are new.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password?: string) => {
    setIsLoading(true);
    try {
      // Just create the user, do not log them in automatically
      await api.registerUser(username);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edu_lib_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === Role.ADMIN,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};