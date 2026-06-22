import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, Building2, MapPin, Loader2, DollarSign, Users, Download, Filter
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';
import api from '../lib/api';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

export default function Analytics() {
  // Filters for the tables
  const [deptFilter, setDeptFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then(res => res.data),
  });

  const { data: deptData, isLoading: isDeptLoading } = useQuery({
    queryKey: ['analytics-department'],
    queryFn: () => api.get('/analytics/by-department').then(res => res.data),
  });

  const { data: countryData, isLoading: isCountryLoading } = useQuery({
    queryKey: ['analytics-country'],
    queryFn: () => api.get('/analytics/by-country').then(res => res.data),
  });

  const { data: levelData, isLoading: isLevelLoading } = useQuery({
    queryKey: ['analytics-level'],
    queryFn: () => api.get('/analytics/by-level').then(res => res.data),
  });

  // Filtered data for tables
  const filteredDepts = useMemo(() => {
    if (!deptData) return [];
    return deptData.filter((d: any) => !deptFilter || d.department.toLowerCase().includes(deptFilter.toLowerCase()));
  }, [deptData, deptFilter]);

  const filteredCountries = useMemo(() => {
    if (!countryData) return [];
    return countryData.filter((c: any) => !countryFilter || c.country.toLowerCase().includes(countryFilter.toLowerCase()));
  }, [countryData, countryFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-h)] mb-1">Analytics & Reports</h1>
          <p className="text-sm text-[var(--text-muted)]">Deep dive into organizational metrics and payroll distribution</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text)] hover:bg-[var(--muted)] transition-colors">
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Summary Metrics (Compact) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: overview?.total_employees?.toLocaleString() || '0', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Total Payroll', value: formatCurrency(Number(overview?.total_payroll_usd) || 0), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Avg Salary', value: formatCurrency(Number(overview?.average_salary_usd) || 0), icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
          { label: 'Countries', value: overview?.total_countries || '0', icon: MapPin, color: 'text-amber-600 bg-amber-50' },
        ].map((m) => (
          <div key={m.label} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.color}`}>
              <m.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{m.label}</p>
              <p className="text-lg font-bold text-[var(--text-h)] leading-tight">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Level Analytics (Unique to Analytics Page) */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <BarChart3 size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-h)]">Seniority & Compensation Levels</h2>
            <p className="text-xs text-[var(--text-muted)]">Average salary progression from L1 to L7</p>
          </div>
        </div>

        {isLevelLoading ? (
          <div className="h-72 flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={24} /></div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={levelData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="level" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                formatter={(value: number) => [formatCurrency(value), 'Avg Salary']}
              />
              <Area type="monotone" dataKey="average_salary" stroke="#a855f7" fill="url(#colorSalary)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detailed Tables with Filters */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Department Breakdown Table */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-h)]">Department Payroll</h2>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Filter depts..." 
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/20 w-32"
              />
            </div>
          </div>

          {isDeptLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-[var(--muted)] rounded animate-pulse"></div>)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                    <th className="pb-2 font-medium">Department</th>
                    <th className="pb-2 font-medium text-right">Headcount</th>
                    <th className="pb-2 font-medium text-right">Total Payroll</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredDepts.map((dept: any, idx: number) => {
                    const maxPayroll = Math.max(...deptData.map((d: any) => Number(d.total_payroll)));
                    const pct = (Number(dept.total_payroll) / maxPayroll) * 100;
                    return (
                      <tr key={idx} className="hover:bg-[var(--muted)]/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                            <span className="font-medium text-[var(--text)]">{dept.department}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-[var(--text-muted)]">{dept.employee_count}</td>
                        <td className="py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-semibold text-[var(--text-h)]">{formatCurrency(Number(dept.total_payroll))}</span>
                            <div className="w-20 bg-[var(--muted)] rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Country Breakdown Table */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-h)]">Country Payroll</h2>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Filter countries..." 
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/20 w-36"
              />
            </div>
          </div>

          {isCountryLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-[var(--muted)] rounded animate-pulse"></div>)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                    <th className="pb-2 font-medium">Country</th>
                    <th className="pb-2 font-medium text-right">Headcount</th>
                    <th className="pb-2 font-medium text-right">Avg Salary</th>
                    <th className="pb-2 font-medium text-right">Total Payroll</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredCountries.map((country: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[var(--muted)]/50 transition-colors">
                      <td className="py-3 font-medium text-[var(--text)]">{country.country}</td>
                      <td className="py-3 text-right text-[var(--text-muted)]">{country.employee_count}</td>
                      <td className="py-3 text-right text-[var(--text-muted)]">{formatCurrency(Number(country.average_salary))}</td>
                      <td className="py-3 text-right font-semibold text-[var(--text-h)]">{formatCurrency(Number(country.total_payroll))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}