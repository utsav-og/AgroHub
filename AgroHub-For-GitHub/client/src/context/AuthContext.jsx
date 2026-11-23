import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUserApi, registerUserApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on page load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('agrohub_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse stored user from localStorage', err);
      localStorage.removeItem('agrohub_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await loginUserApi({ email, password });
      if (res && res.data) {
        setUser(res.data);
        localStorage.setItem('agrohub_user', JSON.stringify(res.data));
        return { success: true, user: res.data };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await registerUserApi(userData);
      if (res && res.data) {
        setUser(res.data);
        localStorage.setItem('agrohub_user', JSON.stringify(res.data));
        return { success: true, user: res.data };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please check your details.';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('agrohub_user');
  };

  // Update user in state and localStorage
  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('agrohub_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for convenient consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
