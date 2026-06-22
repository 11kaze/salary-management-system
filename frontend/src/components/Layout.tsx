import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, DollarSign, BarChart3, Download,
  FileText, Settings, Sun, Moon, Bell, ChevronDown, LogOut, HelpCircle
} from 'lucide-react';
import { useTheme, useAuth } from '../context/AppContext';
import { getDecodedToken } from '../lib/api';

const appName = import.meta.env.VITE_APP_NAME || 'ACME Corp';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Employees', icon: Users, path: '/employees' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Bulk Operations', icon: Download, path: '/bulk' },
  { name: 'Reports', icon: FileText, path: '/reports' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Keep <html> class in sync with theme state
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }, [theme]);

  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const sidebarMenuRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(e.target as Node)) {
        setSidebarMenuOpen(false);
      }
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const tokenData = getDecodedToken();
  const userEmail = tokenData?.sub || 'hr@acme.com';
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="w-56 border-r border-[var(--border)] bg-[var(--card)] flex flex-col shrink-0">
        {/* Logo / App name */}
        <div className="h-16 px-4 flex items-center gap-2 border-b border-[var(--border)]">
          <div className="w-7 h-7 bg-[#6366f1]/10 rounded-lg flex items-center justify-center text-[#6366f1] shrink-0">
            <Users size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate leading-tight">{appName}</p>
            <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight">Salary Management</p>
          </div>
          <ChevronDown size={14} className="text-[var(--text-muted)] shrink-0" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-[var(--text-muted)] hover:bg-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <item.icon size={17} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 pb-12 border-t border-[var(--border)] space-y-1">
          {/* Theme toggle — radio-style pill */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--muted)]">
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                theme === 'light'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Sun size={13} />
              Light
            </button>
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Moon size={13} />
              Dark
            </button>
          </div>

          {/* User profile — click to open logout */}
          <div className="relative" ref={sidebarMenuRef}>
            <button
              onClick={() => setSidebarMenuOpen((o) => !o)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#6366f1] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-[var(--text)] truncate leading-tight">HR Manager</p>
                <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight">{userEmail}</p>
              </div>
              <ChevronDown
                size={14}
                className={`text-[var(--text-muted)] shrink-0 transition-transform ${sidebarMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {sidebarMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] flex items-center px-6 gap-4 shrink-0">
          {/* Search */}
          {/* <div className="relative w-[420px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              width="15" height="15" viewBox="0 0 15 15" fill="none"
            >
              <path
                d="M10 6.5C10 8.43 8.43 10 6.5 10C4.57 10 3 8.43 3 6.5C3 4.57 4.57 3 6.5 3C8.43 3 10 4.57 10 6.5ZM9.44 10.15C8.68 10.67 7.63 11 6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 7.63 10.67 8.68 10.15 9.44L12.85 12.15C13.05 12.34 13.05 12.66 12.85 12.85C12.66 13.05 12.34 13.05 12.15 12.85L9.44 10.15Z"
                fill="currentColor" fillRule="evenodd" clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              placeholder="Search employees by name, email, department..."
              className="w-full pl-9 pr-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-[var(--text)] placeholder:text-[var(--text-muted)]"
            />
          </div> */}

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Notification bell with badge */}
            <button className="relative p-2 text-[var(--text-muted)] hover:bg-[var(--muted)] rounded-lg transition-colors">
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-0.5 bg-[#6366f1] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                3
              </span>
            </button>

            {/* Help */}
            <button className="p-2 text-[var(--text-muted)] hover:bg-[var(--muted)] rounded-lg transition-colors">
              <HelpCircle size={19} />
            </button>

            {/* HR Avatar — click-based dropdown */}
            <div className="relative ml-1" ref={headerMenuRef}>
              <button
                onClick={() => setHeaderMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#6366f1] text-white flex items-center justify-center text-xs font-bold">
                  {userInitials}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-[var(--text-muted)] transition-transform ${headerMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {headerMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--background)] text-left">
          {children}
        </main>
      </div>
    </div>
  );
}