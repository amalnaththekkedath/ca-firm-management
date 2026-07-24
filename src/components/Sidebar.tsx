import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Users2,
  CheckSquare,
  Clock3,
  Receipt,
  TrendingUp,
  Bot,
  FileSpreadsheet,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  UserCheck,
  Megaphone,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, users, tasks, invoices, leaveRequests, notices, logout } = useApp();

  if (!currentUser) return null;

  const pendingTasksCount = tasks.filter((t) => t.status !== 'FILED_COMPLETED').length;
  const overdueInvoicesCount = invoices.filter((i) => i.status === 'OVERDUE').length;
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'PENDING').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      roles: ['ADMINISTRATOR', 'PARTNER', 'AUDIT_MANAGER', 'SENIOR_MANAGER', 'AUDIT_SENIOR', 'ARTICLE_ASSISTANT', 'BILLING_CLERK'],
    },
    {
      id: 'notices',
      label: 'Notice Board',
      icon: Megaphone,
      badge: notices.length > 0 ? `${notices.length} Notices` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      roles: ['ADMINISTRATOR', 'PARTNER', 'AUDIT_MANAGER', 'SENIOR_MANAGER', 'AUDIT_SENIOR', 'ARTICLE_ASSISTANT', 'BILLING_CLERK'],
    },
    {
      id: 'messaging',
      label: 'Internal Messaging',
      icon: MessageSquare,
      badge: 'Live Board',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      roles: ['ADMINISTRATOR', 'PARTNER', 'AUDIT_MANAGER', 'SENIOR_MANAGER', 'AUDIT_SENIOR', 'ARTICLE_ASSISTANT', 'BILLING_CLERK'],
    },
    {
      id: 'employees',
      label: 'Staff Roster & Users',
      icon: UserCheck,
      badge: `${users.length} Staff`,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      roles: ['ADMINISTRATOR', 'PARTNER'],
    },
    {
      id: 'attendance',
      label: 'Attendance & Leaves',
      icon: CalendarCheck,
      badge: pendingLeavesCount > 0 && (currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'PARTNER') ? `${pendingLeavesCount} Pending` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      roles: ['ADMINISTRATOR', 'PARTNER', 'AUDIT_MANAGER', 'SENIOR_MANAGER', 'AUDIT_SENIOR', 'ARTICLE_ASSISTANT', 'BILLING_CLERK'],
    },
    {
      id: 'clients',
      label: 'Client Directory',
      icon: Users2,
      badge: null,
      roles: ['ADMINISTRATOR', 'PARTNER', 'AUDIT_MANAGER', 'SENIOR_MANAGER', 'AUDIT_SENIOR', 'ARTICLE_ASSISTANT', 'BILLING_CLERK'],
    },
    {
      id: 'soa',
      label: 'Statement of Accounts',
      icon: FileSpreadsheet,
      badge: 'SOA Ledger',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      roles: ['ADMINISTRATOR', 'PARTNER'],
    },
    {
      id: 'tasks',
      label: 'Tasks & Filings',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      roles: ['ADMINISTRATOR', 'PARTNER', 'AUDIT_MANAGER', 'SENIOR_MANAGER', 'AUDIT_SENIOR', 'ARTICLE_ASSISTANT', 'BILLING_CLERK'],
    },
    {
      id: 'invoicing',
      label: 'Invoicing & Billing',
      icon: Receipt,
      badge: overdueInvoicesCount > 0 && (currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'PARTNER') ? `${overdueInvoicesCount} Overdue` : null,
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      roles: ['ADMINISTRATOR', 'PARTNER'],
    },
    {
      id: 'reports',
      label: 'Financial Oversight',
      icon: TrendingUp,
      badge: 'Realization Matrix',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      roles: ['ADMINISTRATOR', 'PARTNER'],
    },
    {
      id: 'firm_settings',
      label: 'Firm & Backup Config',
      icon: Building2,
      badge: 'System Backup',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      roles: ['ADMINISTRATOR', 'PARTNER'],
    },
    {
      id: 'ai_advisor',
      label: 'AI CA Advisor',
      icon: Bot,
      badge: 'Gemini 3.6',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      roles: ['ADMINISTRATOR', 'PARTNER', 'AUDIT_MANAGER', 'SENIOR_MANAGER', 'AUDIT_SENIOR', 'ARTICLE_ASSISTANT', 'BILLING_CLERK'],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen select-none print:hidden shadow-xs">
      <div className="py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Firm Workstation</span>
          <span className="text-[10px] text-indigo-600 font-mono font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">v2.5 SECURE</span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const hasRoleAccess = item.roles.includes(currentUser.role);

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : hasRoleAccess
                  ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                      isActive
                        ? 'bg-white/20 text-white border-transparent'
                        : item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {!hasRoleAccess && (
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" title="Restricted Role View" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom User Role Summary Badge & Logout */}
      <div className="p-3 m-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Active Account:</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200">
            {currentUser.role.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full border border-slate-300 object-cover"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-slate-900 font-semibold truncate">{currentUser.name}</p>
            <p className="text-slate-500 text-[10px] truncate">{currentUser.designation}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full mt-1 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-slate-600 rounded-xl font-medium transition flex items-center justify-center gap-1.5 text-xs shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout Session
        </button>
      </div>
    </aside>
  );
};
