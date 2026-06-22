import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme Context
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);

// Auth Context
const AuthContext = createContext({ token: null as string | null, login: (t: string) => {}, logout: () => {} });
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const login = (t: string) => { localStorage.setItem('token', t); setToken(t); };
  const logout = () => { localStorage.removeItem('token'); setToken(null); };
  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);