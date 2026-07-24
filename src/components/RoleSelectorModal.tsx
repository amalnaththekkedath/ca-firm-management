import React from 'react';
import { X, Check, ShieldCheck, UserCheck, Lock, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const RoleSelectorModal: React.FC = () => {
  const { isRoleModalOpen, setIsRoleModalOpen, users, currentUser, switchUser } = useApp();

  if (!isRoleModalOpen) return null;

  const roleDescriptions: Record<
    UserRole,
    { title: string; desc: string; permissions: string[] }
  > = {
    ADMINISTRATOR: {
      title: 'System Administrator',
      desc: 'Superuser with full administrative control over security policies, user management, firm settings & compliance databases.',
      permissions: [
        'Full Unrestricted Access to All ERP Modules',
        'User Provisioning, Password Resets & Lockout Controls',
        'Firm GSTIN, FRN & Master Configuration',
        'Database Backup, CSV Import & Export Operations',
      ],
    },
    PARTNER: {
      title: 'Managing Partner (CA)',
      desc: 'Full financial oversight, fee approvals, staff utilization analytics, client management & firm settings.',
      permissions: [
        'Executive Financial Dashboard & Debtors Aging',
        'Invoice Approval, Sign-off & Cancellation',
        'Staff Attendance & Leave Approval Workflow',
        'Client Retainer Setup & Partner Hourly Rates',
      ],
    },
    AUDIT_MANAGER: {
      title: 'Audit Manager',
      desc: 'Supervises audit engagements, reviews compliance filings, assigns tasks to team seniors & articles.',
      permissions: [
        'Client Project & Compliance Task Supervision',
        'Timesheet Verification & Task Assignment',
        'Team Attendance Monitoring & Leave Review',
        'Draft Invoice Preparation & SOA Ledger Review',
      ],
    },
    SENIOR_MANAGER: {
      title: 'Senior Manager',
      desc: 'Oversees multiple engagement teams, client relationships & billable hours realization.',
      permissions: [
        'Engagement Planning & Resource Allocation',
        'Billable Hours Review & WIP Analysis',
        'Client Master Directory & Retainer Management',
        'Draft Billing & Financial Oversight',
      ],
    },
    AUDIT_SENIOR: {
      title: 'Audit Senior / Qualified CA',
      desc: 'Leads fieldwork, conducts technical reviews of tax filings & financial statements, logs billable hours.',
      permissions: [
        'Statutory & Tax Audit Execution',
        'GST & Income Tax Review & Filing',
        'Daily Clock-In & Billable Stopwatch Timer',
        'Client Interaction & Engagement Notes',
      ],
    },
    ARTICLE_ASSISTANT: {
      title: 'Article Assistant / Trainee',
      desc: 'Clocks in daily, completes assigned GST & Tax filings, logs billable stopwatch hours and timesheets.',
      permissions: [
        'Daily GPS/IP Clock-In & Leave Portal',
        'Assigned Compliance Task Board (GSTR, ITR, AOC-4)',
        'Live Billable Timer Stopwatch',
        'Personal Timesheet Logging',
      ],
    },
    BILLING_CLERK: {
      title: 'Billing & Office Coordinator',
      desc: 'Manages client master directory, converts billable hours to invoices, tracks collections & sends payment reminders.',
      permissions: [
        'Client Master Directory & GSTIN Registry',
        'GST Tax Invoice Generator (SAC Codes, CGST/SGST/IGST)',
        'Automated WhatsApp/Email Payment Reminders',
        'Sundry Debtors Collection Register',
      ],
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC)</h2>
              <p className="text-xs text-slate-500">
                Switch user accounts to test role-specific desktop views & permissions.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRoleModalOpen(false)}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Selector */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((user) => {
              const isSelected = user.id === currentUser.id;
              const info = roleDescriptions[user.role];

              return (
                <div
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded">
                        {user.role.replace('_', ' ')}
                      </span>
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <Check className="w-4 h-4" /> Active Account
                        </span>
                      ) : (
                        <span className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> Select
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                        <p className="text-xs text-slate-500">{user.designation}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      {info.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-indigo-600" /> Key Permissions
                    </p>
                    <ul className="space-y-1">
                      {info.permissions.map((perm, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <span className="text-indigo-600">•</span>
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Active Session: <strong className="text-indigo-700">{currentUser.name}</strong> ({currentUser.role})</span>
          <button
            onClick={() => setIsRoleModalOpen(false)}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
          >
            Apply Active View
          </button>
        </div>
      </div>
    </div>
  );
};
