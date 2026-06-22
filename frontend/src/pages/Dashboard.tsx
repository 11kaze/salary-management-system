import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, DollarSign, BarChart3, Globe, TrendingUp, Loader2,
  Building2, MapPin, Trophy, Crown, Medal, Filter, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../lib/api';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4'];

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

// Hardcoded lists for dropdowns (matches your seed data)
const DEPARTMENTS = [
  { id: 1, name: 'Engineering' }, { id: 2, name: 'Product' }, { id: 3, name: 'Sales' },
  { id: 4, name: 'Marketing' }, { id: 5, name: 'Finance' }, { id: 6, name: 'HR' },
  { id: 7, name: 'Operations' }, { id: 8, name: 'Customer Success' }
];
const COUNTRIES = [
  { id: 1, name: 'United States' }, { id: 2, name: 'India' }, { id: 3, name: 'United Kingdom' },
  { id: 4, name: 'Germany' }, { id: 5, name: 'Singapore' }, { id: 6, name: 'Canada' },
  { id: 7, name: 'Australia' }, { id: 8, name: 'UAE' }
];

export default function Dashboard() {
  // Filter States
  const [filterDept, setFilterDept] = useState<number | ''>('');
  const [filterCountry, setFilterCountry] = useState<number | ''>('');
  const [topLimit, setTopLimit] = useState(10);

  const hasActiveFilters = filterDept !== '' || filterCountry !== '';

  // 1. Fetch Filtered Snapshot (Dynamic)
  const { data: snapshot, isLoading: isSnapshotLoading } = useQuery({
    queryKey: ['filtered-snapshot', filterDept, filterCountry],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterDept) params.append('department_id', filterDept.toString());
      if (filterCountry) params.append('country_id', filterCountry.toString());
      return api.get(`/analytics/filtered-snapshot?${params.toString()}`).then(res => res.data);
    },
  });

  // 2. Fetch Global Overview
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then(res => res.data),
  });

  // 3. Fetch Global Charts
  const { data: deptData, isLoading: isDeptLoading } = useQuery({ queryKey: ['analytics-department'], queryFn: () => api.get('/analytics/by-department').then(res => res.data) });
  const { data: countryData, isLoading: isCountryLoading } = useQuery({ queryKey: ['analytics-country'], queryFn: () => api.get('/analytics/by-country').then(res => res.data) });
  const { data: topEmployees, isLoading: isTopLoading } = useQuery({ queryKey: ['top-employees', topLimit], queryFn: () => api.get(`/employees/top-salary?limit=${topLimit}`).then(res => res.data) });

  const resetFilters = () => { setFilterDept(''); setFilterCountry(''); };

  const snapshotMetrics = [
    { title: 'Segment Headcount', value: snapshot?.headcount?.toLocaleString() || '0', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Segment Payroll', value: formatCurrency(Number(snapshot?.total_payroll) || 0), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Average Salary', value: formatCurrency(Number(snapshot?.average_salary) || 0), icon: BarChart3, color: 'bg-blue-50 text-blue-600' },
    { title: 'Median Salary', value: formatCurrency(Number(snapshot?.median_salary) || 0), icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
  ];

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={16} className="text-yellow-500" />;
    if (index === 1) return <Medal size={16} className="text-gray-400" />;
    if (index === 2) return <Medal size={16} className="text-amber-600" />;
    return <span className="text-xs font-bold text-[var(--text-muted)] w-4 text-center">{index + 1}</span>;
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const getAvatarColor = (name: string) => {
    const colors = ['bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-blue-100 text-blue-700', 'bg-orange-100 text-orange-700'];
    return colors[name.length % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-h)] mb-1">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">Overview of organization metrics and analytics</p>
      </div>

      {/* ========================================== */}
      {/* INTERACTIVE FILTER BAR                     */}
      {/* ========================================== */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-[var(--text-h)] font-semibold text-sm">
          <Filter size={16} className="text-[#6366f1]" />
          Segment Filters:
        </div>
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-1.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <select 
            value={filterCountry} 
            onChange={(e) => setFilterCountry(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-1.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
          >
            <option value="">All Countries</option>
            {COUNTRIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {hasActiveFilters && (
            <button 
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X size={12} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* WIDGET 1: SEGMENT SNAPSHOT CARDS           */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isSnapshotLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl animate-pulse">
              <div className="h-10 w-10 bg-[var(--muted)] rounded-lg mb-4"></div>
              <div className="h-4 w-24 bg-[var(--muted)] rounded mb-2"></div>
              <div className="h-8 w-32 bg-[var(--muted)] rounded"></div>
            </div>
          ))
        ) : (
          snapshotMetrics.map((m) => (
            <div key={m.title} className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.color}`}>
                  <m.icon size={24} />
                </div>
                {hasActiveFilters && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#6366f1] bg-[#6366f1]/10 px-2 py-0.5 rounded-full">
                    Filtered
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-1">{m.title}</p>
              <p className="text-2xl font-bold text-[var(--text-h)]">{m.value}</p>
            </div>
          ))
        )}
      </div>

      {/* ========================================== */}
      {/* WIDGET 2: SALARY BAND HISTOGRAM            */}
      {/* ========================================== */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-h)]">Salary Band Distribution</h2>
            <p className="text-xs text-[var(--text-muted)]">
              {hasActiveFilters ? 'Distribution of salaries for the selected segment' : 'Distribution of salaries across the entire organization'}
            </p>
          </div>
        </div>
        
        {isSnapshotLoading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={snapshot?.salary_bands} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                cursor={{ fill: 'var(--muted)' }}
                formatter={(value: number) => [`${value} Employees`, 'Count']}
              />
              <Bar dataKey="count" name="Employees" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ========================================== */}
      {/* EXISTING GLOBAL METRICS & CHARTS           */}
      {/* ========================================== */}
      <div className="pt-4 border-t border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">Global Organization Overview</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isOverviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl animate-pulse">
              <div className="h-10 w-10 bg-[var(--muted)] rounded-lg mb-4"></div>
              <div className="h-4 w-24 bg-[var(--muted)] rounded mb-2"></div>
              <div className="h-8 w-32 bg-[var(--muted)] rounded"></div>
            </div>
          ))
        ) : (
          [
            { title: 'Total Employees', value: overview?.total_employees?.toLocaleString() || '0', sub: 'Active employees', change: '+5.2%', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
            { title: 'Total Payroll (USD)', value: formatCurrency(Number(overview?.total_payroll_usd) || 0), sub: 'Total annual payroll', change: '+4.8%', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
            { title: 'Average Salary (USD)', value: formatCurrency(Number(overview?.average_salary_usd) || 0), sub: 'Overall average', change: '+3.1%', icon: BarChart3, color: 'bg-blue-50 text-blue-600' },
            { title: 'Countries', value: overview?.total_countries || '0', sub: 'Across the organization', change: '+2', icon: Globe, color: 'bg-amber-50 text-amber-600' },
          ].map((m) => (
            <div key={m.title} className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.color}`}>
                  <m.icon size={24} />
                </div>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-1">{m.title}</p>
              <p className="text-2xl font-bold text-[var(--text-h)]">{m.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">{m.sub}</p>
            </div>
          ))
        )}
      </div>

      {/* Global Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg"><Building2 size={20} className="text-indigo-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-h)]">Department Distribution</h2>
              <p className="text-xs text-[var(--text-muted)]">Employee count by department</p>
            </div>
          </div>
          {isDeptLoading ? <div className="h-80 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={24} /></div> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={60} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} cursor={{ fill: 'var(--muted)' }} />
                <Bar dataKey="employee_count" name="Employees" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg"><MapPin size={20} className="text-emerald-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-h)]">Country Distribution</h2>
              <p className="text-xs text-[var(--text-muted)]">Employee count by country</p>
            </div>
          </div>
          {isCountryLoading ? <div className="h-80 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={24} /></div> : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={countryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="employee_count" nameKey="country" label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {countryData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} formatter={(value: number, name: string) => [`${value} employees`, name]} />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Earners Leaderboard */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg"><Trophy size={20} className="text-yellow-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-h)]">Top Earners</h2>
              <p className="text-xs text-[var(--text-muted)]">Highest paid employees in the organization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">Show:</span>
            <div className="flex bg-[var(--muted)] rounded-lg p-1">
              {[10, 20, 50].map(limit => (
                <button key={limit} onClick={() => setTopLimit(limit)} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${topLimit === limit ? 'bg-[var(--card)] text-[var(--text-h)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
                  Top {limit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isTopLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-14 bg-[var(--muted)] rounded-lg animate-pulse"></div>))}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                  <th className="pb-3 font-medium w-12">Rank</th>
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Job Title</th>
                  <th className="pb-3 font-medium text-right">Base Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {topEmployees?.map((emp: any, idx: number) => (
                  <tr key={emp.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="py-3.5"><div className="flex items-center justify-center">{getRankIcon(idx)}</div></td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(emp.first_name)}`}>{getInitials(`${emp.first_name} ${emp.last_name}`)}</div>
                        <div>
                          <p className="font-medium text-[var(--text)]">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{emp.employee_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-[var(--text-muted)]">{emp.department}</td>
                    <td className="py-3.5 text-[var(--text-muted)]">{emp.job_title}</td>
                    <td className="py-3.5 text-right font-semibold text-[var(--text-h)]">{formatCurrency(emp.base_salary_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}