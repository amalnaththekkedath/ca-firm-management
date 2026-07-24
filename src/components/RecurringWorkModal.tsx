import React, { useState, useEffect } from 'react';
import {
  X,
  Repeat,
  Plus,
  Calendar,
  Clock,
  CheckSquare,
  Users,
  Building,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Sparkles,
  Search,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  RecurringWorkTemplate,
  TaskCategory,
  TaskPriority,
  EntityType,
  RecurringFrequency,
} from '../types';

interface RecurringWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecurringWorkModal: React.FC<RecurringWorkModalProps> = ({ isOpen, onClose }) => {
  const {
    clients,
    users,
    currentUser,
    recurringTemplates,
    addBatchTasks,
    addRecurringTemplate,
  } = useApp();

  // Mode: 'GENERATE' or 'CREATE_TEMPLATE'
  const [activeTab, setActiveTab] = useState<'GENERATE' | 'CREATE_TEMPLATE'>('GENERATE');

  // Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    recurringTemplates[0]?.id || ''
  );

  // Customization fields for generation
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('GST');
  const [frequency, setFrequency] = useState<RecurringFrequency>('MONTHLY');
  const [periodName, setPeriodName] = useState('July 2026');
  const [dueDate, setDueDate] = useState('2026-08-20');
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [estimatedHours, setEstimatedHours] = useState<number>(6);
  const [fixedFee, setFixedFee] = useState<number>(5000);
  const [assignedToUserId, setAssignedToUserId] = useState<string>('');
  const [checkerUserId, setCheckerUserId] = useState<string>('');
  const [approverUserId, setApproverUserId] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Client Selection State
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [clientSearch, setClientSearch] = useState('');

  // Template Creation State
  const [newTmplTitle, setNewTmplTitle] = useState('');
  const [newTmplCategory, setNewTmplCategory] = useState<TaskCategory>('GST');
  const [newTmplFreq, setNewTmplFreq] = useState<RecurringFrequency>('MONTHLY');
  const [newTmplDueDateDay, setNewTmplDueDateDay] = useState<number>(20);
  const [newTmplPriority, setNewTmplPriority] = useState<TaskPriority>('HIGH');
  const [newTmplEstHours, setNewTmplEstHours] = useState<number>(5);
  const [newTmplFee, setNewTmplFee] = useState<number>(5000);
  const [newTmplDesc, setNewTmplDesc] = useState('');

  // Success message state
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize defaults from selected template
  useEffect(() => {
    const tmpl = recurringTemplates.find((t) => t.id === selectedTemplateId);
    if (tmpl) {
      setTitle(tmpl.title);
      setCategory(tmpl.category);
      setFrequency(tmpl.frequency);
      setPriority(tmpl.priority);
      setEstimatedHours(tmpl.estimatedHours);
      setFixedFee(tmpl.fixedFee);
      setNotes(tmpl.description || '');

      // Set default assignees if available or pick default staff
      setAssignedToUserId(
        tmpl.defaultAssignedToUserId ||
          users.find((u) => u.role === 'ARTICLE_ASSISTANT' || u.role === 'AUDIT_SENIOR')?.id ||
          users[2]?.id ||
          users[0]?.id
      );
      setCheckerUserId(
        tmpl.defaultCheckerUserId ||
          users.find((u) => u.role === 'AUDIT_MANAGER' || u.role === 'SENIOR_MANAGER')?.id ||
          users[1]?.id ||
          users[0]?.id
      );
      setApproverUserId(
        tmpl.defaultApproverUserId ||
          users.find((u) => u.role === 'PARTNER' || u.role === 'ADMINISTRATOR')?.id ||
          users[0]?.id
      );

      // Pre-select applicable clients based on entity types or GSTIN
      let applicable = clients.filter((c) => c.status === 'ACTIVE');
      if (tmpl.applicableEntityTypes && tmpl.applicableEntityTypes.length > 0) {
        applicable = applicable.filter((c) => tmpl.applicableEntityTypes?.includes(c.entityType));
      }
      if (tmpl.category === 'GST') {
        applicable = applicable.filter((c) => c.gstin && c.gstin.trim() !== '');
      }
      setSelectedClientIds(applicable.map((c) => c.id));
    }
  }, [selectedTemplateId, recurringTemplates, clients, users]);

  if (!isOpen) return null;

  // Client list filtering
  const filteredClients = clients.filter((c) => {
    if (c.status !== 'ACTIVE') return false;
    const matchesEntity = entityFilter === 'ALL' || c.entityType === entityFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.gstin.toLowerCase().includes(clientSearch.toLowerCase());
    return matchesEntity && matchesSearch;
  });

  // Client Selection Handlers
  const handleSelectAllFiltered = () => {
    const ids = filteredClients.map((c) => c.id);
    setSelectedClientIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAll = () => {
    setSelectedClientIds([]);
  };

  const handleSelectGstClients = () => {
    const ids = clients.filter((c) => c.status === 'ACTIVE' && c.gstin && c.gstin.trim() !== '').map((c) => c.id);
    setSelectedClientIds(ids);
  };

  const handleSelectCorporateClients = () => {
    const ids = clients
      .filter((c) => c.status === 'ACTIVE' && (c.entityType === 'PVT_LTD' || c.entityType === 'LLP'))
      .map((c) => c.id);
    setSelectedClientIds(ids);
  };

  const toggleClient = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  // Generate Batch Tasks Submission
  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClientIds.length === 0) {
      alert('Please select at least one client to generate repetitive tasks for.');
      return;
    }

    const assignee = users.find((u) => u.id === assignedToUserId);
    const checker = users.find((u) => u.id === checkerUserId);
    const approver = users.find((u) => u.id === approverUserId);

    const fullTaskTitle = periodName ? `${title} (${periodName})` : title;

    const taskBatch = selectedClientIds.map((cId) => {
      const client = clients.find((c) => c.id === cId);
      return {
        clientId: cId,
        clientName: client?.name || 'Client',
        clientGstin: client?.gstin || '',
        title: fullTaskTitle,
        category,
        dueDate,
        priority,
        status: 'PENDING_DOCS' as const,
        assignedToUserId: assignee?.id || users[0].id,
        assignedToName: assignee?.name || users[0].name,
        assignedByUserId: currentUser?.id,
        assignedByName: currentUser?.name,
        checkerUserId: checker?.id || users[0].id,
        checkerName: checker?.name || users[0].name,
        approverUserId: approver?.id || users[0].id,
        approverName: approver?.name || users[0].name,
        estimatedHours,
        billableHours: 0,
        fixedFee,
        hourlyRate: assignee?.hourlyRate || 1000,
        notes: notes || `Repetitive compliance work generated for ${periodName || 'current period'}.`,
        remarksHistory: [
          {
            id: `rem-gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            authorId: currentUser?.id || 'usr-1',
            authorName: currentUser?.name || 'System',
            authorRole: currentUser?.role || 'PARTNER',
            text: `Batch generated repetitive work: ${fullTaskTitle}. Statutory Due Date: ${dueDate}.`,
            timestamp:
              new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
              ' ' +
              new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            action: 'ASSIGNED' as const,
          },
        ],
      };
    });

    addBatchTasks(taskBatch);
    setSuccessMsg(
      `Successfully generated ${taskBatch.length} repetitive task(s) for "${fullTaskTitle}" with due date ${dueDate}!`
    );

    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 2000);
  };

  // Create New Template Submission
  const handleCreateTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTmplTitle.trim()) return;

    addRecurringTemplate({
      title: newTmplTitle.trim(),
      category: newTmplCategory,
      frequency: newTmplFreq,
      defaultDueDateDay: newTmplDueDateDay,
      priority: newTmplPriority,
      estimatedHours: Number(newTmplEstHours),
      fixedFee: Number(newTmplFee),
      description: newTmplDesc.trim(),
    });

    setSuccessMsg(`New repetitive work template "${newTmplTitle}" created successfully!`);
    setNewTmplTitle('');
    setNewTmplDesc('');

    setTimeout(() => {
      setSuccessMsg(null);
      setActiveTab('GENERATE');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Repetitive Work & Recurring Compliance
              </h2>
              <p className="text-xs text-slate-500">
                Bulk create statutory filing jobs (GST, TDS, IT, MCA) with custom client assignment & due dates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-3 gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('GENERATE')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'GENERATE'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Batch Task Generator
          </button>

          <button
            onClick={() => setActiveTab('CREATE_TEMPLATE')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'CREATE_TEMPLATE'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" /> Manage / Add Work Templates
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {activeTab === 'GENERATE' ? (
            <form onSubmit={handleGenerateSubmit} className="space-y-6">
              {/* STEP 1: Select Work Template & Period */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    Select Repetitive Work & Customize Period
                  </h3>
                  <span className="text-[11px] text-indigo-600 font-semibold">
                    {recurringTemplates.length} Pre-configured Templates
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Preset Template */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Choose Standard Work Template
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium shadow-2xs"
                    >
                      {recurringTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.category} • {t.frequency})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Period Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Filing Period / Cycle Name
                    </label>
                    <input
                      type="text"
                      value={periodName}
                      onChange={(e) => setPeriodName(e.target.value)}
                      placeholder="e.g. July 2026, Q2 FY 2026-27"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Work Details Grid */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Work Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TaskCategory)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="GST">GST Compliance</option>
                        <option value="INCOME_TAX">Income Tax & TDS</option>
                        <option value="STATUTORY_AUDIT">Statutory Audit</option>
                        <option value="TAX_AUDIT">Tax Audit</option>
                        <option value="MCA_ROC">MCA / ROC Filing</option>
                        <option value="BOOKKEEPING">Bookkeeping & Payroll</option>
                        <option value="ADVISORY">Advisory & Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-amber-800 mb-1 font-bold">
                        Statutory Due Date
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-amber-50/50 border border-amber-300 rounded-lg p-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="URGENT">Urgent</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Est. Hours / Client</label>
                      <input
                        type="number"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Fixed Fee (₹ / Client)</label>
                      <input
                        type="number"
                        value={fixedFee}
                        onChange={(e) => setFixedFee(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Assignee Staff</label>
                      <select
                        value={assignedToUserId}
                        onChange={(e) => setAssignedToUserId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Client Selection */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                    Select Applicable Clients ({selectedClientIds.length} Selected)
                  </h3>

                  {/* Preset Shortcuts */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md font-medium shadow-2xs"
                    >
                      Select All Filtered
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectGstClients}
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-md font-medium"
                    >
                      GST Clients
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectCorporateClients}
                      className="px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-md font-medium"
                    >
                      Companies (Pvt Ltd/LLP)
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-md font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Filters Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search client name, code, or GSTIN..."
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <select
                      value={entityFilter}
                      onChange={(e) => setEntityFilter(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    >
                      <option value="ALL">All Entity Types</option>
                      <option value="PVT_LTD">Private Limited</option>
                      <option value="LLP">LLP</option>
                      <option value="PARTNERSHIP">Partnership</option>
                      <option value="PROPRIETORSHIP">Proprietorship</option>
                      <option value="INDIVIDUAL">Individual Assessee</option>
                    </select>
                  </div>
                </div>

                {/* Client Checkbox Grid */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 max-h-56 overflow-y-auto divide-y divide-slate-100 space-y-1 shadow-2xs">
                  {filteredClients.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No active clients match the current search or entity filter.
                    </div>
                  ) : (
                    filteredClients.map((client) => {
                      const isChecked = selectedClientIds.includes(client.id);
                      return (
                        <div
                          key={client.id}
                          onClick={() => toggleClient(client.id)}
                          className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                            isChecked
                              ? 'bg-indigo-50/70 border border-indigo-200 text-slate-900'
                              : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Handled by parent div
                              className="w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{client.name}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                  {client.code}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5 font-mono">
                                {client.gstin && <span>GST: {client.gstin}</span>}
                                <span>PAN: {client.pan}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold block">
                              {client.entityType}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                              Retainer: ₹{client.retainerFee.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Summary & Submit Action */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                <div>
                  <div className="text-xs text-slate-700">
                    Generating <strong className="text-indigo-600">{selectedClientIds.length} task(s)</strong> for{' '}
                    <strong className="text-slate-900">{periodName ? `${title} (${periodName})` : title}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3 font-mono">
                    <span>Due Date: {dueDate}</span>
                    <span>Total Hrs: {selectedClientIds.length * estimatedHours} hrs</span>
                    <span>Total Value: ₹{(selectedClientIds.length * fixedFee).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={selectedClientIds.length === 0}
                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate {selectedClientIds.length} Task(s) Now
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* CREATE CUSTOM WORK TEMPLATE TAB */
            <form onSubmit={handleCreateTemplateSubmit} className="space-y-4 text-xs">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" /> Create New Standard Repetitive Work Template
                </h3>
                <p className="text-slate-500 text-xs">
                  Define custom recurring compliance or monthly services for your CA firm so staff can generate them in 1 click.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Work Title / Service Name</label>
                    <input
                      type="text"
                      value={newTmplTitle}
                      onChange={(e) => setNewTmplTitle(e.target.value)}
                      placeholder="e.g. Monthly GST Filing (GSTR-1 & 3B)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={newTmplCategory}
                      onChange={(e) => setNewTmplCategory(e.target.value as TaskCategory)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="GST">GST Compliance</option>
                      <option value="INCOME_TAX">Income Tax & TDS</option>
                      <option value="STATUTORY_AUDIT">Statutory Audit</option>
                      <option value="TAX_AUDIT">Tax Audit</option>
                      <option value="MCA_ROC">MCA / ROC Filing</option>
                      <option value="BOOKKEEPING">Bookkeeping & Payroll</option>
                      <option value="ADVISORY">Advisory Services</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Frequency</label>
                    <select
                      value={newTmplFreq}
                      onChange={(e) => setNewTmplFreq(e.target.value as RecurringFrequency)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="HALF_YEARLY">Half-Yearly</option>
                      <option value="ANNUAL">Annual</option>
                      <option value="ONE_TIME">One-Time Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Default Priority</label>
                    <select
                      value={newTmplPriority}
                      onChange={(e) => setNewTmplPriority(e.target.value as TaskPriority)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="URGENT">Urgent</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Est. Hours</label>
                    <input
                      type="number"
                      value={newTmplEstHours}
                      onChange={(e) => setNewTmplEstHours(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Default Fixed Fee (₹)</label>
                    <input
                      type="number"
                      value={newTmplFee}
                      onChange={(e) => setNewTmplFee(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Standard Working Instructions / Notes
                  </label>
                  <textarea
                    value={newTmplDesc}
                    onChange={(e) => setNewTmplDesc(e.target.value)}
                    placeholder="Enter standard operating instructions, required documents checklist, or filing guidelines..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 h-20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    Save Template
                  </button>
                </div>
              </div>

              {/* List Existing Custom Templates */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                  Existing Firm Templates
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recurringTemplates.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{t.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {t.description || 'Standard CA Firm Compliance Procedure'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono">
                          {t.category} • {t.frequency}
                        </span>
                        <div className="text-[11px] font-mono text-indigo-700 font-semibold mt-0.5">
                          ₹{t.fixedFee.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
