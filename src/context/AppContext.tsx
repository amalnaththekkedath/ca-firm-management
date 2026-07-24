import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Client,
  Task,
  TaskStatus,
  TaskRemark,
  AttendanceRecord,
  WorkMode,
  LeaveRequest,
  TimesheetEntry,
  Invoice,
  InvoiceStatus,
  ComplianceDeadline,
  ActiveStopwatch,
  FirmDetails,
  Notice,
  NoticeCategory,
  NoticePriority,
  InternalMessage,
  MessageChannel,
  RecurringWorkTemplate,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_TASKS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_TIMESHEETS,
  INITIAL_INVOICES,
  INITIAL_COMPLIANCE_DEADLINES,
  FIRM_DETAILS,
  INITIAL_NOTICES,
  INITIAL_MESSAGES,
  INITIAL_RECURRING_WORK_TEMPLATES,
} from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  tasks: Task[];
  recurringTemplates: RecurringWorkTemplate[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  timesheets: TimesheetEntry[];
  invoices: Invoice[];
  complianceDeadlines: ComplianceDeadline[];
  activeStopwatch: ActiveStopwatch | null;
  firmDetails: FirmDetails;
  notices: Notice[];
  internalMessages: InternalMessage[];
  activeTab: string;
  searchQuery: string;
  isRoleModalOpen: boolean;
  isQuickSearchOpen: boolean;
  isAuthenticated: boolean;
  failedAttempts: Record<string, number>;
  lockoutUntil: Record<string, number>;

  // Auth Actions
  login: (
    username: string,
    password: string,
    rememberMe?: boolean
  ) => {
    success: boolean;
    error?: string;
    requiresPasswordChange?: boolean;
    isLockedOut?: boolean;
    lockoutSeconds?: number;
    user?: User;
  };
  logout: () => void;
  changePassword: (
    userId: string,
    newPassword: string
  ) => { success: boolean; error?: string };
  switchUser: (userId: string) => void;

  // Actions
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setIsRoleModalOpen: (open: boolean) => void;
  setIsQuickSearchOpen: (open: boolean) => void;

  // Firm Details
  updateFirmDetails: (details: FirmDetails) => void;

  // Backup & Restore
  exportFullBackup: () => void;
  restoreFullBackup: (jsonString: string) => { success: boolean; error?: string };

  // Notice Board
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt' | 'authorName'>) => void;
  deleteNotice: (id: string) => void;
  togglePinNotice: (id: string) => void;

  // Internal Messaging Board (1-on-1 direct user messaging)
  sendInternalMessage: (recipientId: string, text: string) => void;

  // Clients
  addClient: (client: Omit<Client, 'id' | 'code'>) => void;
  importClientsBatch: (newClients: Omit<Client, 'id' | 'code'>[]) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;

  // Tasks & Multi-stage Review Workflow
  addTask: (task: Omit<Task, 'id' | 'code' | 'lastUpdated'>) => void;
  addBatchTasks: (tasksList: Omit<Task, 'id' | 'code' | 'lastUpdated'>[]) => void;
  addRecurringTemplate: (template: Omit<RecurringWorkTemplate, 'id'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (task: Task) => void;
  submitTaskForChecking: (taskId: string, checkerUserId: string, remarks: string) => void;
  sendTaskBackForCorrection: (taskId: string, remarks: string) => void;
  submitTaskForFinalApproval: (taskId: string, approverUserId: string, remarks: string) => void;
  approveTaskFinal: (taskId: string, remarks?: string) => void;

  // Attendance & Leaves
  clockIn: (workMode: WorkMode, location: string, workSummary?: string) => void;
  clockOut: () => void;
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => void;
  approveLeave: (leaveId: string, status: 'APPROVED' | 'REJECTED') => void;

  // Timesheets & Stopwatch
  startStopwatch: (taskId: string) => void;
  stopStopwatch: (description: string) => void;
  addTimesheetEntry: (entry: Omit<TimesheetEntry, 'id'>) => void;
  deleteTimesheetEntry: (id: string) => void;

  // Invoicing
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoiceStatus: (
    invoiceId: string,
    status: InvoiceStatus,
    paymentRef?: string
  ) => void;
  sendPaymentReminder: (invoiceId: string) => void;

  // Employees / Users Management
  addUser: (user: Omit<User, 'id'>) => { success: boolean; error?: string; user?: User };
  deleteUser: (userId: string) => { success: boolean; error?: string };
  updateUser: (user: User) => void;

  // System
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'finca_ca_desktop_state_v2';
const AUTH_SESSION_KEY = 'finca_ca_auth_session_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({});
  const [lockoutUntil, setLockoutUntil] = useState<Record<string, number>>({});

  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringWorkTemplate[]>(
    INITIAL_RECURRING_WORK_TEMPLATES
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(INITIAL_TIMESHEETS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [complianceDeadlines] = useState<ComplianceDeadline[]>(INITIAL_COMPLIANCE_DEADLINES);
  const [activeStopwatch, setActiveStopwatch] = useState<ActiveStopwatch | null>(null);

  const [firmDetails, setFirmDetails] = useState<FirmDetails>(FIRM_DETAILS);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [internalMessages, setInternalMessages] = useState<InternalMessage[]>(INITIAL_MESSAGES);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState<boolean>(false);

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.clients) setClients(parsed.clients);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.attendance) setAttendance(parsed.attendance);
        if (parsed.leaveRequests) setLeaveRequests(parsed.leaveRequests);
        if (parsed.timesheets) setTimesheets(parsed.timesheets);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.firmDetails) setFirmDetails(parsed.firmDetails);
        if (parsed.notices) setNotices(parsed.notices);
        if (parsed.internalMessages) setInternalMessages(parsed.internalMessages);
        if (parsed.failedAttempts) setFailedAttempts(parsed.failedAttempts);
        if (parsed.lockoutUntil) setLockoutUntil(parsed.lockoutUntil);
      }

      // Check remember me auth session
      const authSession = localStorage.getItem(AUTH_SESSION_KEY);
      if (authSession) {
        const sessionParsed = JSON.parse(authSession);
        if (sessionParsed.userId) {
          const userList = saved && JSON.parse(saved).users ? JSON.parse(saved).users : INITIAL_USERS;
          const found = userList.find((u: User) => u.id === sessionParsed.userId);
          if (found) {
            setCurrentUser(found);
            setIsAuthenticated(true);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load local storage state:', e);
    }
  }, []);

  // Save state to local storage on change
  useEffect(() => {
    try {
      const payload = {
        users,
        clients,
        tasks,
        attendance,
        leaveRequests,
        timesheets,
        invoices,
        firmDetails,
        notices,
        internalMessages,
        currentUserId: currentUser?.id,
        failedAttempts,
        lockoutUntil,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save to local storage:', e);
    }
  }, [users, clients, tasks, attendance, leaveRequests, timesheets, invoices, firmDetails, notices, internalMessages, currentUser, failedAttempts, lockoutUntil]);

  // Login handler
  const login = (usernameInput: string, passwordInput: string, rememberMe: boolean = false) => {
    const uname = usernameInput.trim().toLowerCase();

    // Check account lockout
    const lockTime = lockoutUntil[uname];
    if (lockTime && lockTime > Date.now()) {
      const remainingSecs = Math.ceil((lockTime - Date.now()) / 1000);
      return {
        success: false,
        error: `Account locked due to multiple failed login attempts. Please try again in ${Math.ceil(remainingSecs / 60)} minutes.`,
        isLockedOut: true,
        lockoutSeconds: remainingSecs,
      };
    }

    const matchedUser = users.find(
      (u) => u.username.toLowerCase() === uname || u.email.toLowerCase() === uname
    );

    if (!matchedUser || matchedUser.password !== passwordInput) {
      const currentAttempts = (failedAttempts[uname] || 0) + 1;
      const updatedAttempts = { ...failedAttempts, [uname]: currentAttempts };
      setFailedAttempts(updatedAttempts);

      if (currentAttempts >= 3) {
        const lockUntil = Date.now() + 5 * 60 * 1000; // 5 minute lock
        const updatedLockout = { ...lockoutUntil, [uname]: lockUntil };
        setLockoutUntil(updatedLockout);
        return {
          success: false,
          error: 'Security alert: Account locked due to 3 consecutive failed attempts. Lockout active for 5 minutes.',
          isLockedOut: true,
          lockoutSeconds: 300,
        };
      }

      return {
        success: false,
        error: `Invalid credentials. ${3 - currentAttempts} failed attempt(s) remaining before account lockout.`,
      };
    }

    // Success login
    setFailedAttempts((prev) => ({ ...prev, [uname]: 0 }));
    setLockoutUntil((prev) => {
      const next = { ...prev };
      delete next[uname];
      return next;
    });

    if (matchedUser.requiresPasswordChange) {
      return {
        success: true,
        requiresPasswordChange: true,
        user: matchedUser,
      };
    }

    setCurrentUser(matchedUser);
    setIsAuthenticated(true);

    if (rememberMe) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ userId: matchedUser.id }));
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }

    return { success: true, user: matchedUser };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(AUTH_SESSION_KEY);
  };

  const changePassword = (userId: string, newPasswordInput: string) => {
    if (!newPasswordInput || newPasswordInput.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, password: newPasswordInput, requiresPasswordChange: false }
          : u
      )
    );

    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, password: newPasswordInput, requiresPasswordChange: false } : null
      );
      setIsAuthenticated(true);
    }

    return { success: true };
  };

  // Stopwatch Ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeStopwatch && activeStopwatch.isRunning) {
      interval = setInterval(() => {
        setActiveStopwatch((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            elapsedSeconds: Math.floor((Date.now() - prev.startTime) / 1000),
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeStopwatch?.isRunning, activeStopwatch?.startTime]);

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const addClient = (clientData: Omit<Client, 'id' | 'code'>) => {
    const newId = `cli-${Date.now()}`;
    const newCode = `CLI-${100 + clients.length + 1}`;
    const newClient: Client = {
      ...clientData,
      id: newId,
      code: newCode,
    };
    setClients((prev) => [newClient, ...prev]);
  };

  const importClientsBatch = (newClientsData: Omit<Client, 'id' | 'code'>[]) => {
    const batch: Client[] = newClientsData.map((c, idx) => ({
      ...c,
      id: `cli-${Date.now()}-${idx}`,
      code: `CLI-${100 + clients.length + idx + 1}`,
    }));
    setClients((prev) => [...batch, ...prev]);
  };

  const updateClient = (updatedClient: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  const deleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  };

  const addTask = (taskData: Omit<Task, 'id' | 'code' | 'lastUpdated'>) => {
    const newId = `tsk-${Date.now()}`;
    const newCode = `TSK-${800 + tasks.length + 1}`;
    const newTask: Task = {
      ...taskData,
      id: newId,
      code: newCode,
      lastUpdated: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const addBatchTasks = (tasksList: Omit<Task, 'id' | 'code' | 'lastUpdated'>[]) => {
    const timestamp = Date.now();
    const batch: Task[] = tasksList.map((taskData, idx) => ({
      ...taskData,
      id: `tsk-${timestamp}-${idx}`,
      code: `TSK-${800 + tasks.length + idx + 1}`,
      lastUpdated: new Date().toISOString(),
    }));
    setTasks((prev) => [...batch, ...prev]);
  };

  const addRecurringTemplate = (templateData: Omit<RecurringWorkTemplate, 'id'>) => {
    const newTmpl: RecurringWorkTemplate = {
      ...templateData,
      id: `tmpl-${Date.now()}`,
    };
    setRecurringTemplates((prev) => [newTmpl, ...prev]);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              lastUpdated: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === updatedTask.id ? { ...updatedTask, lastUpdated: new Date().toISOString() } : t
      )
    );
  };

  const clockIn = (workMode: WorkMode, location: string, workSummary?: string) => {
    if (!currentUser) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const existingIndex = attendance.findIndex(
      (a) => a.userId === currentUser.id && a.date === todayStr
    );

    const newRecord: AttendanceRecord = {
      id: existingIndex >= 0 ? attendance[existingIndex].id : `att-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      date: todayStr,
      checkInTime: nowTime,
      status: workMode === 'WFH' ? 'WFH' : workMode === 'ON_SITE' ? 'ON_SITE' : 'PRESENT',
      workMode,
      location,
      ipAddress: '103.21.124.95',
      breakMinutes: 0,
      workSummary: workSummary || 'Checked in via Desktop Dashboard',
    };

    if (existingIndex >= 0) {
      setAttendance((prev) => prev.map((a, idx) => (idx === existingIndex ? newRecord : a)));
    } else {
      setAttendance((prev) => [newRecord, ...prev]);
    }
  };

  const clockOut = () => {
    if (!currentUser) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setAttendance((prev) =>
      prev.map((a) =>
        a.userId === currentUser.id && a.date === todayStr
          ? { ...a, checkOutTime: nowTime }
          : a
      )
    );
  };

  const applyLeave = (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => {
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: `lve-${Date.now()}`,
      status: 'PENDING',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests((prev) => [newLeave, ...prev]);
  };

  const approveLeave = (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status,
              approvedBy: currentUser?.name || 'System Admin',
            }
          : l
      )
    );
  };

  const startStopwatch = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setActiveStopwatch({
      taskId,
      taskTitle: task.title,
      clientId: task.clientId,
      clientName: task.clientName,
      startTime: Date.now(),
      elapsedSeconds: 0,
      isRunning: true,
    });
  };

  const stopStopwatch = (description: string) => {
    if (!activeStopwatch || !currentUser) return;

    const durationMinutes = Math.max(1, Math.round(activeStopwatch.elapsedSeconds / 60));
    const task = tasks.find((t) => t.id === activeStopwatch.taskId);

    const newTimesheet: TimesheetEntry = {
      id: `ts-${Date.now()}`,
      taskId: activeStopwatch.taskId,
      taskTitle: activeStopwatch.taskTitle,
      clientId: activeStopwatch.clientId,
      clientName: activeStopwatch.clientName,
      userId: currentUser.id,
      userName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      durationMinutes,
      description: description || 'Billable time logged via Stopwatch',
      billable: true,
      hourlyRate: currentUser.hourlyRate || 0,
    };

    setTimesheets((prev) => [newTimesheet, ...prev]);

    if (task) {
      const addedBillableHours = Number((durationMinutes / 60).toFixed(1));
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, billableHours: Number((t.billableHours + addedBillableHours).toFixed(1)) }
            : t
        )
      );
    }

    setActiveStopwatch(null);
  };

  const addTimesheetEntry = (entryData: Omit<TimesheetEntry, 'id'>) => {
    const newEntry: TimesheetEntry = {
      ...entryData,
      id: `ts-${Date.now()}`,
    };
    setTimesheets((prev) => [newEntry, ...prev]);
  };

  const deleteTimesheetEntry = (id: string) => {
    setTimesheets((prev) => prev.filter((ts) => ts.id !== id));
  };

  // Firm Details
  const updateFirmDetails = (details: FirmDetails) => {
    setFirmDetails(details);
  };

  // Backup and Restore
  const exportFullBackup = () => {
    const backupData = {
      version: '2.0',
      exportTimestamp: new Date().toISOString(),
      firmDetails,
      users,
      clients,
      tasks,
      attendance,
      leaveRequests,
      timesheets,
      invoices,
      notices,
      internalMessages,
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Firm_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restoreFullBackup = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid backup file structure.' };
      }

      if (data.users && Array.isArray(data.users)) setUsers(data.users);
      if (data.clients && Array.isArray(data.clients)) setClients(data.clients);
      if (data.tasks && Array.isArray(data.tasks)) setTasks(data.tasks);
      if (data.attendance && Array.isArray(data.attendance)) setAttendance(data.attendance);
      if (data.leaveRequests && Array.isArray(data.leaveRequests)) setLeaveRequests(data.leaveRequests);
      if (data.timesheets && Array.isArray(data.timesheets)) setTimesheets(data.timesheets);
      if (data.invoices && Array.isArray(data.invoices)) setInvoices(data.invoices);
      if (data.firmDetails) {
        const fd = data.firmDetails;
        const normalizedFirmDetails: FirmDetails = {
          name: fd.name || FIRM_DETAILS.name,
          tagline: fd.tagline || FIRM_DETAILS.tagline,
          frn: fd.frn || fd.registrationNo || FIRM_DETAILS.frn,
          headOffice: fd.headOffice || fd.address || FIRM_DETAILS.headOffice,
          gstin: fd.gstin || FIRM_DETAILS.gstin,
          pan: fd.pan || FIRM_DETAILS.pan,
          email: fd.email || FIRM_DETAILS.email,
          phone: fd.phone || FIRM_DETAILS.phone,
          bankName: fd.bankName || (fd.bankDetails && fd.bankDetails.bankName) || FIRM_DETAILS.bankName,
          accountNo: fd.accountNo || (fd.bankDetails && fd.bankDetails.accountNo) || FIRM_DETAILS.accountNo,
          ifsc: fd.ifsc || (fd.bankDetails && (fd.bankDetails.ifsc || fd.bankDetails.ifscCode)) || FIRM_DETAILS.ifsc,
          upiId: fd.upiId || FIRM_DETAILS.upiId,
        };
        setFirmDetails(normalizedFirmDetails);
      }
      if (data.notices && Array.isArray(data.notices)) setNotices(data.notices);
      if (data.internalMessages && Array.isArray(data.internalMessages)) setInternalMessages(data.internalMessages);

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to parse JSON backup file.' };
    }
  };

  // Notice Board
  const addNotice = (noticeData: Omit<Notice, 'id' | 'createdAt' | 'authorName'>) => {
    const newNotice: Notice = {
      ...noticeData,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      authorName: currentUser?.name || 'Firm Management',
    };
    setNotices((prev) => [newNotice, ...prev]);
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const togglePinNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Internal Messaging Board (1-on-1 direct user messaging)
  const sendInternalMessage = (recipientId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const recipient = users.find((u) => u.id === recipientId);
    const newMsg: InternalMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      recipientId: recipientId,
      recipientName: recipient?.name || 'Staff Member',
      text: text.trim(),
      createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', Today',
    };
    setInternalMessages((prev) => [...prev, newMsg]);
  };

  // Task Review & Multi-stage Approval Workflow
  const submitTaskForChecking = (taskId: string, checkerUserId: string, remarks: string) => {
    if (!currentUser) return;
    const checker = users.find((u) => u.id === checkerUserId);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newRemark: TaskRemark = {
          id: `rem-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          text: remarks || 'Submitted work for checking & audit review.',
          timestamp:
            new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
            ' ' +
            new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: 'SUBMITTED_FOR_CHECKING',
        };
        return {
          ...t,
          status: 'SUBMITTED_FOR_CHECKING',
          checkerUserId: checkerUserId,
          checkerName: checker?.name || 'Assigned Checker',
          remarksHistory: [...(t.remarksHistory || []), newRemark],
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  };

  const sendTaskBackForCorrection = (taskId: string, remarks: string) => {
    if (!currentUser) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newRemark: TaskRemark = {
          id: `rem-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          text: remarks || 'Sent back for correction. Please rectify flagged issues.',
          timestamp:
            new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
            ' ' +
            new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: 'SENT_BACK_FOR_CORRECTION',
        };
        return {
          ...t,
          status: 'NEEDS_CORRECTION',
          remarksHistory: [...(t.remarksHistory || []), newRemark],
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  };

  const submitTaskForFinalApproval = (taskId: string, approverUserId: string, remarks: string) => {
    if (!currentUser) return;
    const approver = users.find((u) => u.id === approverUserId);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newRemark: TaskRemark = {
          id: `rem-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          text: remarks || 'Audit checking completed. Forwarded to Partner for final approval.',
          timestamp:
            new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
            ' ' +
            new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: 'SUBMITTED_FOR_FINAL_APPROVAL',
        };
        return {
          ...t,
          status: 'SUBMITTED_FOR_FINAL_APPROVAL',
          approverUserId: approverUserId,
          approverName: approver?.name || 'Senior Partner',
          remarksHistory: [...(t.remarksHistory || []), newRemark],
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  };

  const approveTaskFinal = (taskId: string, remarks?: string) => {
    if (!currentUser) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newRemark: TaskRemark = {
          id: `rem-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          text: remarks || 'Final approval granted. Filing & sign-off completed.',
          timestamp:
            new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
            ' ' +
            new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: 'FINAL_APPROVED',
        };
        return {
          ...t,
          status: 'FILED_COMPLETED',
          remarksHistory: [...(t.remarksHistory || []), newRemark],
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  };

  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newId = `inv-${Date.now()}`;
    const nextSeq = 85 + invoices.length;
    const invoiceNumber = `INV/2026-27/0${nextSeq}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
      invoiceNumber,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const updateInvoiceStatus = (
    invoiceId: string,
    status: InvoiceStatus,
    paymentRef?: string
  ) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status,
              ...(status === 'PAID'
                ? {
                    paymentDate: new Date().toISOString().split('T')[0],
                    paymentReference: paymentRef || 'DIRECT_NEFT_PAYMENT',
                  }
                : {}),
            }
          : inv
      )
    );
  };

  const sendPaymentReminder = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, reminderSentAt: new Date().toISOString() }
          : inv
      )
    );
  };

  // User & Employee Management
  const addUser = (userData: Omit<User, 'id'>) => {
    const existingUsername = users.find(
      (u) => u.username.toLowerCase() === userData.username.toLowerCase()
    );
    if (existingUsername) {
      return { success: false, error: `Username '${userData.username}' is already registered.` };
    }

    const existingEmail = users.find(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existingEmail) {
      return { success: false, error: `Email '${userData.email}' is already assigned to another staff member.` };
    }

    const newId = `usr-${Date.now()}`;
    const defaultAvatar = userData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

    const newUser: User = {
      ...userData,
      id: newId,
      avatar: defaultAvatar,
      status: userData.status || 'ACTIVE',
      requiresPasswordChange: userData.requiresPasswordChange ?? true,
    };

    setUsers((prev) => [newUser, ...prev]);
    return { success: true, user: newUser };
  };

  const deleteUser = (userId: string) => {
    if (currentUser && currentUser.id === userId) {
      return { success: false, error: 'You cannot delete your own active user account.' };
    }

    if (userId === 'usr-1') {
      return { success: false, error: 'The primary system administrator account cannot be deleted.' };
    }

    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, error: 'User record not found.' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    return { success: true };
  };

  const updateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const resetDemoData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
    setUsers(INITIAL_USERS);
    setClients(INITIAL_CLIENTS);
    setTasks(INITIAL_TASKS);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setTimesheets(INITIAL_TIMESHEETS);
    setInvoices(INITIAL_INVOICES);
    setFirmDetails(FIRM_DETAILS);
    setNotices(INITIAL_NOTICES);
    setInternalMessages(INITIAL_MESSAGES);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveStopwatch(null);
    setFailedAttempts({});
    setLockoutUntil({});
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        clients,
        tasks,
        recurringTemplates,
        attendance,
        leaveRequests,
        timesheets,
        invoices,
        complianceDeadlines,
        activeStopwatch,
        firmDetails,
        notices,
        internalMessages,
        activeTab,
        searchQuery,
        isRoleModalOpen,
        isQuickSearchOpen,
        isAuthenticated,
        failedAttempts,
        lockoutUntil,

        login,
        logout,
        changePassword,
        switchUser,
        setActiveTab,
        setSearchQuery,
        setIsRoleModalOpen,
        setIsQuickSearchOpen,

        updateFirmDetails,
        exportFullBackup,
        restoreFullBackup,

        addNotice,
        deleteNotice,
        togglePinNotice,

        sendInternalMessage,

        addClient,
        importClientsBatch,
        updateClient,
        deleteClient,

        addTask,
        addBatchTasks,
        addRecurringTemplate,
        updateTaskStatus,
        updateTask,
        submitTaskForChecking,
        sendTaskBackForCorrection,
        submitTaskForFinalApproval,
        approveTaskFinal,

        clockIn,
        clockOut,
        applyLeave,
        approveLeave,

        startStopwatch,
        stopStopwatch,
        addTimesheetEntry,
        deleteTimesheetEntry,

        createInvoice,
        updateInvoiceStatus,
        sendPaymentReminder,

        addUser,
        deleteUser,
        updateUser,

        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
