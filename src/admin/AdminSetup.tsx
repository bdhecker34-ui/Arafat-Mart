import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface AdminSetupProps {
  onSetupSuccess: () => void;
  onCancel: () => void;
}

export const AdminSetup: React.FC<AdminSetupProps> = ({ onSetupSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const isPasswordStrong = hasMinLength && hasNumber && (hasUpper || hasSpecial);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordStrong) {
      setError('Password must be at least 8 characters long and contain at least one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await adminApi.initialSetup(email, password);
      if (result.success) {
        onSetupSuccess();
      } else {
        setError(result.error || 'Failed to complete initial administrator setup.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during administrator setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-stone-800 border border-stone-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header Lockup */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Initial Administrator Setup
          </h1>
          <p className="text-xs text-stone-400 leading-relaxed">
            One-time system initialization. Once created, public administrator registration is permanently locked.
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 bg-amber-950/40 border border-amber-800/40 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong>Single-Admin Policy:</strong> Only one initial administrator account can be provisioned. Subsequent attempts through any interface will be rejected.
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Owner Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@arafatmart.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Strong Administrator Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-stone-400 hover:text-white absolute right-3 top-2.5 p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirement Checkers */}
            <div className="mt-2 space-y-1 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-stone-500'}`}>
                <span>• At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-stone-500'}`}>
                <span>• At least one numerical digit</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>{loading ? 'Initializing...' : 'Complete Administrator Setup'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700 transition-colors"
            >
              Back to Store
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
