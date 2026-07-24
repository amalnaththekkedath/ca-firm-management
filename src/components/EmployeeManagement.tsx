import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Search,
  Shield,
  Trash2,
  Edit,
  KeyRound,
  X,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Building2,
  DollarSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  Award,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';

export const EmployeeManagement: React.FC = () => {
  const { users, currentUser, addUser, deleteUser, updateUser, changePassword } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const isPartnerOrAdmin = currentUser?.role === 'ADMINISTRATOR' || currentUser?.role === 'PARTNER';
  const isAdmin = currentUser?.role === 'ADMINISTRATOR';

  const isTargetAdminOrPartner = (targetRole: UserRole) =>
    targetRole === 'ADMINISTRATOR' || targetRole === 'PARTNER';

  if (!isPartnerOrAdmin) {
    return (
      <div className="p-8 max-w-3xl mx-auto my-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted: Staff Roster & User Management</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Employee provisioning, user role management, and password resets are restricted exclusively to Managing Partners and System Administrators.
        </p>
        <div className="pt-2">
          <span className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700">
            Your Role: {currentUser?.role}
          </span>
        </div>
      </div>
    );
  }

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pwdResetUser, setPwdResetUser] = useState<User | null>(null);

  // New Employee Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('ARTICLE_ASSISTANT');
  const [designation, setDesignation] = useState('Article Assistant');
  const [department, setDepartment] = useState('Statutory Audit');
  const [membershipNo, setMembershipNo] = useState('');
  const [initialPassword, setInitialPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(true);

  // Feedback messages
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Auto-set default designation when role changes
  const handleRoleChange = (selected: UserRole) => {
    setRole(selected);
    switch (selected) {
      case 'ADMINISTRATOR':
        setDesignation('System Administrator');
        setDepartment('IT & Management');
        break;
      case 'PARTNER':
        setDesignation('Senior Managing Partner');
        setDepartment('Executive Board');
        break;
      case 'AUDIT_MANAGER':
        setDesignation('Audit & Assurance Manager');
        setDepartment('Statutory Audit');
        break;
      case 'SENIOR_MANAGER':
        setDesignation('Senior Taxation Manager');
        setDepartment('Direct Tax & GST');
        break;
      case 'AUDIT_SENIOR':
        setDesignation('Senior Audit Executive');
        setDepartment('Statutory Audit');
        break;
      case 'ARTICLE_ASSISTANT':
        setDesignation('Article Assistant (IPCC)');
        setDepartment('Statutory Audit');
        break;
      case 'BILLING_CLERK':
        setDesignation('Accounts & Billing Officer');
        setDepartment('Billing & Finance');
        break;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    const res = addUser({
      name,
      username,
      email,
      role,
      designation,
      department,
      membershipNo: membershipNo || undefined,
      password: initialPassword,
      requiresPasswordChange,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: 'ACTIVE',
    });

    if (!res.success) {
      setAddError(res.error || 'Failed to add employee');
      return;
    }

    setAddSuccess(`Employee '${name}' added successfully with username '${username}'.`);
    setTimeout(() => {
      setIsAddModalOpen(false);
      setAddSuccess(null);
      // Reset form
      setName('');
      setUsername('');
      setEmail('');
      setMembershipNo('');
      setInitialPassword('123456');
    }, 1200);
  };

  const handleDeleteConfirm = () => {
    if (!deletingUser) return;
    setDeleteError(null);

    const res = deleteUser(deletingUser.id);
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete employee account.');
      return;
    }

    setDeletingUser(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    if (!editingUser) return;

    const originalUser = users.find((u) => u.id === editingUser.id);
    const isTargetAdminPartner =
      isTargetAdminOrPartner(editingUser.role) ||
      (originalUser && isTargetAdminOrPartner(originalUser.role));

    // Permission check: Editing Admin or Partner account requires Administrator role!
    if (isTargetAdminPartner && !isAdmin) {
      setEditError(
        'Access Restricted: Only System Administrators are authorized to edit Administrator or CA Partner details.'
      );
      return;
    }

    // Validate username uniqueness (excluding current user)
    const dupUsername = users.find(
      (u) => u.id !== editingUser.id && u.username.toLowerCase() === editingUser.username.toLowerCase()
    );
    if (dupUsername) {
      setEditError(`Username '${editingUser.username}' is already in use by ${dupUsername.name}.`);
      return;
    }

    // Validate email uniqueness (excluding current user)
    const dupEmail = users.find(
      (u) => u.id !== editingUser.id && u.email.toLowerCase() === editingUser.email.toLowerCase()
    );
    if (dupEmail) {
      setEditError(`Email '${editingUser.email}' is already assigned to ${dupEmail.name}.`);
      return;
    }

    updateUser(editingUser);
    setEditSuccess(`Account profile for ${editingUser.name} updated successfully.`);
    setTimeout(() => {
      setEditingUser(null);
      setEditSuccess(null);
    }, 1000);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!pwdResetUser) return;
    const res = changePassword(pwdResetUser.id, newPassword);

    if (!res.success) {
      setResetError(res.error || 'Password update failed.');
    } else {
      setResetSuccess(`Password for ${pwdResetUser.name} updated successfully.`);
      setTimeout(() => {
        setPwdResetUser(null);
        setNewPassword('');
        setResetSuccess(null);
      }, 1200);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.membershipNo && u.membershipNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesDept = selectedDept === 'ALL' || u.department === selectedDept;

    return matchesSearch && matchesRole && matchesDept;
  });

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Employee & Staff Roster
          </h1>
          <p className="text-xs text-slate-500">
            User provisioning, role-based access control, employee addition, password resets & deletion
          </p>
        </div>

        <button
          onClick={() => {
            setAddError(null);
            setAddSuccess(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Add New Employee
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Staff Count
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 flex items-center justify-between">
            <span>{users.length}</span>
            <Users className="w-5 h-5 text-indigo-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            CA Partners & Admins
          </span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1 flex items-center justify-between">
            <span>{users.filter((u) => u.role === 'PARTNER' || u.role === 'ADMINISTRATOR').length}</span>
            <Shield className="w-5 h-5 text-amber-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
            Audit Managers
          </span>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-1 flex items-center justify-between">
            <span>{users.filter((u) => u.role === 'AUDIT_MANAGER' || u.role === 'SENIOR_MANAGER').length}</span>
            <UserCheck className="w-5 h-5 text-indigo-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Article Assistants
          </span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1 flex items-center justify-between">
            <span>{users.filter((u) => u.role === 'ARTICLE_ASSISTANT').length}</span>
            <Award className="w-5 h-5 text-emerald-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee by name, username, email, designation..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="PARTNER">CA Partner</option>
            <option value="AUDIT_MANAGER">Audit Manager</option>
            <option value="SENIOR_MANAGER">Senior Manager</option>
            <option value="AUDIT_SENIOR">Audit Senior</option>
            <option value="ARTICLE_ASSISTANT">Article Assistant</option>
            <option value="BILLING_CLERK">Billing Clerk</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Departments</option>
            <option value="Statutory Audit">Statutory Audit</option>
            <option value="Direct Tax & GST">Direct Tax & GST</option>
            <option value="Executive Board">Executive Board</option>
            <option value="Corporate Law & ROC">Corporate Law & ROC</option>
            <option value="Billing & Finance">Billing & Finance</option>
            <option value="IT & Management">IT & Management</option>
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const isCurrentLoggedIn = currentUser?.id === u.id;
          const isTargetAdminPartner = isTargetAdminOrPartner(u.role);
          const canEditThisUser = isAdmin || !isTargetAdminPartner;
          const canResetPassThisUser = isAdmin || !isTargetAdminPartner;
          const canDeleteThisUser =
            !isCurrentLoggedIn && u.id !== 'usr-1' && (isAdmin || !isTargetAdminPartner);

          return (
            <div
              key={u.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm hover:border-indigo-300 transition flex flex-col justify-between relative ${
                isCurrentLoggedIn ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-11 h-11 rounded-2xl border border-slate-200 object-cover shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        {u.name}
                        {isCurrentLoggedIn && (
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                            You
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{u.designation}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 flex items-center gap-1 ${
                      u.role === 'ADMINISTRATOR'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : u.role === 'PARTNER'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : u.role === 'AUDIT_MANAGER' || u.role === 'SENIOR_MANAGER'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isTargetAdminPartner && <Shield className="w-3 h-3" />}
                    {u.role.replace('_', ' ')}
                  </span>
                </div>

                {/* Admin/Partner notice badge for non-admin viewers */}
                {isTargetAdminPartner && !isAdmin && (
                  <div className="mt-2.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Admin/Partner Details: Editable by Administrators only</span>
                  </div>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Username:</span>
                    <span className="font-mono text-slate-900 font-semibold">{u.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-700 truncate max-w-[170px]">{u.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-medium text-slate-800">{u.department}</span>
                  </div>
                  {u.membershipNo && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">ICAI Membership:</span>
                      <span className="font-mono text-indigo-700 font-semibold">{u.membershipNo}</span>
                    </div>
                  )}
                  {u.hourlyRate !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Billable Rate:</span>
                      <span className="font-mono text-emerald-700 font-bold">₹{u.hourlyRate}/hr</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                <button
                  disabled={!canEditThisUser}
                  onClick={() => {
                    if (!canEditThisUser) return;
                    setEditingUser({ ...u });
                    setEditError(null);
                    setEditSuccess(null);
                  }}
                  title={
                    !canEditThisUser
                      ? 'Editing Admin and Partner details is restricted to System Administrators only'
                      : isTargetAdminPartner
                      ? 'Edit Admin/Partner Profile (Administrator Authorized)'
                      : 'Edit Employee Profile'
                  }
                  className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 font-medium ${
                    !canEditThisUser
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : isTargetAdminPartner
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {!canEditThisUser ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : isTargetAdminPartner ? (
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Edit className="w-3.5 h-3.5" />
                  )}
                  <span>Edit</span>
                </button>

                <button
                  disabled={!canResetPassThisUser}
                  onClick={() => {
                    if (!canResetPassThisUser) return;
                    setPwdResetUser(u);
                    setNewPassword('');
                    setResetError(null);
                    setResetSuccess(null);
                  }}
                  title={
                    !canResetPassThisUser
                      ? 'Resetting Admin/Partner passwords is restricted to System Administrators only'
                      : 'Reset User Password'
                  }
                  className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 font-medium border ${
                    !canResetPassThisUser
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100'
                  }`}
                >
                  {!canResetPassThisUser ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <KeyRound className="w-3.5 h-3.5" />
                  )}
                  <span>Reset Pass</span>
                </button>

                <button
                  disabled={!canDeleteThisUser}
                  onClick={() => {
                    if (!canDeleteThisUser) return;
                    setDeletingUser(u);
                    setDeleteError(null);
                  }}
                  title={
                    isCurrentLoggedIn
                      ? 'Cannot delete your active session'
                      : u.id === 'usr-1'
                      ? 'Cannot delete primary superadmin'
                      : !canDeleteThisUser
                      ? 'Deleting Admin/Partner account is restricted to System Administrators only'
                      : 'Delete Employee'
                  }
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition flex items-center gap-1 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full text-slate-900 shadow-xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" /> Provision New Employee Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create staff login credentials, assign firm role, department & billable hourly rate
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{addError}</span>
              </div>
            )}

            {addSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{addSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyanshu Sharma"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Login Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'))}
                    placeholder="e.g. priyanshu.sharma"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priyanshu@rkca.in"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    User Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ARTICLE_ASSISTANT">Article Assistant / Trainee</option>
                    <option value="AUDIT_SENIOR">Audit Senior / Qualified CA</option>
                    <option value="AUDIT_MANAGER">Audit Manager</option>
                    <option value="SENIOR_MANAGER">Senior Manager</option>
                    <option value="BILLING_CLERK">Billing & Accounts Clerk</option>
                    <option value="PARTNER">CA Partner</option>
                    <option value="ADMINISTRATOR">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation Title
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Statutory Audit">Statutory Audit</option>
                    <option value="Direct Tax & GST">Direct Tax & GST</option>
                    <option value="Corporate Law & ROC">Corporate Law & ROC</option>
                    <option value="Management Consulting">Management Consulting</option>
                    <option value="Billing & Finance">Billing & Finance</option>
                    <option value="IT & Management">IT & Management</option>
                    <option value="Executive Board">Executive Board</option>
                  </select>
                </div>
              </div>

              {(role === 'PARTNER' || role === 'AUDIT_SENIOR' || role === 'AUDIT_MANAGER') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ICAI Membership / Reg Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={membershipNo}
                    onChange={(e) => setMembershipNo(e.target.value)}
                    placeholder="e.g. FCA 089412 or ICAI/2024/9912"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Initial Authentication Security Setup
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Default Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={initialPassword}
                      onChange={(e) => setInitialPassword(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={requiresPasswordChange}
                    onChange={(e) => setRequiresPasswordChange(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <span>Enforce mandatory password update on user's first login</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Create & Save Employee Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full text-slate-900 shadow-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Employee Account?</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-bold text-slate-900">{deletingUser.name}</span>? This will revoke
                  all login access and remove their workstation profile.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <img
                src={deletingUser.avatar}
                alt={deletingUser.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">{deletingUser.name}</p>
                <p className="text-slate-500 font-mono">@{deletingUser.username} • {deletingUser.designation}</p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User / Admin / Partner Details Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full text-slate-900 shadow-xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {isTargetAdminOrPartner(editingUser.role) ? (
                    <>
                      <Shield className="w-5 h-5 text-amber-600" />
                      <span>Edit Executive Profile (Admin & Partner)</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-5 h-5 text-indigo-600" />
                      <span>Edit Staff Account Details</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update personal credentials, role permissions, department & hourly billable rate
                </p>
              </div>

              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isTargetAdminOrPartner(editingUser.role) && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-start gap-2.5 text-xs">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900">Administrator Authorization Active</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    You are editing an Executive Leadership profile (Administrator or Partner). Only System Administrators possess access to modify these elevated profiles.
                  </p>
                </div>
              </div>
            )}

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation Title *</label>
                  <input
                    type="text"
                    value={editingUser.designation}
                    onChange={(e) => setEditingUser({ ...editingUser, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Role * {!isAdmin && '(Restricted to Admin)'}
                  </label>
                  <select
                    disabled={!isAdmin}
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="ADMINISTRATOR">Administrator</option>
                    <option value="PARTNER">CA Partner</option>
                    <option value="SENIOR_MANAGER">Senior Manager</option>
                    <option value="AUDIT_MANAGER">Audit Manager</option>
                    <option value="AUDIT_SENIOR">Audit Senior</option>
                    <option value="ARTICLE_ASSISTANT">Article Assistant</option>
                    <option value="BILLING_CLERK">Billing Clerk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="Executive Board">Executive Board</option>
                    <option value="IT & Management">IT & Management</option>
                    <option value="Statutory Audit">Statutory Audit</option>
                    <option value="Direct Tax & GST">Direct Tax & GST</option>
                    <option value="Corporate Law & ROC">Corporate Law & ROC</option>
                    <option value="Billing & Finance">Billing & Finance</option>
                    <option value="Internal Audit & Risk">Internal Audit & Risk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ICAI Membership / FRN No.
                  </label>
                  <input
                    type="text"
                    value={editingUser.membershipNo || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, membershipNo: e.target.value })}
                    placeholder="e.g. FCA 504912"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billable Rate (₹ / hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editingUser.hourlyRate || 0}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, hourlyRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, status: e.target.value as 'ACTIVE' | 'ON_LEAVE' })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="ACTIVE">Active Duty</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Photo URL</label>
                  <input
                    type="text"
                    value={editingUser.avatar}
                    onChange={(e) => setEditingUser({ ...editingUser, avatar: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {pwdResetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full text-slate-900 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" /> Reset Employee Password
              </h3>
              <button
                onClick={() => setPwdResetUser(null)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Setting new account password for <span className="font-bold text-slate-900">{pwdResetUser.name}</span> (@{pwdResetUser.username}).
            </p>

            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPwdResetUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
