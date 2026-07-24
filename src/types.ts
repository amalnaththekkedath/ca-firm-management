export type UserRole =
  | 'ADMINISTRATOR'
  | 'PARTNER'
  | 'AUDIT_MANAGER'
  | 'SENIOR_MANAGER'
  | 'AUDIT_SENIOR'
  | 'ARTICLE_ASSISTANT'
  | 'BILLING_CLERK';

export interface User {
  id: string;
  username: string;
  password?: string;
  requiresPasswordChange?: boolean;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  designation: string;
  department: string;
  hourlyRate?: number;
  status: 'ACTIVE' | 'ON_LEAVE';
  membershipNo?: string; // FRN / Membership No for CAs
}

export interface FirmDetails {
  name: string;
  tagline: string;
  frn: string;
  headOffice: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  upiId: string;
}

export type NoticeCategory = 'ANNOUNCEMENT' | 'CIRCULAR' | 'COMPLIANCE' | 'HOLIDAY' | 'OFFICE_POLICY';
export type NoticePriority = 'URGENT' | 'IMPORTANT' | 'GENERAL';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  authorName: string;
  createdAt: string;
  pinned: boolean;
}

export type MessageChannel = 'GENERAL' | 'AUDIT_ASSURANCE' | 'DIRECT_TAX' | 'GST_COMPLIANCE' | 'URGENT_DISCUSSION';

export interface InternalMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  recipientId?: string; // For 1-on-1 direct user messaging
  recipientName?: string;
  channel?: MessageChannel;
  text: string;
  createdAt: string;
}

export type WorkMode = 'OFFICE' | 'ON_SITE' | 'WFH';
export type AttendanceStatus = 'PRESENT' | 'WFH' | 'ON_SITE' | 'HALF_DAY' | 'ABSENT' | 'LEAVE';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM AM/PM
  checkOutTime?: string;
  status: AttendanceStatus;
  workMode: WorkMode;
  location: string;
  ipAddress: string;
  workSummary?: string;
  breakMinutes: number;
}

export type LeaveType = 'CASUAL' | 'EXAM_STUDY' | 'SICK' | 'MATERNITY';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  approvedBy?: string;
}

export type EntityType = 'PVT_LTD' | 'LLP' | 'PARTNERSHIP' | 'PROPRIETORSHIP' | 'INDIVIDUAL';

export interface Client {
  id: string;
  code: string;
  name: string;
  tradeName?: string;
  entityType: EntityType;
  gstin: string;
  pan: string;
  tan?: string;
  contactPerson: string;
  email: string;
  phone: string;
  state: string;
  billingAddress: string;
  retainerFee: number;
  status: 'ACTIVE' | 'INACTIVE';
  sacCode: string;
  financialYear: string;
  partnerInChargeId?: string;
  partnerInChargeName?: string;
  openingBalance?: number;
  openingBalanceType?: 'DR' | 'CR';
  openingBalanceDate?: string;
}

export interface SoaTransaction {
  id: string;
  date: string;
  voucherType: 'INVOICE' | 'PAYMENT' | 'CREDIT_NOTE' | 'RETAINER_CREDIT' | 'OPENING_BALANCE';
  referenceNo: string;
  particulars: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export type TaskCategory =
  | 'GST'
  | 'INCOME_TAX'
  | 'STATUTORY_AUDIT'
  | 'TAX_AUDIT'
  | 'MCA_ROC'
  | 'ADVISORY'
  | 'BOOKKEEPING';

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus =
  | 'PENDING_DOCS'
  | 'IN_PROGRESS'
  | 'SUBMITTED_FOR_CHECKING'
  | 'NEEDS_CORRECTION'
  | 'SUBMITTED_FOR_FINAL_APPROVAL'
  | 'FILED_COMPLETED';

export interface TaskRemark {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  timestamp: string;
  action:
    | 'ASSIGNED'
    | 'SUBMITTED_FOR_CHECKING'
    | 'SENT_BACK_FOR_CORRECTION'
    | 'SUBMITTED_FOR_FINAL_APPROVAL'
    | 'FINAL_APPROVED';
}

export interface Task {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientGstin: string;
  title: string;
  category: TaskCategory;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToUserId: string;
  assignedToName: string;
  assignedByUserId?: string;
  assignedByName?: string;
  checkerUserId?: string;
  checkerName?: string;
  approverUserId?: string;
  approverName?: string;
  estimatedHours: number;
  billableHours: number;
  fixedFee?: number;
  hourlyRate: number;
  notes?: string;
  remarksHistory?: TaskRemark[];
  lastUpdated: string;
}

export type RecurringFrequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL' | 'ONE_TIME';

export interface RecurringWorkTemplate {
  id: string;
  title: string;
  category: TaskCategory;
  frequency: RecurringFrequency;
  defaultDueDateDay?: number;
  priority: TaskPriority;
  estimatedHours: number;
  fixedFee: number;
  description?: string;
  defaultAssignedToUserId?: string;
  defaultCheckerUserId?: string;
  defaultApproverUserId?: string;
  applicableEntityTypes?: EntityType[];
}

export interface TimesheetEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  clientId: string;
  clientName: string;
  userId: string;
  userName: string;
  date: string;
  durationMinutes: number;
  description: string;
  billable: boolean;
  hourlyRate: number;
  billedInvoiceId?: string;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  description: string;
  sacCode: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  clientGstin: string;
  clientPan: string;
  clientAddress: string;
  clientState: string;
  placeOfSupply: string;
  items: InvoiceItem[];
  subtotal: number;
  outOfPocketExpenses: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  paymentDate?: string;
  paymentReference?: string;
  reminderSentAt?: string;
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  category: TaskCategory;
  dueDate: string;
  applicableTo: string;
  penaltyNotice: string;
  status: 'CRITICAL' | 'UPCOMING' | 'COMPLETED';
}

export interface ActiveStopwatch {
  taskId: string;
  taskTitle: string;
  clientId: string;
  clientName: string;
  startTime: number;
  elapsedSeconds: number;
  isRunning: boolean;
}
