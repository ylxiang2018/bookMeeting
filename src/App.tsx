import React, { useState, useEffect } from 'react';
import {
  Routes, Route, Navigate, useNavigate,
} from 'react-router-dom';
import { AuthContext, User } from './contexts/authContext';
import { BookingProvider } from './contexts/bookingContext';
import { API_BASE_URL } from './lib/storageUtils';
import Home from '@/pages/Home';
import LoginPage from '@/pages/LoginPage';

import ChangePasswordPage from '@/pages/ChangePasswordPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  // 在组件挂载时检查localStorage，恢复用户登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('user');
      }
    } else {
      navigate('/login');
    }
  }, []);

  // 登录函数
  const login = async(username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // 存储用户信息到localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('登录失败:', data.message || '用户名或密码错误');
        return false;
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      return false;
    }
  };

  // 退出登录函数
  const logout = () => {
    // 清除localStorage中的用户信息
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);

    // 调用后端退出登录接口（可选，主要是前端清除状态）
    fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
    }).catch(error => {
      console.error('退出登录请求失败:', error);
    });
  };

  // 修改密码函数
  const changePassword = async(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!user || !user.username) {
      return { success: false, message: '请先登录' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('修改密码请求失败:', error);
      return { success: false, message: '网络请求失败，请稍后重试' };
    }
  };

  return (
    <BookingProvider>
      <AuthContext.Provider
        value={{
          isAuthenticated,
          user,
          setIsAuthenticated,
          setUser,
          login,
          logout,
          changePassword,
        }}
      >
        <Routes>
          {/* 公共路由 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 受保护的路由 */}
          <Route
            path="/"
            element={ <Home /> }
          />
          <Route path="/change-password" element={
            isAuthenticated ? <ChangePasswordPage /> : <Navigate to="/login" replace />
          } />
          <Route path="/other" element={
            isAuthenticated
              ? <div className="text-center text-xl">Other Page - Coming Soon</div>
              : <Navigate to="/login" replace />
          } />
        </Routes>
      </AuthContext.Provider>
    </BookingProvider>
  );
}
