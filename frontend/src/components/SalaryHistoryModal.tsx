import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, History, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import api from '../lib/api';
import { Loader2 } from 'lucide-react';

interface HistoryModalProps {
  employeeId: number;
  onClose: () => void;
}

export default function SalaryHistoryModal({ employeeId, onClose }: HistoryModalProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['salary-history', employeeId],
    queryFn: () => api.get(`/employees/${employeeId}/salary/history`).then(res => res.data),
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text)]">
            <History size={18} className="text-[#6366f1]"/> Salary History
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--muted)] rounded text-[var(--text-muted)]">
            <X size={18}/>
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center p-8"><Loader2 className="animate-spin mx-auto text-[#6366f1]"/></div>
          ) : (
            <div className="space-y-3">
              {history && history.length > 0 ? history.map((item: any, idx: number) => {
                // Calculate totals
                const oldTotal = Number(item.old_base_salary || 0) + Number(item.old_bonus || 0);
                const newTotal = Number(item.new_base_salary || 0) + Number(item.new_bonus || 0);
                const isIncrease = newTotal >= oldTotal;

                return (
                  <div key={idx} className="p-4 bg-[var(--muted)] rounded-lg border border-[var(--border)]">
                    {/* Header: Date and Icon */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        {isIncrease ? <TrendingUp size={16} className="text-emerald-500"/> : <TrendingDown size={16} className="text-red-500"/>}
                        <span className="text-xs font-medium text-[var(--text-muted)]">
                          {new Date(item.changed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                        Total Compensation
                      </span>
                    </div>

                    {/* Main Math: Old Total -> New Total */}
                    <div className="flex items-center justify-center gap-3 mb-3 py-2 bg-[var(--card)] rounded-md border border-[var(--border)]">
                      <span className="text-lg font-bold text-[var(--text-muted)]">
                        ${oldTotal.toLocaleString()}
                      </span>
                      {/* <DollarSign size={16} className="text-[#6366f1]" /> */}
                      {"-->"}
                      <span className="text-lg font-bold text-[var(--text)]">
                        ${newTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Breakdown: Base and Bonus */}
                    <div className="text-xs text-[var(--text-muted)] flex flex-col gap-1.5 pt-2 border-t border-[var(--border)]/50">
                      <div className="flex justify-between">
                        <span>Base Salary:</span>
                        <span className="font-medium text-[var(--text)]">
                          ${Number(item.old_base_salary || 0).toLocaleString()} → ${Number(item.new_base_salary || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus:</span>
                        <span className="font-medium text-[var(--text)]">
                          ${Number(item.old_bonus || 0).toLocaleString()} → ${Number(item.new_bonus || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Reason Footer */}
                    <div className="mt-3 pt-2 border-t border-[var(--border)]/50 text-[11px] text-[var(--text-muted)] italic">
                      {item.reason} • By: {item.changed_by}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12">
                  <History size={32} className="mx-auto text-[var(--text-muted)] opacity-20 mb-3" />
                  <p className="text-[var(--text-muted)]">No salary changes recorded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}