import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, Plus, Filter, Eye, MoreVertical, Edit, Trash2, History,
  ChevronLeft, ChevronRight, ArrowUpDown, Loader2, ChevronDown,
  Users, DollarSign, BarChart3, Globe, X
} from 'lucide-react';
import api from '../lib/api';
import EditEmployeeModal from '../components/EditEmployeeModal';
import SalaryHistoryModal from '../components/SalaryHistoryModal';


const flags: Record<string, string> = {
  US: '🇺🇸', IN: '🇮🇳', GB: '🇬🇧', SG: '🇸🇬',
  AE: '🇦🇪', DE: '🇪', CA: '🇨🇦', AU: '🇦'
};

// Simple mapping for demo purposes (backend expects IDs)
const DEPT_IDS: Record<string, number> = { 'Engineering': 1, 'Product': 2, 'Sales': 3, 'Finance': 5, 'HR': 6 };
const COUNTRY_IDS: Record<string, number> = { 'United States': 1, 'India': 2, 'United Kingdom': 3, 'Singapore': 5, 'UAE': 8 };

function AddEmployeeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department_id: '',
    country_id: '',
    job_title: '',
    level: 'L1',
    employment_type: 'FULL_TIME',
    employment_status: 'ACTIVE',
    hire_date: new Date().toISOString().split('T')[0],
    base_salary_usd: '',
    bonus_usd: '0',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.department_id) newErrors.department_id = 'Department is required';
    if (!formData.country_id) newErrors.country_id = 'Country is required';
    if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required';
    if (!formData.hire_date) newErrors.hire_date = 'Hire date is required';
    if (!formData.base_salary_usd || Number(formData.base_salary_usd) <= 0) {
      newErrors.base_salary_usd = 'Valid salary is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        employee_code: `EMP${Date.now().toString().slice(-5)}`, // Auto-generate
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        department_id: Number(formData.department_id),
        country_id: Number(formData.country_id),
        job_title: formData.job_title,
        level: formData.level,
        employment_type: formData.employment_type,
        employment_status: formData.employment_status,
        hire_date: formData.hire_date,
        base_salary_usd: Number(formData.base_salary_usd),
        bonus_usd: Number(formData.bonus_usd || 0),
      };
      
      await api.post('/employees', payload);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      if (error.response?.data?.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else {
        alert('Failed to create employee. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] sticky top-0 bg-[var(--card)] z-10">
          <h2 className="text-xl font-bold text-[var(--text)]">Add New Employee</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 ${
                    errors.first_name ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                  placeholder="John"
                />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 ${
                    errors.last_name ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                  placeholder="Doe"
                />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 ${
                    errors.email ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                  placeholder="john.doe@acme.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Organization */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Organization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) => handleChange('department_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 ${
                    errors.department_id ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="1">Engineering</option>
                  <option value="2">Product</option>
                  <option value="3">Sales</option>
                  <option value="4">Marketing</option>
                  <option value="5">Finance</option>
                  <option value="6">HR</option>
                  <option value="7">Operations</option>
                  <option value="8">Customer Success</option>
                </select>
                {errors.department_id && <p className="text-xs text-red-500 mt-1">{errors.department_id}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.country_id}
                  onChange={(e) => handleChange('country_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 ${
                    errors.country_id ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                >
                  <option value="">Select Country</option>
                  <option value="1">United States</option>
                  <option value="2">India</option>
                  <option value="3">United Kingdom</option>
                  <option value="4">Germany</option>
                  <option value="5">Singapore</option>
                  <option value="6">Canada</option>
                  <option value="7">Australia</option>
                  <option value="8">UAE</option>
                </select>
                {errors.country_id && <p className="text-xs text-red-500 mt-1">{errors.country_id}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => handleChange('job_title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 ${
                    errors.job_title ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                  placeholder="Software Engineer"
                />
                {errors.job_title && <p className="text-xs text-red-500 mt-1">{errors.job_title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                >
                  <option value="L1">L1 - Entry Level</option>
                  <option value="L2">L2 - Junior</option>
                  <option value="L3">L3 - Mid Level</option>
                  <option value="L4">L4 - Senior</option>
                  <option value="L5">L5 - Staff</option>
                  <option value="L6">L6 - Principal</option>
                  <option value="L7">L7 - Director</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Employment Type</label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => handleChange('employment_type', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Status</label>
                <select
                  value={formData.employment_status}
                  onChange={(e) => handleChange('employment_status', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Hire Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleChange('hire_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 ${
                    errors.hire_date ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                />
                {errors.hire_date && <p className="text-xs text-red-500 mt-1">{errors.hire_date}</p>}
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Compensation (USD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Base Salary <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
                  <input
                    type="number"
                    value={formData.base_salary_usd}
                    onChange={(e) => handleChange('base_salary_usd', e.target.value)}
                    className={`w-full pl-7 pr-3 py-2 border rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 ${
                      errors.base_salary_usd ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                    placeholder="85000"
                    min="0"
                  />
                </div>
                {errors.base_salary_usd && <p className="text-xs text-red-500 mt-1">{errors.base_salary_usd}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Bonus</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
                  <input
                    type="number"
                    value={formData.bonus_usd}
                    onChange={(e) => handleChange('bonus_usd', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                    placeholder="5000"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Employees() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [selectedHistoryEmployeeId, setSelectedHistoryEmployeeId] = useState<number | null>(null);



  const { data: employees = [], isLoading: isLoadingEmps } = useQuery({
    queryKey: ['employees', page, pageSize, search, department, country, status],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append('q', search);
      if (department) params.append('department_id', DEPT_IDS[department]?.toString() || '');
      if (country) params.append('country_id', COUNTRY_IDS[country]?.toString() || '');
      if (status) params.append('employment_status', status);
      
      return api.get(`/employees?${params.toString()}`).then(res => res.data);
    },
  });

  const { data: countData } = useQuery({
    queryKey: ['employee-count', search, department, country, status],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (department) params.append('department_id', DEPT_IDS[department]?.toString() || '');
      if (country) params.append('country_id', COUNTRY_IDS[country]?.toString() || '');
      if (status) params.append('employment_status', status);
      
      return api.get(`/employees/count?${params.toString()}`).then(res => res.data);
    },
  });

  const totalEmployees = countData?.total || 0;
  const totalPages = Math.ceil(totalEmployees / pageSize);

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

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (department) params.append('department_id', DEPT_IDS[department]?.toString() || '');
      if (country) params.append('country_id', COUNTRY_IDS[country]?.toString() || '');
      if (status) params.append('employment_status', status);
      
      const response = await api.get(`/employees/export/csv?${params.toString()}`, {
        responseType: 'blob',
      });
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = `employees_${new Date().toISOString().split('T')[0]}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      // Try to read error message from blob
      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        alert(`Export failed: ${text}`);
      } else {
        alert('Failed to export employees. Please check the backend logs.');
      }
    }
  };

  // Delete employee
  const handleDelete = async (employeeId: number, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/employees/${employeeId}`);
      alert('Employee deleted successfully');
      // Refetch the data
      window.location.reload(); // Simple reload to refresh data
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Only close if clicking outside of any dropdown button or menu
      if (!target.closest('.relative')) {
        setActiveDropdown(null);
      }
    };
    
    if (activeDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  return (
    <div>
      {/* Page heading */}
      <h2 className="!text-[var(--text)] text-2xl font-bold mb-1">Employees</h2>
      <p className="text-sm text-[var(--text-muted)] mb-9">
        <span className="hover:text-[var(--text)] cursor-pointer transition-colors">Dashboard</span>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--text)]">Employees</span>
      </p>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap mt-2">
        {/* Search */}
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email..."
            className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 text-[var(--text)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* Department */}
        <div className="relative">
          <select 
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 cursor-pointer"
          >
            <option value="">Department</option>
            <option>Engineering</option>
            <option>Product</option>
            <option>Sales</option>
            <option>Finance</option>
            <option>HR</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>

        {/* Country */}
        <div className="relative">
          <select 
            value={country}
            onChange={(e) => { setCountry(e.target.value); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 cursor-pointer"
          >
            <option value="">Country</option>
            <option>United States</option>
            <option>India</option>
            <option>United Kingdom</option>
            <option>Singapore</option>
            <option>UAE</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>

        {/* Employment Status */}
        <div className="relative">
          <select 
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 cursor-pointer"
          >
            <option value="">Status</option>
            <option>ACTIVE</option>
            <option>ON_LEAVE</option>
            <option>TERMINATED</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>

        {/* More Filters */}
        {/* <button className="flex items-center gap-1.5 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-sm text-[var(--text-muted)] hover:bg-[var(--muted)] transition-colors">
          <Filter size={13} />
          More Filters
        </button> */}

        <div className="flex-1" />

        {/* Export */}
        <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-sm text-[var(--text)] hover:bg-[var(--muted)] transition-colors">
          <Download size={14} />
          Export
        </button>

        {/* Add Employee */}
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#6366f1] hover:bg-[#5558e8] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={14} />
          Add Employee
        </button>
      </div>

      {/* Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[1200px]">
          <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
            <tr className="text-left text-[var(--text-muted)]">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" className="rounded border-[var(--border)]" />
              </th>
              <th className="px-4 py-3 font-medium">
                <button className="flex items-center gap-1 hover:text-[var(--text)] transition-colors">
                  Employee <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">
                <button className="flex items-center gap-1 hover:text-[var(--text)] transition-colors">
                  Department <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Job Title</th>
              <th className="px-4 py-3 font-medium">
                <button className="flex items-center gap-1 hover:text-[var(--text)] transition-colors">
                  Employment Status <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="px-4 py-3 font-medium text-right">
                <button className="flex items-center gap-1 hover:text-[var(--text)] transition-colors ml-auto">
                  Base Salary (USD) <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="px-4 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoadingEmps ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Loader2 className="animate-spin mx-auto text-[#6366f1]" size={24} />
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-[var(--text-muted)]">
                  No employees found.
                </td>
              </tr>
            ) : employees.map((emp: any) => (
              <tr key={emp.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                <td className="px-4 py-3.5">
                  <input type="checkbox" className="rounded border-[var(--border)]" />
                </td>

                {/* Employee */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(emp.first_name)}`}>
                      {getInitials(`${emp.first_name} ${emp.last_name}`)}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)]">{emp.first_name} {emp.last_name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{emp.email}</p>
                    </div>
                  </div>
                </td>

                {/* Department */}
                <td className="px-4 py-3.5 text-[var(--text)]">{emp.department?.name || 'N/A'}</td>

                {/* Country */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{flags[emp.country?.code] || ''}</span>
                    <div>
                      <p className="text-[var(--text)]">{emp.country?.name || 'N/A'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{emp.country?.currency_code || 'USD'}</p>
                    </div>
                  </div>
                </td>

                {/* Job Title + Level */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text)]">{emp.job_title}</span>
                    {emp.level && (
                      <span className="px-1.5 py-0.5 bg-[#6366f1]/10 text-[#6366f1] text-xs rounded font-medium">
                        {emp.level}
                      </span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {emp.employment_status}
                  </span>
                </td>

                {/* Salary */}
                <td className="px-4 py-3.5 font-medium text-right text-[var(--text)]">
                  ${Number(emp.salary?.base_salary_usd || 0).toLocaleString()}
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-1 text-[var(--text-muted)]">
                    <button onClick={() => navigate(`/employees/${emp.id}`)} className="p-1.5 hover:bg-[var(--muted)] rounded-lg"><Eye size={15}/></button>
                    
                    {/* More Actions Dropdown */}
                    <div className="relative">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setActiveDropdown(activeDropdown === emp.id ? null : emp.id); 
                      }} 
                      className="p-1.5 hover:bg-[var(--muted)] rounded-lg"
                    >
                      <MoreVertical size={15}/>
                    </button>
                      {activeDropdown === emp.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50 py-1">
                          {/* <button onClick={() => { navigate(`/employees/${emp.id}`); setActiveDropdown(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]"><Eye size={14}/> View</button> */}
                          
                          {/* EDIT BUTTON */}
                          <button 
                            onClick={() => { setEditingEmployee(emp); setActiveDropdown(null); }} 
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          
                          {/* HISTORY BUTTON */}
                          <button 
                            onClick={() => { setSelectedHistoryEmployeeId(emp.id); setActiveDropdown(null); }} 
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]"
                          >
                            <History size={14} /> Salary History
                          </button>

                          <div className="border-t border-[var(--border)] my-1"></div>
                          <button onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={14}/> Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
          <p>
            Showing {totalEmployees === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, totalEmployees)} of {totalEmployees.toLocaleString()} employees
          </p>

          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 hover:bg-[var(--muted)] rounded-lg disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page Numbers - Dynamic Range */}
            {(() => {
              const pages: (number | string)[] = [];
              const showPages = 3; // Number of pages to show around current page
              
              // Always show first page
              pages.push(1);
              
              // Calculate start and end of visible range
              let start = Math.max(2, page - 1);
              let end = Math.min(totalPages - 1, page + 1);
              
              // Adjust if we're near the beginning
              if (page <= 2) {
                start = 2;
                end = Math.min(totalPages - 1, showPages);
              }
              
              // Adjust if we're near the end
              if (page >= totalPages - 1) {
                start = Math.max(2, totalPages - showPages);
                end = totalPages - 1;
              }
              
              // Add ellipsis after first page if needed
              if (start > 2) {
                pages.push('...');
              }
              
              // Add visible pages
              for (let i = start; i <= end; i++) {
                pages.push(i);
              }
              
              // Add ellipsis before last page if needed
              if (end < totalPages - 1) {
                pages.push('...');
              }
              
              // Always show last page if more than 1 page
              if (totalPages > 1) {
                pages.push(totalPages);
              }
              
              return pages.map((p, idx) =>
                typeof p === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-[#6366f1] text-white'
                        : 'hover:bg-[var(--muted)] text-[var(--text)]'
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span key={idx} className="w-6 text-center select-none">…</span>
                )
              );
            })()}

            {/* Next Button */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 hover:bg-[var(--muted)] rounded-lg disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={14} />
            </button>

            {/* Page Size Selector */}
            <div className="relative ml-2">
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="appearance-none pl-3 pr-7 py-1.5 border border-[var(--border)] rounded-lg bg-[var(--card)] text-sm text-[var(--text)] focus:outline-none cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>
 
        {/* Add Employee Modal */}
        {isAddModalOpen && (
          <AddEmployeeModal 
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={() => {
              setIsAddModalOpen(false);
              // Refetch employees list
              window.location.reload();
            }}
          />
        )}

        {/* RENDER MODALS HERE */}
        {editingEmployee && (
          <EditEmployeeModal 
            employee={editingEmployee} 
            onClose={() => setEditingEmployee(null)} 
            onSuccess={() => { setEditingEmployee(null); window.location.reload(); }} 
          />
        )}

        {selectedHistoryEmployeeId && (
          <SalaryHistoryModal 
            employeeId={selectedHistoryEmployeeId} 
            onClose={() => setSelectedHistoryEmployeeId(null)} 
          />
        )}
      </div>
    </div>
  );
}