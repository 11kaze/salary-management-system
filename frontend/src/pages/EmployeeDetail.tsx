import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Building2, DollarSign, TrendingUp, History, Download } from 'lucide-react';
import api from '../lib/api';
import { Loader2 } from 'lucide-react';

const flags: Record<string, string> = {
  US: '🇺🇸', IN: '🇮🇳', GB: '🇬', SG: '🇸🇬',
  AE: '🇦🇪', DE: '🇩', CA: '🇨🇦', AU: '🇦'
};

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => api.get(`/employees/${id}`).then(res => res.data),
  });

  const { data: salaryHistory } = useQuery({
    queryKey: ['salary-history', id],
    queryFn: () => api.get(`/employees/${id}/salary/history`).then(res => res.data).catch(() => []),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#6366f1]" size={32} />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Employee not found</h2>
        <p className="text-[var(--text-muted)] mb-4">The employee you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/employees')}
          className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e8]"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-blue-100 text-blue-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
    ];
    return colors[name.length % colors.length];
  };

  return (
    <div>
      {/* Back Button & Header */}
      <button
        onClick={() => navigate('/employees')}
        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Employees
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 ${getAvatarColor(employee.first_name)}`}>
                {getInitials(`${employee.first_name} ${employee.last_name}`)}
              </div>
              <h1 className="text-2xl font-bold text-[var(--text)] mb-1">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-[var(--text-muted)] mb-4">{employee.job_title}</p>
              
              <div className="w-full space-y-3 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-[var(--text-muted)]" />
                  <span className="text-[var(--text)]">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 size={16} className="text-[var(--text-muted)]" />
                  <span className="text-[var(--text)]">{employee.department?.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-[var(--text-muted)]" />
                  <span className="text-[var(--text)]">
                    {employee.country?.name} {flags[employee.country?.code] || ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-[var(--text-muted)]" />
                  <span className="text-[var(--text)]">
                    Hired {new Date(employee.hire_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="w-full mt-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  employee.employment_status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    employee.employment_status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-500'
                  }`} />
                  {employee.employment_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employment Details */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[var(--text)] mb-4">Employment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Employee Code</p>
                <p className="font-medium text-[var(--text)]">{employee.employee_code}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Level</p>
                <p className="font-medium text-[var(--text)]">
                  <span className="px-2 py-1 bg-[#6366f1]/10 text-[#6366f1] text-sm rounded font-medium">
                    {employee.level}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Employment Type</p>
                <p className="font-medium text-[var(--text)]">{employee.employment_type}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Department</p>
                <p className="font-medium text-[var(--text)]">{employee.department?.name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Country</p>
                <p className="font-medium text-[var(--text)]">
                  {employee.country?.name} ({employee.country?.currency_code})
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Hire Date</p>
                <p className="font-medium text-[var(--text)]">
                  {new Date(employee.hire_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text)]">Salary Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-[#6366f1]/5 rounded-lg border border-[#6366f1]/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={18} className="text-[#6366f1]" />
                  <span className="text-sm text-[var(--text-muted)]">Base Salary</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text)]">
                  ${Number(employee.salary?.base_salary_usd || 0).toLocaleString()}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">USD / year</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-emerald-600" />
                  <span className="text-sm text-emerald-700">Bonus</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">
                  ${Number(employee.salary?.bonus_usd || 0).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 mt-1">USD / year</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={18} className="text-blue-600" />
                  <span className="text-sm text-blue-700">Total Compensation</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  ${(Number(employee.salary?.base_salary_usd || 0) + Number(employee.salary?.bonus_usd || 0)).toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-1">USD / year</p>
              </div>
            </div>

            {/* Salary History */}
            {salaryHistory && salaryHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                  <History size={16} />
                  Salary History
                </h3>
                <div className="space-y-2">
                  {salaryHistory.map((history: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg text-sm">
                      <div>
                        <p className="font-medium text-[var(--text)]">
                          ${(Number(history.old_base_salary||0)+Number(history.old_bonus||0)).toLocaleString()} → ${(Number(history.new_base_salary||0)+Number(history.new_bonus||0)).toLocaleString()}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(history.changed_at).toLocaleDateString()} • {history.reason || 'No reason provided'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)]">Changed by</p>
                        <p className="font-medium text-[var(--text)]">{history.changed_by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}