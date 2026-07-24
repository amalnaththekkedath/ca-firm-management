import React, { useState, useEffect } from 'react';
import {
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  KeyRound,
  Building2,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FIRM_DETAILS } from '../data/mockData';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login, changePassword } = useApp();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Force Password Change state
  const [requiresChangeModal, setRequiresChangeModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwChangeError, setPwChangeError] = useState<string | null>(null);

  // Countdown timer for lockout
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLockedOut && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setErrorMsg(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLockedOut, lockoutTimer]);

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-700' };

    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };

    if (pwd.length >= 6) score += 20;
    if (checks.length) score += 20;
    if (checks.uppercase && checks.lowercase) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;

    let label = 'Weak';
    let color = 'bg-rose-500';

    if (score >= 80) {
      label = 'Excellent';
      color = 'bg-emerald-500';
    } else if (score >= 60) {
      label = 'Strong';
      color = 'bg-indigo-500';
    } else if (score >= 40) {
      label = 'Medium';
      color = 'bg-amber-500';
    }

    return { score, label, color, checks };
  };

  const passwordStrength = calculatePasswordStrength(password);
  const newPasswordStrength = calculatePasswordStrength(newPassword);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = login(username, password, rememberMe);

    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed');
      if (res.isLockedOut) {
        setIsLockedOut(true);
        setLockoutTimer(res.lockoutSeconds || 300);
      }
      return;
    }

    if (res.requiresPasswordChange && res.user) {
      setTargetUserId(res.user.id);
      setRequiresChangeModal(true);
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwChangeError(null);

    if (newPassword !== confirmPassword) {
      setPwChangeError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPwChangeError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword === '123456') {
      setPwChangeError('Please choose a password different from the default "123456".');
      return;
    }

    if (targetUserId) {
      const res = changePassword(targetUserId, newPassword);
      if (!res.success) {
        setPwChangeError(res.error || 'Failed to update password');
      } else {
        setRequiresChangeModal(false);
      }
    }
  };

  const fillQuickPreset = (presetUname: string, presetPwd: string) => {
    setUsername(presetUname);
    setPassword(presetPwd);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Subtle background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/50 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-200/50 blur-3xl rounded-full pointer-events-none" />

      {/* Main Login Box */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10 space-y-6">
        {/* CA Firm Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl shadow-xs mb-1">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{FIRM_DETAILS.name}</h1>
          <p className="text-xs text-indigo-600 font-semibold">{FIRM_DETAILS.tagline}</p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">{FIRM_DETAILS.frn}</span>
            <span>•</span>
            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">Desktop Office Suite</span>
          </div>
        </div>

        {/* Lockout Banner */}
        {isLockedOut && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900">ACCOUNT LOCKED FOR SECURITY</p>
              <p className="mt-1 text-rose-700">
                Too many failed attempts. Try again in{' '}
                <span className="font-mono font-bold text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                  {Math.floor(lockoutTimer / 60)}m {lockoutTimer % 60}s
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && !isLockedOut && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username / Official Email
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or rajesh.kapoor@rkca.in"
                disabled={isLockedOut}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                disabled={isLockedOut}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50 font-mono"
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

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Password Strength:</span>
                  <span className="font-bold text-slate-700">{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[11px] text-slate-500">256-bit AES Encrypted</span>
          </div>

          <button
            type="submit"
            disabled={isLockedOut}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <Shield className="w-4 h-4" /> Authenticate & Access Office <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 text-center uppercase tracking-wider">
            Quick System Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button
              type="button"
              onClick={() => fillQuickPreset('admin', '123456')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-amber-200 hover:border-amber-400 rounded-lg text-left transition"
            >
              <div className="font-bold text-amber-700 flex items-center justify-between">
                <span>Administrator</span>
                <span className="text-[9px] bg-amber-50 border border-amber-200 px-1 rounded text-amber-800">Pass Change Req</span>
              </div>
              <div className="text-slate-500 font-mono mt-0.5">admin / 123456</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickPreset('rajesh.kapoor', 'partner123')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-400 rounded-lg text-left transition"
            >
              <div className="font-bold text-indigo-700">CA Partner</div>
              <div className="text-slate-500 font-mono mt-0.5">rajesh.kapoor / partner123</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickPreset('ananya.sharma', 'manager123')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-400 rounded-lg text-left transition"
            >
              <div className="font-bold text-slate-700">Audit Manager</div>
              <div className="text-slate-500 font-mono mt-0.5">ananya.sharma / manager123</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickPreset('rohan.mehta', 'article123')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-400 rounded-lg text-left transition"
            >
              <div className="font-bold text-emerald-700">Article Assistant</div>
              <div className="text-slate-500 font-mono mt-0.5">rohan.mehta / article123</div>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Password Change Enforcement Modal */}
      {requiresChangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Security Policy Enforcement
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Mandatory Password Update Required
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  You logged in using a default initial password. You must set a new secure password before proceeding to the firm workspace.
                </p>
              </div>
            </div>

            {pwChangeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{pwChangeError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Secure Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />

                {newPassword.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Strength: {newPasswordStrength.label}</span>
                      <span className="font-mono text-slate-700">{newPasswordStrength.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${newPasswordStrength.color}`}
                        style={{ width: `${newPasswordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Password & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
