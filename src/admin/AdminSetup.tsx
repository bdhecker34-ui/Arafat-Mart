import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, Info } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';

interface AdminSetupProps {
  onSetupSuccess: () => void;
  onCancel: () => void;
  onSwitchToLogin?: () => void;
}

export const AdminSetup: React.FC<AdminSetupProps> = ({ onSetupSuccess, onCancel, onSwitchToLogin }) => {
  const [email, setEmail] = useState('bdhecker34@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainWarning, setDomainWarning] = useState<boolean>(false);

  // Password strength validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const isPasswordStrong = hasMinLength && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordStrong) {
      setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের এবং এতে অন্তত একটি সংখ্যা থাকতে হবে (At least 8 characters with numbers).');
      return;
    }

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড দুটি মেলেনি (Passwords do not match).');
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setDomainWarning(false);
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        const emailLower = user.email.toLowerCase().trim();
        const isAuthorized =
          emailLower === 'bdhecker34@gmail.com' ||
          emailLower === 'ashik140267@gmail.com';

        if (!isAuthorized) {
          setError(`অননুমোদিত অ্যাকাউন্ট (${user.email})! শুধুমাত্র অনুমোদিত অ্যাডমিন (bdhecker34@gmail.com) সেটআপ করতে পারবেন।`);
          await signOut(auth);
          return;
        }

        adminApi.setSession(`firebase_${user.uid}`, user.email);
        localStorage.setItem('arafat_mart_setup_done', 'true');
        onSetupSuccess();
      }
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setDomainWarning(true);
        setError('গিটহাব ডোমেনটি এখনও Firebase-এ অনুমোদিত নয়। নিচের ইমেইল ও পাসওয়ার্ড ফর্ম পূরণ করে এখনই সেটআপ সম্পন্ন করুন!');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
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
            অ্যাডমিন সেটআপ (Admin Setup)
          </h1>
          <p className="text-xs text-stone-400 leading-relaxed">
            আরাফাত মার্টের অ্যাডমিন প্যানেল সক্রিয় করতে নিচে আপনার পাসওয়ার্ড নির্ধারণ করুন অথবা সরাসরি গুগল দিয়ে লগইন করুন।
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        {domainWarning && (
          <div className="p-3 bg-amber-950/60 border border-amber-700/60 text-amber-200 text-xs rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Info className="w-4 h-4 shrink-0" />
              <span>Google Sign-in ডোমেন অনুমোদন:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-300">
              Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains-এ গিয়ে <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300">hecker34-ui.github.io</code> যোগ করুন।
            </p>
            <p className="text-[11px] font-semibold text-emerald-400">
              💡 আপনি নিচের ফর্মে সরাসরি পাসওয়ার্ড সেট করে এখনই অ্যাডমিনে ঢুকতে পারেন।
            </p>
          </div>
        )}

        {/* 1-Click Google Sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs rounded-xl flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer border border-stone-300"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'কানেক্ট হচ্ছে...' : 'Google দিয়ে ১-ক্লিকে অ্যাডমিন প্রবেশ'}</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-stone-700"></div>
          <span className="flex-shrink mx-3 text-stone-500 text-[11px]">অথবা ইমেইল ও পাসওয়ার্ড দিন</span>
          <div className="flex-grow border-t border-stone-700"></div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              অ্যাডমিন ইমেইল (Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bdhecker34@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              নতুন পাসওয়ার্ড (New Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৮ অক্ষর ও সংখ্যা"
                className="w-full pl-9 pr-10 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-stone-400 hover:text-white absolute right-3 top-2.5 p-0.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirement Checkers */}
            <div className="mt-2 space-y-1 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-stone-500'}`}>
                <span>• কমপক্ষে ৮ অক্ষর (At least 8 characters)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-stone-500'}`}>
                <span>• অন্তত একটি সংখ্যা (At least one number)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="পুনরায় একই পাসওয়ার্ড দিন"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'অ্যাডমিন সেটআপ সম্পন্ন করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              দোকানে ফিরে যান
            </button>
          </div>
        </form>

        {onSwitchToLogin && (
          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              ইতিমধ্যে পাসওয়ার্ড তৈরি করেছেন? এখানে লগইন করুন
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
