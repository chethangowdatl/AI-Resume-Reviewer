import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIsLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    if (res.data && res.data.token) {
      const jwt = res.data.token;
      localStorage.setItem('token', jwt);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      setToken(jwt);
      setUser(res.data.user);
      return res.data;
    }
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password });
    if (res.data && res.data.token) {
      const jwt = res.data.token;
      localStorage.setItem('token', jwt);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      setToken(jwt);
      setUser(res.data.user);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
