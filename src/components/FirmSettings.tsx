import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Database,
  Building,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FirmDetails } from '../types';

export const FirmSettings: React.FC = () => {
  const {
    firmDetails,
    updateFirmDetails,
    exportFullBackup,
    restoreFullBackup,
    resetDemoData,
    currentUser,
  } = useApp();

  const [formData, setFormData] = useState<FirmDetails>({ ...firmDetails });
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep form data in sync if firmDetails context changes (e.g. restore or reset)
  useEffect(() => {
    if (firmDetails) {
      setFormData({ ...firmDetails });
    }
  }, [firmDetails]);

  const isPartnerOrAdmin =
    currentUser?.role === 'PARTNER' || currentUser?.role === 'ADMINISTRATOR';

  if (!isPartnerOrAdmin) {
    return (
      <div className="p-8 text-center text-slate-700 space-y-4 max-w-lg mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-3xl inline-block">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          Only Managing Partners and System Administrators are authorized to edit firm information or execute full system backups and data restoration.
        </p>
      </div>
    );
  }

  const handleSaveFirmDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateFirmDetails(formData);
    setSaveSuccess('Firm profile & registration credentials updated successfully.');
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = restoreFullBackup(content);
        if (res.success) {
          setRestoreStatus({
            success: true,
            msg: 'Full ERP Database successfully restored! All clients, tasks, invoices, and staff records are reloaded.',
          });
        } else {
          setRestoreStatus({
            success: false,
            msg: res.error || 'Failed to restore backup.',
          });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 space-y-8 text-slate-900 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Firm Profile & Backup Station</h1>
          </div>
          <p className="text-xs text-slate-500">
            Configure Chartered Accountancy firm registration info, invoice letterhead data, and full database backups
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportFullBackup}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download Backup (JSON)
          </button>
        </div>
      </div>

      {/* Backup & Restore Action Panel */}
      <div className="bg-indigo-50/50 border border-indigo-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">System Data Backup & Disaster Recovery</h2>
            </div>
            <p className="text-xs text-slate-600">
              Export all system records (staff, clients, timesheets, invoices, messages, notices) or import a previous backup file.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportFullBackup}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export Backup File
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-4 h-4 text-emerald-600" /> Restore From Backup
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all firm data back to default demo state?')) {
                  resetDemoData();
                }
              }}
              className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Data
            </button>
          </div>
        </div>

        {restoreStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              restoreStatus.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {restoreStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{restoreStatus.msg}</span>
          </div>
        )}
      </div>

      {/* Edit Firm Details Form */}
      <form onSubmit={handleSaveFirmDetails} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" /> Firm Identity & ICAI Registration Details
          </h2>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Firm Details
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Firm Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Firm Tagline / Description
            </label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Chartered Accountants & Corporate Tax Advisors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ICAI Firm Registration Number (FRN)
            </label>
            <input
              type="text"
              value={formData.frn || ''}
              onChange={(e) => setFormData({ ...formData, frn: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Firm GSTIN
            </label>
            <input
              type="text"
              value={formData.gstin || ''}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Firm PAN Number
            </label>
            <input
              type="text"
              value={formData.pan || ''}
              onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Email Address
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Phone Number
            </label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Registered Office Address
          </label>
          <textarea
            value={formData.headOffice || ''}
            onChange={(e) => setFormData({ ...formData, headOffice: e.target.value })}
            rows={2}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        {/* Bank Account Details */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Bank Account Credentials (For Invoice Settlement)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNo || ''}
                onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc || ''}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID for Payments</label>
              <input
                type="text"
                value={formData.upiId || ''}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. firm@bank"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Firm Credentials
          </button>
        </div>
      </form>
    </div>
  );
};

