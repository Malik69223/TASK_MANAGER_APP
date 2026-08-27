import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { INITIAL_USER } from '../services/mockData';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('taskmanager_auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('taskmanager_auth_token', response.data.token || 'mock_jwt_token_' + Date.now());
        setLoading(false);
        return { success: true };
      } else {
        setError(response.message || 'Login failed');
        setLoading(false);
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register({ name, email, password });
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('taskmanager_auth_token', response.data.token || 'mock_jwt_token_' + Date.now());
        setLoading(false);
        return { success: true };
      } else {
        setError(response.message || 'Registration failed');
        setLoading(false);
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskmanager_auth_token');
    localStorage.removeItem('taskmanager_auth_user');
  };

  const updateUserProfile = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('taskmanager_auth_user', JSON.stringify(newUser));
      return newUser;
    });
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
