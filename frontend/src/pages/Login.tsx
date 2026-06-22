import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AppContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const res = await api.post('/auth/login', formData, { 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' } 
      });
      login(res.data.access_token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6366f1]/5 via-[var(--background)] to-[#a855f7]/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-2xl mb-4 shadow-lg shadow-[#6366f1]/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Welcome Back</h1>
          <p className="text-[var(--text-muted)]">Sign in to ACME Corp Salary Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl shadow-black/5 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[var(--text-muted)]" />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  placeholder="hr@acme.com"
                  className="w-full pl-11 pr-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[var(--text-muted)]" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-[var(--border)] text-[#6366f1] focus:ring-[#6366f1]/20"
                />
                <span className="text-[var(--text-muted)]">Remember me</span>
              </label>
              <button type="button" className="text-[#6366f1] hover:text-[#5558e8] font-medium transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#6366f1]/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--card)] px-3 text-[var(--text-muted)]">Demo Credentials</span>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-[var(--muted)] rounded-xl p-4 text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)]">Email:</span>
              <code className="text-[var(--text)] font-mono">hr@acme.com</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Password:</span>
              <code className="text-[var(--text)] font-mono">admin123</code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Protected by enterprise-grade security • © 2026 ACME Corp
        </p>
      </div>
    </div>
  );
}