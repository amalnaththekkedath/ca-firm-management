import React, { useState } from 'react';
import {
  Building2,
  Clock,
  Play,
  Square,
  Search,
  UserCheck,
  Bot,
  Bell,
  RefreshCw,
  LogOut,
  ChevronDown,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FIRM_DETAILS } from '../data/mockData';

export const Header: React.FC = () => {
  const {
    currentUser,
    attendance,
    activeStopwatch,
    stopStopwatch,
    setIsRoleModalOpen,
    setIsQuickSearchOpen,
    setActiveTab,
    resetDemoData,
    logout,
    firmDetails,
  } = useApp();

  const currentFirm = firmDetails || FIRM_DETAILS;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [stopwatchNote, setStopwatchNote] = useState('');
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const myAttendanceToday = attendance.find(
    (a) => a.userId === currentUser.id && a.date === todayStr
  );

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleStopTimerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopStopwatch(stopwatchNote || 'Completed task segment');
    setStopwatchNote('');
    setIsStopModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: CA Firm Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs font-bold text-lg">
            <Building2 className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-base">
                {currentFirm.name}
              </span>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                {currentFirm.frn}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {currentFirm.tagline}
            </p>
          </div>
        </div>

        {/* Center: Active Stopwatch Ticker or Clock-In Status */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          {activeStopwatch && activeStopwatch.isRunning ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-amber-600 font-mono text-sm font-semibold animate-pulse">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{formatTime(activeStopwatch.elapsedSeconds)}</span>
              </div>
              <div className="text-xs text-slate-700 max-w-[200px] truncate">
                <span className="font-semibold text-slate-900">{activeStopwatch.clientName}</span>: {activeStopwatch.taskTitle}
              </div>
              <button
                onClick={() => setIsStopModalOpen(true)}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium flex items-center gap-1 transition shadow-xs"
              >
                <Square className="w-3 h-3 fill-white" /> Stop & Log
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div
                className={`w-2 h-2 rounded-full ${
                  myAttendanceToday ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                }`}
              />
              <span>
                {myAttendanceToday ? (
                  <span className="text-emerald-700 font-semibold">
                    Clocked In ({myAttendanceToday.checkInTime}) - {myAttendanceToday.workMode}
                  </span>
                ) : (
                  <span className="text-slate-500">Not Clocked In Today</span>
                )}
              </span>
              <button
                onClick={() => setActiveTab('attendance')}
                className="text-xs text-indigo-600 font-medium hover:text-indigo-800 underline ml-1"
              >
                Manage
              </button>
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setIsQuickSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition border border-slate-200"
            title="Search Clients, Tasks, Invoices (Cmd + K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 bg-white text-[10px] text-slate-500 rounded border border-slate-300 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* AI Advisor Button */}
          <button
            onClick={() => setActiveTab('ai_advisor')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-xs transition"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden sm:inline">AI CA Advisor</span>
          </button>

          {/* Role Switcher Pill */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-md text-xs font-medium transition"
            title="Switch User Role"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold">{currentUser.role.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-indigo-600" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 transition"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-indigo-400"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl text-slate-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.designation}</p>
                  <p className="text-[11px] text-indigo-600 font-mono mt-0.5 font-medium">
                    {currentUser.email}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsRoleModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Switch User / Role
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      resetDemoData();
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-amber-700 font-medium"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                    Reset Demo State
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-rose-50 flex items-center gap-2 text-rose-600 border-t border-slate-100 mt-1 pt-2 font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    Logout Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stopwatch Stop Modal */}
      {isStopModalOpen && activeStopwatch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <Square className="w-4 h-4 fill-amber-400" /> Log Billable Time
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Stopping stopwatch for <span className="font-semibold text-white">{activeStopwatch.taskTitle}</span> ({activeStopwatch.clientName}).
            </p>

            <div className="mt-3 bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between font-mono text-sm">
              <span className="text-slate-400">Total Elapsed Time:</span>
              <span className="text-emerald-400 font-bold">
                {formatTime(activeStopwatch.elapsedSeconds)}
              </span>
            </div>

            <form onSubmit={handleStopTimerSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Work Summary / Timesheet Note
                </label>
                <textarea
                  value={stopwatchNote}
                  onChange={(e) => setStopwatchNote(e.target.value)}
                  placeholder="e.g. Reconciled 2B invoices, checked bank statements, drafted tax clauses..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500 h-20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStopModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow"
                >
                  Save Timesheet Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
