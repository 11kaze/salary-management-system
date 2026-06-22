import React, { useState } from 'react';
import { 
  Upload, Download, FileText, CheckCircle2, XCircle, 
  Loader2, AlertTriangle 
} from 'lucide-react';
import api from '../lib/api';

interface ImportResult {
  success_count: number;
  created_count: number;
  updated_count: number;
  failed_count: number;
  failed_rows: Array<{
    row_number: number;
    error: string;
    data: Record<string, any>;
  }>;
}

interface UpdateResult {
  updated_count: number;
  created_count: number;
  failed_count: number;
  failed_rows: Array<{
    row_number: number;
    error: string;
    data: Record<string, any>;
  }>;
}

export default function BulkOperations() {
  const [activeTab, setActiveTab] = useState<'import' | 'salary'>('import');
  
  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Salary Update State
  const [salaryFile, setSalaryFile] = useState<File | null>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryResult, setSalaryResult] = useState<UpdateResult | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImportLoading(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await api.post('/bulk/employees/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(res.data);
      setImportFile(null);
    } catch (err: any) {
      setImportResult({
        success_count: 0,
        created_count: 0,
        updated_count: 0,
        failed_count: 0,
        failed_rows: [{ row_number: 0, error: err.response?.data?.detail || 'Failed to import', data: {} }]
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleSalaryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryFile) return;

    setSalaryLoading(true);
    setSalaryResult(null);

    const formData = new FormData();
    formData.append('file', salaryFile);

    try {
      const res = await api.post('/bulk/salaries/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSalaryResult(res.data);
      setSalaryFile(null);
    } catch (err: any) {
      setSalaryResult({
        updated_count: 0,
        created_count: 0,
        failed_count: 0,
        failed_rows: [{ row_number: 0, error: err.response?.data?.detail || 'Failed to update', data: {} }]
      });
    } finally {
      setSalaryLoading(false);
    }
  };

  const downloadTemplate = async (type: 'employees' | 'salaries') => {
    try {
      const res = await api.get(`/bulk/${type}/template`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download template');
    }
  };

  const ImportResultDisplay = ({ result }: { result: ImportResult }) => (
    <div className="mt-6 p-4 border border-[var(--border)] rounded-xl bg-[var(--muted)]">
      <div className="flex items-center gap-3 mb-3">
        {result.failed_count === 0 ? (
          <CheckCircle2 size={20} className="text-emerald-600" />
        ) : (
          <AlertTriangle size={20} className="text-amber-600" />
        )}
        <h3 className="font-semibold text-[var(--text-h)]">Import Results</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--text-h)]">{result.success_count}</p>
          <p className="text-xs text-[var(--text-muted)]">Successful</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600">{result.created_count}</p>
          <p className="text-xs text-[var(--text-muted)]">Created</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{result.updated_count}</p>
          <p className="text-xs text-[var(--text-muted)]">Updated</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{result.failed_count}</p>
          <p className="text-xs text-[var(--text-muted)]">Failed</p>
        </div>
      </div>

      {result.failed_rows.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-[var(--text)] mb-2">Failed Rows:</p>
          <div className="max-h-60 overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 space-y-2">
            {result.failed_rows.map((fail, idx) => (
              <div key={idx} className="text-xs border-b border-[var(--border)] pb-2 last:border-0">
                <p className="font-medium text-red-600">Row {fail.row_number}: {fail.error}</p>
                {Object.keys(fail.data).length > 0 && (
                  <div className="mt-1 text-[var(--text-muted)]">
                    {Object.entries(fail.data).map(([key, value]) => (
                      <span key={key} className="mr-3">{key}: {value}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const UpdateResultDisplay = ({ result }: { result: UpdateResult }) => (
    <div className="mt-6 p-4 border border-[var(--border)] rounded-xl bg-[var(--muted)]">
      <div className="flex items-center gap-3 mb-3">
        {result.failed_count === 0 ? (
          <CheckCircle2 size={20} className="text-emerald-600" />
        ) : (
          <AlertTriangle size={20} className="text-amber-600" />
        )}
        <h3 className="font-semibold text-[var(--text-h)]">Update Results</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600">{result.updated_count}</p>
          <p className="text-xs text-[var(--text-muted)]">Updated</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{result.created_count}</p>
          <p className="text-xs text-[var(--text-muted)]">Created</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{result.failed_count}</p>
          <p className="text-xs text-[var(--text-muted)]">Failed</p>
        </div>
      </div>

      {result.failed_rows.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-[var(--text)] mb-2">Failed Rows:</p>
          <div className="max-h-60 overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 space-y-2">
            {result.failed_rows.map((fail, idx) => (
              <div key={idx} className="text-xs border-b border-[var(--border)] pb-2 last:border-0">
                <p className="font-medium text-red-600">Row {fail.row_number}: {fail.error}</p>
                {Object.keys(fail.data).length > 0 && (
                  <div className="mt-1 text-[var(--text-muted)]">
                    {Object.entries(fail.data).map(([key, value]) => (
                      <span key={key} className="mr-3">{key}: {value}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-h)] mb-1">Bulk Operations</h1>
        <p className="text-sm text-[var(--text-muted)]">Import and update data via CSV files</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-3">
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'import' ? 'bg-[#6366f1] text-white' : 'bg-[var(--muted)] text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Upload size={16} /> Import Employees
        </button>
        <button
          onClick={() => setActiveTab('salary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'salary' ? 'bg-[#6366f1] text-white' : 'bg-[var(--muted)] text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <FileText size={16} /> Update Salaries
        </button>
      </div>

      {/* Import Employees Tab */}
      {activeTab === 'import' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Upload size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-h)]">Bulk Import Employees</h2>
              <p className="text-xs text-[var(--text-muted)]">Upload a CSV file to add or update multiple employees</p>
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={() => downloadTemplate('employees')}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text)] hover:bg-[var(--muted)] transition-colors"
            >
              <Download size={14} />
              Download Template
            </button>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                CSV File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                required
              />
              {importFile && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Selected: {importFile.name}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                <AlertTriangle size={14} /> Existing employees will be updated, new ones created
              </div>
              <button
                type="submit"
                disabled={importLoading || !importFile}
                className="flex items-center gap-2 px-6 py-2 bg-[#6366f1] text-white rounded-lg font-medium hover:bg-[#5558e8] disabled:opacity-50"
              >
                {importLoading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                Import Employees
              </button>
            </div>
          </form>

          {importResult && <ImportResultDisplay result={importResult} />}
        </div>
      )}

      {/* Update Salaries Tab */}
      {activeTab === 'salary' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FileText size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-h)]">Bulk Update Salaries</h2>
              <p className="text-xs text-[var(--text-muted)]">Upload a CSV file to update multiple salaries at once</p>
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={() => downloadTemplate('salaries')}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text)] hover:bg-[var(--muted)] transition-colors"
            >
              <Download size={14} />
              Download Template
            </button>
          </div>

          <form onSubmit={handleSalaryUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                CSV File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setSalaryFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                required
              />
              {salaryFile && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Selected: {salaryFile.name}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                <AlertTriangle size={14} /> All changes will be logged in salary history
              </div>
              <button
                type="submit"
                disabled={salaryLoading || !salaryFile}
                className="flex items-center gap-2 px-6 py-2 bg-[#6366f1] text-white rounded-lg font-medium hover:bg-[#5558e8] disabled:opacity-50"
              >
                {salaryLoading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                Update Salaries
              </button>
            </div>
          </form>

          {salaryResult && <UpdateResultDisplay result={salaryResult} />}
        </div>
      )}
    </div>
  );
}