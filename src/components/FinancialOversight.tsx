import React from 'react';
import {
  TrendingUp,
  Receipt,
  Users,
  ShieldCheck,
  Send,
  BarChart2,
  PieChart as PieIcon,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FinancialOversight: React.FC = () => {
  const { invoices, users, timesheets, sendPaymentReminder, currentUser } = useApp();

  const isPartnerOrAdmin = currentUser?.role === 'ADMINISTRATOR' || currentUser?.role === 'PARTNER';

  if (!isPartnerOrAdmin) {
    return (
      <div className="p-8 max-w-3xl mx-auto my-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted: Executive Financial Oversight</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Firm realization analytics, debtors aging, and staff financial metrics are confidential and restricted exclusively to Managing Partners and System Administrators.
        </p>
        <div className="pt-2">
          <span className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
            Your Role: {currentUser?.role}
          </span>
        </div>
      </div>
    );
  }

  // Debtors Breakdown
  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');
  const sentInvoices = invoices.filter((i) => i.status === 'SENT');

  // Staff Realization Matrix
  const staffMetrics = users.map((u) => {
    const userSheets = timesheets.filter((t) => t.userId === u.id);
    const totalMinutes = userSheets.reduce((sum, t) => sum + t.durationMinutes, 0);
    const billableMinutes = userSheets
      .filter((t) => t.billable)
      .reduce((sum, t) => sum + t.durationMinutes, 0);

    const utilization = totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0;
    const totalBilledValue = userSheets.reduce(
      (sum, t) => sum + Math.round((t.durationMinutes / 60) * t.hourlyRate),
      0
    );

    return {
      ...u,
      totalHours: (totalMinutes / 60).toFixed(1),
      billableHours: (billableMinutes / 60).toFixed(1),
      utilization,
      totalBilledValue,
    };
  });

  return (
    <div className="p-6 space-y-6 text-slate-900">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-5 rounded-2xl border border-indigo-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded text-[10px] font-bold uppercase tracking-wider">
              PARTNER FINANCIAL CONTROL
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Financial Oversight & Practice Realization Matrix
          </h1>
          <p className="text-xs text-indigo-100/80 mt-0.5">
            Staff billable utilization, debtors aging & practice profitability metrics
          </p>
        </div>

        <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 text-right">
          <span className="text-[10px] text-slate-300 uppercase font-semibold">
            Active Executive Session:
          </span>
          <p className="text-xs font-bold text-indigo-200">{currentUser.name}</p>
        </div>
      </div>

      {/* Staff Realization & Utilization Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" /> Staff Utilization & Fee Realization Matrix
          </h3>
          <span className="text-xs text-slate-500">
            Billable vs Non-Billable Hours Breakdown
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-mono font-bold">
                <th className="p-3">Staff Member</th>
                <th className="p-3">Role</th>
                <th className="p-3">Hourly Rate</th>
                <th className="p-3">Total Hours</th>
                <th className="p-3">Billable Hours</th>
                <th className="p-3">Utilization Rate</th>
                <th className="p-3">Generated Fee (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {staffMetrics.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <span>{staff.name}</span>
                  </td>
                  <td className="p-3 font-mono text-indigo-700 font-medium">{staff.role}</td>
                  <td className="p-3 font-mono text-slate-600">₹{staff.hourlyRate}/hr</td>
                  <td className="p-3 font-mono text-slate-600">{staff.totalHours} hrs</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">
                    {staff.billableHours} hrs
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, staff.utilization)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-indigo-700">
                        {staff.utilization}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-extrabold text-slate-900">
                    ₹{staff.totalBilledValue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sundry Debtors Collection Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-600" /> Overdue Debtors Collection Action Queue
          </h3>
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold">
            {overdueInvoices.length} Overdue Accounts
          </span>
        </div>

        <div className="space-y-3">
          {overdueInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-700">{inv.invoiceNumber}</span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-200 font-bold px-2 py-0.5 rounded">
                    OVERDUE
                  </span>
                </div>
                <p className="text-slate-900 font-bold mt-1">{inv.clientName}</p>
                <p className="text-slate-500 mt-0.5">
                  Due Date: <span className="font-mono text-amber-700 font-semibold">{inv.dueDate}</span>
                </p>
                {inv.reminderSentAt && (
                  <p className="text-[10px] text-emerald-700 mt-1 font-mono font-medium">
                    Last Reminder Sent: {new Date(inv.reminderSentAt).toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  ₹{inv.totalAmount.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => sendPaymentReminder(inv.id)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send Reminder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
