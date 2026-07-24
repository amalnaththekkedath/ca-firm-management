import React, { useState } from 'react';
import {
  Clock,
  Play,
  Square,
  Plus,
  Receipt,
  UserCheck,
  CheckCircle,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Timesheets: React.FC = () => {
  const {
    timesheets,
    tasks,
    currentUser,
    activeStopwatch,
    startStopwatch,
    stopStopwatch,
    addTimesheetEntry,
    deleteTimesheetEntry,
    createInvoice,
    setActiveTab,
  } = useApp();

  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState(tasks[0]?.id || '');
  const [stopNote, setStopNote] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualMinutes, setManualMinutes] = useState<number>(60);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const task = tasks.find((t) => t.id === selectedTaskForTimer);
    if (!task) return;

    addTimesheetEntry({
      taskId: task.id,
      taskTitle: task.title,
      clientId: task.clientId,
      clientName: task.clientName,
      userId: currentUser.id,
      userName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Number(manualMinutes),
      description: manualDescription || 'Manual billable timesheet entry',
      billable: true,
      hourlyRate: currentUser.hourlyRate,
    });

    setIsManualModalOpen(false);
    setManualDescription('');
  };

  // Convert unbilled timesheets to Draft Invoice
  const handleBatchInvoiceConversion = () => {
    const unbilled = timesheets.filter((t) => !t.billedInvoiceId && t.billable);
    if (unbilled.length === 0) return;

    // Group by client
    const firstClientTimesheet = unbilled[0];
    const clientTimesheets = unbilled.filter((t) => t.clientId === firstClientTimesheet.clientId);

    const items = clientTimesheets.map((ts, idx) => ({
      id: `itm-ts-${idx}`,
      description: `${ts.taskTitle} - (${(ts.durationMinutes / 60).toFixed(1)} billable hrs by ${ts.userName})`,
      sacCode: '998231',
      quantity: Number((ts.durationMinutes / 60).toFixed(1)),
      rate: ts.hourlyRate,
      amount: Math.round((ts.durationMinutes / 60) * ts.hourlyRate),
    }));

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const cgst = Math.round(subtotal * 0.09);
    const sgst = Math.round(subtotal * 0.09);
    const totalAmount = subtotal + cgst + sgst;

    createInvoice({
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientId: firstClientTimesheet.clientId,
      clientName: firstClientTimesheet.clientName,
      clientGstin: '27AAACA1234B1Z5',
      clientPan: 'AAACA1234B',
      clientAddress: 'Client Office Premises',
      clientState: 'Maharashtra (27)',
      placeOfSupply: 'Maharashtra (27)',
      items,
      subtotal,
      outOfPocketExpenses: 0,
      cgst,
      sgst,
      igst: 0,
      totalAmount,
      status: 'DRAFT',
      notes: 'Generated automatically from accumulated staff billable timesheets.',
    });

    setActiveTab('invoicing');
  };

  return (
    <div className="p-6 space-y-6 text-slate-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Billable Timesheets & Active Stopwatch
          </h1>
          <p className="text-xs text-slate-500">
            Track staff billable hours, hourly realization rates & 1-click invoice conversion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Log Manual Time
          </button>
          <button
            onClick={handleBatchInvoiceConversion}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" /> Convert Unbilled to Invoice
          </button>
        </div>
      </div>

      {/* Active Stopwatch Widget Box */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50/50 border border-indigo-200 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              Stopwatch Station
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              {activeStopwatch
                ? `Timing: ${activeStopwatch.taskTitle} (${activeStopwatch.clientName})`
                : 'No Active Timer Running'}
            </h3>
            <p className="text-xs text-slate-500">
              Select a task below and launch the live stopwatch to calculate billable time precisely.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-2xl font-black font-mono text-amber-600 min-w-[120px] text-center">
              {activeStopwatch ? formatTime(activeStopwatch.elapsedSeconds) : '00:00:00'}
            </div>

            {activeStopwatch ? (
              <button
                onClick={() => {
                  stopStopwatch(stopNote || 'Stopwatch logged session');
                  setStopNote('');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <Square className="w-4 h-4 fill-white" /> Stop & Save
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedTaskForTimer}
                  onChange={(e) => setSelectedTaskForTimer(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 max-w-[200px]"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.clientName})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => startStopwatch(selectedTaskForTimer)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-white" /> Start Stopwatch
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timesheet Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Recent Staff Timesheet Logs
          </h3>
          <span className="text-xs text-slate-500">
            Total Timesheet Records: {timesheets.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Staff Member</th>
                <th className="p-3 font-semibold">Client Name</th>
                <th className="p-3 font-semibold">Task Title</th>
                <th className="p-3 font-semibold">Duration</th>
                <th className="p-3 font-semibold">Hourly Rate</th>
                <th className="p-3 font-semibold">Est. Amount</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {timesheets.map((ts) => {
                const hours = (ts.durationMinutes / 60).toFixed(1);
                const rate = ts.hourlyRate || 1000;
                const estAmount = Math.round((ts.durationMinutes / 60) * rate);

                return (
                  <tr key={ts.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-slate-600">{ts.date}</td>
                    <td className="p-3 font-bold text-slate-900">{ts.userName}</td>
                    <td className="p-3 text-indigo-700 font-medium">{ts.clientName}</td>
                    <td className="p-3 text-slate-800">{ts.taskTitle}</td>
                    <td className="p-3 font-mono text-emerald-700 font-bold">
                      {hours} hrs ({ts.durationMinutes}m)
                    </td>
                    <td className="p-3 font-mono text-slate-600">₹{rate}/hr</td>
                    <td className="p-3 font-mono text-slate-900 font-bold">
                      ₹{estAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ts.billedInvoiceId
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {ts.billedInvoiceId ? 'BILLED' : 'UNBILLED'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => deleteTimesheetEntry(ts.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg transition"
                        title="Delete timesheet entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
