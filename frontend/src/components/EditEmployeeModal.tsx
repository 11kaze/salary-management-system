import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../lib/api';

interface EditModalProps {
  employee: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEmployeeModal({ employee, onClose, onSuccess }: EditModalProps) {
  const [formData, setFormData] = useState({
    first_name: employee.first_name || '',
    last_name: employee.last_name || '',
    email: employee.email || '',
    department_id: employee.department?.id?.toString() || '',
    country_id: employee.country?.id?.toString() || '',
    job_title: employee.job_title || '',
    level: employee.level || 'L1',
    employment_type: employee.employment_type || 'FULL_TIME',
    employment_status: employee.employment_status || 'ACTIVE',
    hire_date: new Date(employee.hire_date).toISOString().split('T')[0],
    base_salary_usd: employee.salary?.base_salary_usd?.toString() || '',
    bonus_usd: employee.salary?.bonus_usd?.toString() || '0',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'Required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    if (!formData.department_id) newErrors.department_id = 'Required';
    if (!formData.country_id) newErrors.country_id = 'Required';
    if (!formData.job_title.trim()) newErrors.job_title = 'Required';
    if (!formData.base_salary_usd) newErrors.base_salary_usd = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      await api.put(`/employees/${employee.id}`, {
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
        bonus_usd: Number(formData.bonus_usd),
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Failed to update employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] sticky top-0 bg-[var(--card)] z-10">
          <h2 className="text-xl font-bold text-[var(--text)]">Edit Employee</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-lg"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Reuse your grid layout here or just simple fields for brevity */}
          <div className="grid grid-cols-2 gap-4">
             <input placeholder="First Name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="p-2 border rounded" />
             <input placeholder="Last Name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="p-2 border rounded" />
             <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="p-2 border rounded col-span-2" />
             {/* Add other fields like Department, Country, Job Title, Level, etc. similar to Add Modal */}
             
             <div className="col-span-2 border-t pt-4 mt-2">
                <h4 className="font-semibold mb-2">Compensation</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Base Salary" value={formData.base_salary_usd} onChange={e => setFormData({...formData, base_salary_usd: e.target.value})} className="p-2 border rounded" />
                  <input type="number" placeholder="Bonus" value={formData.bonus_usd} onChange={e => setFormData({...formData, bonus_usd: e.target.value})} className="p-2 border rounded" />
                </div>
             </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#6366f1] text-white rounded hover:bg-[#5558e8]">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}