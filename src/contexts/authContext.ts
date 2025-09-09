import React, { createContext } from 'react';

// 用户信息接口
export interface User {
  id: string;
  username: string;
  createdAt: string;
}

// 认证上下文接口
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  setIsAuthenticated: (value: boolean) => {},
  setUser: (user: User | null) => {},
  login: async() => false,
  logout: () => {},
  changePassword: async() => ({ success: false, message: '' }),
});
