import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  Play,
  UserCheck,
  Calendar,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  FileCheck,
  RotateCcw,
  Send,
  MessageSquare,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Repeat,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskCategory, TaskPriority, TaskStatus, User } from '../types';
import { RecurringWorkModal } from './RecurringWorkModal';

export const TaskBoard: React.FC = () => {
  const {
    tasks,
    clients,
    users,
    currentUser,
    addTask,
    updateTaskStatus,
    submitTaskForChecking,
    sendTaskBackForCorrection,
    submitTaskForFinalApproval,
    approveTaskFinal,
    startStopwatch,
    activeStopwatch,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

  // Workflow Action Modals state
  const [activeWorkflowTask, setActiveWorkflowTask] = useState<Task | null>(null);
  const [workflowActionType, setWorkflowActionType] = useState<
    'SUBMIT_CHECK' | 'CORRECTION' | 'FINAL_APPROVAL' | 'APPROVE' | 'VIEW_REMARKS' | null
  >(null);

  const [targetUserId, setTargetUserId] = useState<string>('');
  const [workflowRemarks, setWorkflowRemarks] = useState<string>('');

  const isPartnerOrAdmin =
    currentUser?.role === 'ADMINISTRATOR' || currentUser?.role === 'PARTNER';

  const canAssignWork =
    isPartnerOrAdmin ||
    currentUser?.role === 'AUDIT_MANAGER' ||
    currentUser?.role === 'SENIOR_MANAGER' ||
    currentUser?.role === 'AUDIT_SENIOR';

  // New Task Form
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('GST');
  const [dueDate, setDueDate] = useState('2026-08-20');
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [assignedToUserId, setAssignedToUserId] = useState(users[2]?.id || users[0]?.id);
  const [checkerUserId, setCheckerUserId] = useState(
    users.find((u) => u.role === 'AUDIT_SENIOR' || u.role === 'AUDIT_MANAGER')?.id || users[1]?.id || users[0]?.id
  );
  const [approverUserId, setApproverUserId] = useState(
    users.find((u) => u.role === 'PARTNER' || u.role === 'ADMINISTRATOR')?.id || users[0]?.id
  );
  const [estimatedHours, setEstimatedHours] = useState<number>(10);
  const [fixedFee, setFixedFee] = useState<number>(15000);

  const statusColumns: { key: TaskStatus; label: string; color: string }[] = [
    {
      key: 'PENDING_DOCS',
      label: 'Pending Docs',
      color: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    {
      key: 'IN_PROGRESS',
      label: 'In Progress',
      color: 'border-blue-200 bg-blue-50 text-blue-800',
    },
    {
      key: 'SUBMITTED_FOR_CHECKING',
      label: 'For Checking',
      color: 'border-purple-200 bg-purple-50 text-purple-800',
    },
    {
      key: 'NEEDS_CORRECTION',
      label: 'Needs Correction',
      color: 'border-red-200 bg-red-50 text-red-800',
    },
    {
      key: 'SUBMITTED_FOR_FINAL_APPROVAL',
      label: 'For Partner Approval',
      color: 'border-pink-200 bg-pink-50 text-pink-800',
    },
    {
      key: 'FILED_COMPLETED',
      label: 'Filed & Approved',
      color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
  ];

  const filteredTasks = tasks.filter((t) => {
    // Non-partners / non-admins / non-seniors can ONLY see work assigned to them or assigned by them
    if (
      !isPartnerOrAdmin &&
      t.assignedToUserId !== currentUser?.id &&
      t.assignedByUserId !== currentUser?.id &&
      t.checkerUserId !== currentUser?.id &&
      t.approverUserId !== currentUser?.id
    ) {
      return false;
    }

    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === clientId);
    const assignee = users.find((u) => u.id === assignedToUserId);
    const checker = users.find((u) => u.id === checkerUserId);
    const approver = users.find((u) => u.id === approverUserId);

    if (!client || !assignee || !currentUser) return;

    addTask({
      clientId: client.id,
      clientName: client.name,
      clientGstin: client.gstin,
      title,
      category,
      dueDate,
      priority,
      status: 'PENDING_DOCS',
      assignedToUserId: assignee.id,
      assignedToName: assignee.name,
      assignedByUserId: currentUser.id,
      assignedByName: currentUser.name,
      checkerUserId: checker?.id || checkerUserId,
      checkerName: checker?.name || 'Assigned Checker',
      approverUserId: approver?.id || approverUserId,
      approverName: approver?.name || 'Senior Partner',
      estimatedHours: Number(estimatedHours),
      billableHours: 0,
      fixedFee: Number(fixedFee),
      hourlyRate: assignee.hourlyRate,
      notes: 'Job assigned.',
    });

    setIsAddTaskModalOpen(false);
    setTitle('');
  };

  const openWorkflowModal = (
    task: Task,
    type: 'SUBMIT_CHECK' | 'CORRECTION' | 'FINAL_APPROVAL' | 'APPROVE' | 'VIEW_REMARKS'
  ) => {
    setActiveWorkflowTask(task);
    setWorkflowActionType(type);
    setWorkflowRemarks('');

    // Preselect target user if applicable
    if (type === 'SUBMIT_CHECK') {
      const defaultChecker =
        users.find((u) => u.role === 'AUDIT_SENIOR' || u.role === 'AUDIT_MANAGER') || users[0];
      setTargetUserId(defaultChecker?.id || '');
    } else if (type === 'FINAL_APPROVAL') {
      const defaultPartner = users.find((u) => u.role === 'PARTNER') || users[0];
      setTargetUserId(defaultPartner?.id || '');
    }
  };

  const handleWorkflowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkflowTask) return;

    if (workflowActionType === 'SUBMIT_CHECK') {
      submitTaskForChecking(activeWorkflowTask.id, targetUserId, workflowRemarks);
    } else if (workflowActionType === 'CORRECTION') {
      sendTaskBackForCorrection(activeWorkflowTask.id, workflowRemarks);
    } else if (workflowActionType === 'FINAL_APPROVAL') {
      submitTaskForFinalApproval(activeWorkflowTask.id, targetUserId, workflowRemarks);
    } else if (workflowActionType === 'APPROVE') {
      approveTaskFinal(activeWorkflowTask.id, workflowRemarks);
    }

    setActiveWorkflowTask(null);
    setWorkflowActionType(null);
    setWorkflowRemarks('');
  };

  const getStatusBadge = (status: TaskStatus) => {
    const col = statusColumns.find((c) => c.key === status);
    return col ? col.color : 'bg-slate-800 text-slate-300';
  };

  return (
    <div className="p-6 space-y-6 text-slate-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" /> Compliance & Audit Task Board
          </h1>
          <p className="text-xs text-slate-500">
            Multi-stage work assignment, checking review, correction remarks, & partner approval workflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List View
            </button>
          </div>

          {canAssignWork ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRecurringModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
              >
                <Repeat className="w-4 h-4 text-indigo-600" /> Repetitive Work Generator
              </button>
              <button
                onClick={() => setIsAddTaskModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Assign Work & Create Job
              </button>
            </div>
          ) : (
            <span className="text-[11px] bg-slate-100 text-indigo-700 border border-slate-200 px-3 py-1.5 rounded-xl font-mono font-medium shrink-0">
              Assigned Tasks View ({filteredTasks.length})
            </span>
          )}
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks, clients, codes..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Service Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'GST', 'INCOME_TAX', 'STATUTORY_AUDIT', 'TAX_AUDIT', 'MCA_ROC'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {statusColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);

            return (
              <div
                key={col.key}
                className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3 flex flex-col min-w-[240px]"
              >
                {/* Column Title Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {colTasks.map((task) => {
                    const isTimerRunning = activeStopwatch?.taskId === task.id;
                    const remarksCount = task.remarksHistory?.length || 0;

                    return (
                      <div
                        key={task.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-mono">
                            {task.code}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              task.priority === 'URGENT'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
                            {task.clientName}
                          </p>
                        </div>

                        <div className="text-[10px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono">
                          <div>
                            Assignee: <strong className="text-slate-900">{task.assignedToName}</strong>
                          </div>
                          {task.checkerName && (
                            <div>
                              Checker: <strong className="text-indigo-700">{task.checkerName}</strong>
                            </div>
                          )}
                          <div>
                            Due: <span className="text-amber-700 font-bold">{task.dueDate}</span>
                          </div>
                        </div>

                        {/* Workflow Action Buttons */}
                        <div className="pt-2 border-t border-slate-200 flex flex-col gap-1.5">
                          {(() => {
                            const isAssignee = currentUser?.id === task.assignedToUserId;
                            const isChecker =
                              currentUser?.id === task.checkerUserId ||
                              (canAssignWork && !isAssignee);
                            const isApprover =
                              (currentUser?.id === task.approverUserId || isPartnerOrAdmin) &&
                              !isAssignee;

                            return (
                              <>
                                {/* Case 1: In Progress / Needs Correction -> Submit for Checking */}
                                {(task.status === 'IN_PROGRESS' ||
                                  task.status === 'NEEDS_CORRECTION' ||
                                  task.status === 'PENDING_DOCS') && (
                                  <button
                                    onClick={() => openWorkflowModal(task, 'SUBMIT_CHECK')}
                                    className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                                  >
                                    <Send className="w-3 h-3" /> Submit for Checking
                                  </button>
                                )}

                                {/* Case 2: Submitted for Checking */}
                                {task.status === 'SUBMITTED_FOR_CHECKING' && (
                                  isAssignee ? (
                                    <div className="py-1 px-2 bg-purple-50 text-purple-800 border border-purple-200 rounded text-[10px] font-medium text-center italic">
                                      Awaiting Checking ({task.checkerName || 'Checker'})
                                    </div>
                                  ) : isChecker ? (
                                    <div className="grid grid-cols-2 gap-1">
                                      <button
                                        onClick={() => openWorkflowModal(task, 'CORRECTION')}
                                        className="py-1 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
                                      >
                                        <RotateCcw className="w-3 h-3" /> Correct
                                      </button>
                                      <button
                                        onClick={() => openWorkflowModal(task, 'FINAL_APPROVAL')}
                                        className="py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
                                      >
                                        <ChevronRight className="w-3 h-3" /> Forward
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="py-1 px-2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] text-center font-mono">
                                      Pending Checking
                                    </div>
                                  )
                                )}

                                {/* Case 3: Submitted for Final Approval */}
                                {task.status === 'SUBMITTED_FOR_FINAL_APPROVAL' && (
                                  isAssignee ? (
                                    <div className="py-1 px-2 bg-pink-50 text-pink-800 border border-pink-200 rounded text-[10px] font-medium text-center italic">
                                      Awaiting Approval ({task.approverName || 'Partner'})
                                    </div>
                                  ) : isApprover ? (
                                    <div className="grid grid-cols-2 gap-1">
                                      <button
                                        onClick={() => openWorkflowModal(task, 'CORRECTION')}
                                        className="py-1 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
                                      >
                                        <RotateCcw className="w-3 h-3" /> Correct
                                      </button>
                                      <button
                                        onClick={() => openWorkflowModal(task, 'APPROVE')}
                                        className="py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                                      >
                                        <ShieldCheck className="w-3 h-3" /> Approve
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="py-1 px-2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] text-center font-mono">
                                      Pending Approval
                                    </div>
                                  )
                                )}
                              </>
                            );
                          })()}

                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => startStopwatch(task.id)}
                              disabled={isTimerRunning}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition ${
                                isTimerRunning
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <Play className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                              {isTimerRunning ? 'Timing...' : 'Timer'}
                            </button>

                            <button
                              onClick={() => openWorkflowModal(task, 'VIEW_REMARKS')}
                              className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-mono"
                            >
                              <MessageSquare className="w-3 h-3 text-indigo-600" />
                              <span>History ({remarksCount})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-mono font-bold">
                <tr>
                  <th className="p-3">Task Code</th>
                  <th className="p-3">Client Entity</th>
                  <th className="p-3">Service Scope</th>
                  <th className="p-3">Assignee</th>
                  <th className="p-3">Checker</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Workflow Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-indigo-700">{t.code}</td>
                    <td className="p-3 font-medium text-slate-900">{t.clientName}</td>
                    <td className="p-3 font-semibold text-slate-800">{t.title}</td>
                    <td className="p-3 text-slate-700">{t.assignedToName}</td>
                    <td className="p-3 text-indigo-700">{t.checkerName || '—'}</td>
                    <td className="p-3 text-amber-700 font-bold">{t.dueDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(t.status)}`}>
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openWorkflowModal(t, 'VIEW_REMARKS')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-sans font-bold flex items-center gap-1 ml-auto border border-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" /> View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full text-slate-900 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" /> Create & Assign Work Job
              </h2>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Client Entity
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.gstin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title / Service Scope
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. GSTR-3B Monthly Filing or Form 3CD Tax Audit"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Compliance Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GST">GST Return</option>
                    <option value="INCOME_TAX">Income Tax ITR</option>
                    <option value="STATUTORY_AUDIT">Statutory Audit</option>
                    <option value="TAX_AUDIT">Tax Audit u/s 44AB</option>
                    <option value="MCA_ROC">MCA ROC Filing</option>
                    <option value="ADVISORY">Advisory & Certification</option>
                  </select>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-indigo-800 mb-1">
                    Assigned To (Worker)
                  </label>
                  <select
                    value={assignedToUserId}
                    onChange={(e) => setAssignedToUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-800 mb-1">
                    Who Checks Work (Checker)
                  </label>
                  <select
                    value={checkerUserId}
                    onChange={(e) => setCheckerUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-800 mb-1">
                    Who Approves Work (Partner)
                  </label>
                  <select
                    value={approverUserId}
                    onChange={(e) => setApproverUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {users
                      .filter((u) => u.role === 'PARTNER' || u.role === 'ADMINISTRATOR' || u.role === 'SENIOR_MANAGER')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role.replace('_', ' ')})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Statutory Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fixed Professional Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={fixedFee}
                    onChange={(e) => setFixedFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Assign & Create Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow Action / Remarks Modal */}
      {activeWorkflowTask && workflowActionType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full text-slate-900 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                {workflowActionType === 'SUBMIT_CHECK' && 'Submit Work for Checking'}
                {workflowActionType === 'CORRECTION' && 'Send Back for Correction'}
                {workflowActionType === 'FINAL_APPROVAL' && 'Submit for Partner Final Approval'}
                {workflowActionType === 'APPROVE' && 'Final Sign-off & Grant Approval'}
                {workflowActionType === 'VIEW_REMARKS' && 'Task Workflow History & Remarks Log'}
              </h2>
              <button
                onClick={() => {
                  setActiveWorkflowTask(null);
                  setWorkflowActionType(null);
                }}
                className="p-1 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {workflowActionType === 'VIEW_REMARKS' ? (
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900">{activeWorkflowTask.title}</p>
                  <p className="text-slate-500">Client: {activeWorkflowTask.clientName}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Remarks Audit Trail
                  </h3>

                  {(!activeWorkflowTask.remarksHistory || activeWorkflowTask.remarksHistory.length === 0) ? (
                    <p className="text-xs text-slate-500 italic">No remarks recorded yet for this task.</p>
                  ) : (
                    activeWorkflowTask.remarksHistory.map((rem) => (
                      <div
                        key={rem.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-indigo-700">{rem.authorName} ({rem.authorRole})</span>
                          <span className="text-slate-500 font-mono">{rem.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-800">{rem.text}</p>
                        <div className="pt-1">
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono uppercase">
                            {rem.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleWorkflowSubmit} className="p-6 space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900">{activeWorkflowTask.title}</p>
                  <p className="text-slate-500">Client: {activeWorkflowTask.clientName}</p>
                </div>

                {/* Select Checker if SUBMIT_CHECK */}
                {workflowActionType === 'SUBMIT_CHECK' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Checker (Senior Auditor / Audit Manager)
                    </label>
                    <select
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      {users
                        .filter((u) => u.id !== currentUser?.id)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Select Approver if FINAL_APPROVAL */}
                {workflowActionType === 'FINAL_APPROVAL' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Partner for Final Approval
                    </label>
                    <select
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      {users
                        .filter((u) => u.role === 'PARTNER' || u.role === 'ADMINISTRATOR')
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Remarks / Audit Notes
                  </label>
                  <textarea
                    value={workflowRemarks}
                    onChange={(e) => setWorkflowRemarks(e.target.value)}
                    rows={3}
                    placeholder={
                      workflowActionType === 'CORRECTION'
                        ? 'Explain what corrections/rectifications are required...'
                        : 'Add review comments or completion remarks...'
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required={workflowActionType === 'CORRECTION'}
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWorkflowTask(null);
                      setWorkflowActionType(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-xs ${
                      workflowActionType === 'CORRECTION'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    Submit Workflow Action
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Repetitive Work & Recurring Compliance Modal */}
      <RecurringWorkModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
      />
    </div>
  );
};
