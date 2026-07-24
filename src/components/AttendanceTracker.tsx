import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Laptop,
  Building,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Send,
  ShieldCheck,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WorkMode, LeaveType } from '../types';

export const AttendanceTracker: React.FC = () => {
  const {
    currentUser,
    attendance,
    leaveRequests,
    clockIn,
    clockOut,
    applyLeave,
    approveLeave,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayRecord = attendance.find(
    (a) => a.userId === currentUser.id && a.date === todayStr
  );

  const isPartnerOrAdmin = currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'PARTNER';

  const displayAttendance = attendance.filter((rec) => {
    if (!isPartnerOrAdmin && rec.userId !== currentUser.id) {
      return false;
    }
    return true;
  });

  const displayLeaveRequests = leaveRequests.filter((lve) => {
    if (!isPartnerOrAdmin && lve.userId !== currentUser.id) {
      return false;
    }
    return true;
  });

  // Clock-in form state
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>('OFFICE');
  const [locationText, setLocationText] = useState('Suite 402, BKC Head Office, Mumbai');
  const [workSummaryInput, setWorkSummaryInput] = useState('');

  // Leave Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'clockin' | 'register' | 'leaves'>('clockin');

  const handleClockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clockIn(selectedWorkMode, locationText, workSummaryInput);
    setWorkSummaryInput('');
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    applyLeave({
      userId: currentUser.id,
      userName: currentUser.name,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason: leaveReason,
    });

    setLeaveReason('');
    setStartDate('');
    setEndDate('');
    setActiveSubTab('leaves');
  };

  return (
    <div className="p-6 space-y-6 text-slate-900">
      {/* Sub-Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" /> Attendance & Leave Register
          </h1>
          <p className="text-xs text-slate-500">
            Real-time GPS/IP geotagged attendance logging & CA Article study leave portal
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveSubTab('clockin')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === 'clockin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Clock-In
          </button>
          <button
            onClick={() => setActiveSubTab('register')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === 'register'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Staff Register
          </button>
          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === 'leaves'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Leave Portal
          </button>
        </div>
      </div>

      {/* SubTab 1: Clock-In / Clock-Out Section */}
      {activeSubTab === 'clockin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Status Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Today's Attendance Status
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    myTodayRecord
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {myTodayRecord ? `Clocked In (${myTodayRecord.status})` : 'Not Clocked In'}
                </span>
              </div>

              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">User:</span>
                  <span className="text-slate-900 font-bold">{currentUser.name} ({currentUser.role})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Check-In Time:</span>
                  <span className="text-emerald-700 font-mono font-bold">
                    {myTodayRecord?.checkInTime || '---'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Check-Out Time:</span>
                  <span className="text-amber-700 font-mono font-bold">
                    {myTodayRecord?.checkOutTime || 'Active Session'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Location Geotag:</span>
                  <span className="text-indigo-700 font-semibold">
                    {myTodayRecord?.location || locationText}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Verified IP Address:</span>
                  <span className="text-slate-700 font-mono">103.21.124.89</span>
                </div>
              </div>

              {myTodayRecord?.workSummary && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-600 font-semibold block mb-1">Log Summary:</span>
                  <p className="text-slate-800">{myTodayRecord.workSummary}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
              {myTodayRecord && !myTodayRecord.checkOutTime ? (
                <button
                  onClick={clockOut}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" /> Clock-Out for Today
                </button>
              ) : (
                <p className="text-xs text-slate-500 text-center w-full italic">
                  {myTodayRecord?.checkOutTime
                    ? 'You have completed clock-out for today.'
                    : 'Fill out the form on the right to mark your attendance.'}
                </p>
              )}
            </div>
          </div>

          {/* Clock-In Form Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Mark Today's Attendance
            </h3>

            <form onSubmit={handleClockInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Mode / Station Location
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkMode('OFFICE');
                      setLocationText('Suite 402, BKC Head Office, Mumbai');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition ${
                      selectedWorkMode === 'OFFICE'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Building className="w-4 h-4" /> Office
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkMode('ON_SITE');
                      setLocationText('Apex Tech Solutions (Client Audit Premises - Andheri)');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition ${
                      selectedWorkMode === 'ON_SITE'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <MapPin className="w-4 h-4" /> Client On-Site
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkMode('WFH');
                      setLocationText('Remote WFH Location');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition ${
                      selectedWorkMode === 'WFH'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Laptop className="w-4 h-4" /> WFH / Remote
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / Geotag Description
                </label>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Work Focus / Planned Client Filings
                </label>
                <textarea
                  value={workSummaryInput}
                  onChange={(e) => setWorkSummaryInput(e.target.value)}
                  placeholder="e.g., GSTR-3B July reconciliation for Apex Tech, Form 3CD Clause 21 review..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Geotag Clock-In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SubTab 2: Staff Attendance Register */}
      {activeSubTab === 'register' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" /> Firm Daily Attendance Register
            </h3>
            <span className="text-xs text-slate-500">Date: {todayStr}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-mono font-bold">
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                  <th className="p-3">Work Mode</th>
                  <th className="p-3">Location / Geotag</th>
                  <th className="p-3">Work Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-500 italic">
                      No attendance records found for your account.
                    </td>
                  </tr>
                ) : (
                  displayAttendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">{rec.userName}</td>
                      <td className="p-3">
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono font-medium">
                          {rec.userRole}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-emerald-700 font-semibold">{rec.checkInTime}</td>
                      <td className="p-3 font-mono text-amber-700 font-semibold">
                        {rec.checkOutTime || 'Active'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            rec.workMode === 'OFFICE'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : rec.workMode === 'ON_SITE'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {rec.workMode}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 max-w-[180px] truncate">{rec.location}</td>
                      <td className="p-3 text-slate-500 max-w-[220px] truncate">
                        {rec.workSummary || 'No log summary'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Leave Management Portal */}
      {activeSubTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Apply Leave Form */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Submit Leave Application
            </h3>

            <form onSubmit={handleLeaveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="EXAM_STUDY">CA Final / Inter Study Leave (Articles)</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="MATERNITY">Maternity / Special Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Leave
                </label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. ICAI CA Final Group 2 Exam prep, family event..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 h-20"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit to Partner / Manager
              </button>
            </form>
          </div>

          {/* Leave Queue & Approvals Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Leave Applications & Manager Approval Queue
              </h3>
              <span className="text-xs text-slate-500">
                {isPartnerOrAdmin
                  ? 'Partner & Admin Leave Review Access'
                  : 'Personal Applications History'}
              </span>
            </div>

            <div className="space-y-3">
              {displayLeaveRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-50 rounded-xl border border-slate-200">
                  No leave requests found.
                </div>
              ) : (
                displayLeaveRequests.map((lve) => (
                  <div
                    key={lve.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{lve.userName}</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded font-mono font-medium">
                          {lve.leaveType.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            lve.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : lve.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                          }`}
                        >
                          {lve.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 mt-1">
                        Dates: <span className="font-mono text-indigo-700 font-semibold">{lve.startDate}</span> to{' '}
                        <span className="font-mono text-indigo-700 font-semibold">{lve.endDate}</span> ({lve.totalDays} Days)
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 italic">"{lve.reason}"</p>

                      {lve.approvedBy && (
                        <p className="text-[10px] text-emerald-700 mt-1 font-mono font-medium">
                          Reviewed by: {lve.approvedBy}
                        </p>
                      )}
                    </div>

                    {isPartnerOrAdmin && lve.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => approveLeave(lve.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => approveLeave(lve.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
