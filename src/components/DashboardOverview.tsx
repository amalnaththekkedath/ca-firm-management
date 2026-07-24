import React from 'react';
import {
  TrendingUp,
  Receipt,
  Users2,
  CheckSquare,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Zap,
  ShieldCheck,
  Bot,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { FIRM_DETAILS } from '../data/mockData';

export const DashboardOverview: React.FC = () => {
  const {
    currentUser,
    clients,
    tasks,
    invoices,
    attendance,
    timesheets,
    complianceDeadlines,
    setActiveTab,
    setIsRoleModalOpen,
  } = useApp();

  const totalCollected = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalOutstanding = invoices
    .filter((i) => i.status === 'SENT' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const pendingTasks = tasks.filter((t) => t.status !== 'FILED_COMPLETED');
  const criticalDeadlines = complianceDeadlines.filter((c) => c.status === 'CRITICAL');

  const todayStr = new Date().toISOString().split('T')[0];
  const staffPresentToday = attendance.filter(
    (a) => a.date === todayStr && (a.status === 'PRESENT' || a.status === 'ON_SITE' || a.status === 'WFH')
  ).length;

  // Recharts Data Sets
  const revenueTrendData = [
    { month: 'Apr', billed: 120000, collected: 110000 },
    { month: 'May', billed: 155000, collected: 140000 },
    { month: 'Jun', billed: 180000, collected: 165000 },
    { month: 'Jul', billed: 197200, collected: 95900 },
  ];

  const debtorsAgingData = [
    { name: '< 30 Days', value: 67400, color: '#38bdf8' },
    { name: '30 - 60 Days', value: 17700, color: '#f59e0b' },
    { name: '90+ Days', value: 25000, color: '#ef4444' },
  ];

  const taskCategoryData = [
    { name: 'GST', count: tasks.filter((t) => t.category === 'GST').length, fill: '#6366f1' },
    { name: 'Income Tax', count: tasks.filter((t) => t.category === 'INCOME_TAX').length, fill: '#8b5cf6' },
    { name: 'Tax Audit', count: tasks.filter((t) => t.category === 'TAX_AUDIT').length, fill: '#ec4899' },
    { name: 'Statutory Audit', count: tasks.filter((t) => t.category === 'STATUTORY_AUDIT').length, fill: '#10b981' },
    { name: 'MCA / ROC', count: tasks.filter((t) => t.category === 'MCA_ROC').length, fill: '#f59e0b' },
  ];

  const isPartnerOrAdmin =
    currentUser.role === 'PARTNER' || currentUser.role === 'ADMINISTRATOR';

  return (
    <div className="p-6 space-y-6 text-slate-900">
      {/* Top Banner: Role Context & Welcome */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold uppercase tracking-wider">
              {currentUser.role.replace('_', ' ')} WORKSTATION
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {currentUser.designation} • {FIRM_DETAILS.name} ({FIRM_DETAILS.frn})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Compliance Task
          </button>
          {isPartnerOrAdmin && (
            <button
              onClick={() => setActiveTab('invoicing')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" /> Generate Tax Invoice
            </button>
          )}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Switch Role
          </button>
        </div>
      </div>

      {/* Role-Adaptive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Billed Collections (Partners / Admins Only) */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isPartnerOrAdmin ? 'Cash Collections' : 'My Active Assigned Jobs'}
            </span>
            <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {isPartnerOrAdmin ? (
            <>
              <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                ₹{totalCollected.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>Collected this FY</span>
                <span className="text-emerald-700 font-semibold">100% Verified</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                {tasks.filter((t) => t.assignedToUserId === currentUser.id && t.status !== 'FILED_COMPLETED').length}{' '}
                <span className="text-xs text-slate-500 font-normal">Active Jobs</span>
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>Workload:</span>
                <span className="text-indigo-600 font-semibold">Assigned to You</span>
              </div>
            </>
          )}
        </div>

        {/* Card 2: Sundry Debtors Outstanding (Partners / Admins Only) */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isPartnerOrAdmin ? 'Outstanding Receivables' : 'Jobs In Review / Checking'}
            </span>
            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          {isPartnerOrAdmin ? (
            <>
              <p className="text-2xl font-black text-amber-700 mt-2 font-mono">
                ₹{totalOutstanding.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>Overdue Bills:</span>
                <button
                  onClick={() => setActiveTab('invoicing')}
                  className="text-amber-700 font-semibold hover:underline"
                >
                  Send Reminders
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-black text-amber-700 mt-2 font-mono">
                {tasks.filter((t) => t.checkerUserId === currentUser.id || (t.assignedToUserId === currentUser.id && t.status === 'SUBMITTED_FOR_CHECKING')).length}{' '}
                <span className="text-xs text-slate-500 font-normal">In Review</span>
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>Pending Stage:</span>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-amber-700 font-semibold hover:underline"
                >
                  View Kanban
                </button>
              </div>
            </>
          )}
        </div>

        {/* Card 3: Pending Compliance Tasks */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Client Jobs
            </span>
            <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {pendingTasks.length}{' '}
            <span className="text-xs text-slate-500 font-normal">Jobs Active</span>
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Critical Due:</span>
            <span className="text-indigo-600 font-semibold">{criticalDeadlines.length} Filings</span>
          </div>
        </div>

        {/* Card 4: Staff Attendance Today */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Staff Attendance Today
            </span>
            <div className="p-2 bg-purple-50 border border-purple-200 text-purple-600 rounded-lg">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {staffPresentToday} / 4{' '}
            <span className="text-xs text-slate-500 font-normal">Present</span>
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Office Mode:</span>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-purple-700 font-semibold hover:underline"
            >
              View Register
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical Visualizations & Compliance Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Financial Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue vs Collections Bar Chart (Partner / Admin Only) */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Billed Revenue vs Cash Collections (INR)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly realization analysis for professional CA fees
                </p>
              </div>
              <span className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                FY 2025-26
              </span>
            </div>

            {isPartnerOrAdmin ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        color: '#0f172a',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                    />
                    <Bar dataKey="billed" name="Billed Fee" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="collected" name="Collections" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center p-6 space-y-2">
                <ShieldCheck className="w-8 h-8 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Partner & Administrator Financial Access Required
                </h4>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Cash collections, billed fees, and financial realization charts are restricted to CA Partners and Administrators.
                </p>
              </div>
            )}
          </div>

          {/* Task Status Category Distribution */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" /> Compliance Jobs Pipeline by Category
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  GST, Tax Audit, Statutory Audit, Income Tax & MCA filings
                </p>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                View Kanban Board
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {taskCategoryData.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => setActiveTab('tasks')}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer transition text-center shadow-2xs"
                >
                  <p className="text-[11px] font-medium text-slate-500 truncate">{cat.name}</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-1 font-mono">{cat.count}</p>
                  <span className="inline-block w-2 h-2 rounded-full mt-1" style={{ backgroundColor: cat.fill }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Debtors Aging + Statutory Deadlines */}
        <div className="space-y-6">
          {/* Debtors Aging Pie Chart (Partner / Admin Only) */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Receipt className="w-4 h-4 text-amber-600" /> Sundry Debtors Aging
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Outstanding fee realization timeline
            </p>

            {isPartnerOrAdmin ? (
              <>
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={debtorsAgingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {debtorsAgingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
                  {debtorsAgingData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-700 font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono text-slate-900 font-bold">
                        ₹{item.value.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-1.5">
                <ShieldCheck className="w-6 h-6 text-amber-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-800">Outstanding Receivables Confidential</p>
                <p className="text-[11px] text-slate-500">Only CA Partners and Administrators can view client debtor aging & outstanding balances.</p>
              </div>
            )}
          </div>

          {/* Statutory Compliance Calendar Ticker */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" /> Statutory Deadlines Ticker
              </h3>
              <span className="text-[10px] text-red-700 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                ICAI / GST / IT
              </span>
            </div>

            <div className="space-y-2.5">
              {complianceDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{deadline.title}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        deadline.status === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      Due: {deadline.dueDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{deadline.applicableTo}</p>
                  <p className="text-[10px] text-amber-700 font-medium italic font-mono">
                    ⚠ {deadline.penaltyNotice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
