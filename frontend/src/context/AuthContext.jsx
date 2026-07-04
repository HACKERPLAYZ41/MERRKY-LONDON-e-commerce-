import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (_) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // ── Customer login ────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token: accessToken, refresh_token, user: userData } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);

      // If user had a guest cart, merge it into their server cart
      const guestToken = localStorage.getItem('guest_token');
      if (guestToken) {
        try {
          await API.post('/cart/merge', { guest_token: guestToken });
          localStorage.removeItem('guest_token');
        } catch (_) { /* non-critical */ }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  // ── Admin Step 1: send credentials → triggers 2FA OTP email ──────────────
  const adminLogin = async (email, password) => {
    try {
      const response = await API.post('/auth/admin-login', { email, password });
      // Backend returns { success: true, requires_2fa: true, email, dev_otp? }
      return {
        success: true,
        requires2fa: response.data.requires_2fa,
        email,
        devOtp: response.data.dev_otp || null, // only in local dev
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Admin authentication failed.',
      };
    }
  };

  // ── Admin Step 2: verify 2FA OTP → get tokens ────────────────────────────
  const adminVerify2fa = async (email, otp) => {
    try {
      const response = await API.post('/auth/admin-verify', { email, otp });
      const { token: accessToken, refresh_token, user: userData } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid or expired verification code.',
      };
    }
  };

  // ── Registration ─────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    try {
      const response = await API.post('/auth/register', { name, email, password });
      const { token: accessToken, refresh_token, user: userData } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed.',
      };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (_) { /* non-critical */ }
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, adminLogin, adminVerify2fa, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
