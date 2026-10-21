import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
  onSwitchToSetup?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel, onSwitchToSetup }) => {
  const [email, setEmail] = useState('bdhecker34@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainWarning, setDomainWarning] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (email.trim().toLowerCase() !== 'bdhecker34@gmail.com') {
      setError('অননুমোদিত ইমেইল! শুধুমাত্র প্রধান অ্যাডমিন (bdhecker34@gmail.com) এর জন্য এই প্যানেল সংরক্ষিত।');
      setLoading(false);
      return;
    }

    try {
      const res = await adminApi.login(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.error || 'ভুল ইমেইল বা পাসওয়ার্ড। আবার চেষ্টা করুন।');
      }
    } catch (err: any) {
      setError(err.message || 'Login attempt failed. Please try again.');
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
        const configuredEmail = adminApi.getAdminEmail()?.toLowerCase().trim();
        
        // Strict Authorization: ONLY allow bdhecker34@gmail.com
        const isAuthorized = emailLower === 'bdhecker34@gmail.com';

        if (!isAuthorized) {
          setError(`অননুমোদিত অ্যাকাউন্ট (${user.email})! শুধুমাত্র প্রধান অ্যাডমিন (bdhecker34@gmail.com) এই প্যানেলে প্রবেশ করতে পারবেন।`);
          await signOut(auth);
          return;
        }

        // Authorize admin
        adminApi.setSession(`firebase_${user.uid}`, user.email);
        localStorage.setItem('arafat_mart_setup_done', 'true');
        onLoginSuccess();
      }
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setDomainWarning(true);
        setError('গিটহাব ডোমেনটি এখনও Firebase-এ অনুমোদিত নয়। নিচের ইমেইল ও পাসওয়ার্ড ফর্ম ব্যবহার করে এখনই সরাসরি লগইন করুন!');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again or use email/password.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-stone-800 border border-stone-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            অ্যাডমিন লগইন (Admin Login)
          </h1>
          <p className="text-xs text-stone-400">
            আরাফাত মার্ট অ্যাডমিন কন্ট্রোল প্যানেল
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {domainWarning && (
          <div className="p-3 bg-amber-950/60 border border-amber-700/60 text-amber-200 text-xs rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Info className="w-4 h-4 shrink-0" />
              <span>Google Sign-in ডোমেন অনুমোদন নির্দেশিকা:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-300">
              Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains-এ গিয়ে <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300">hecker34-ui.github.io</code> যোগ করুন।
            </p>
            <p className="text-[11px] font-semibold text-emerald-400">
              💡 আপনি নিচের ফর্মে সরাসরি পাসওয়ার্ড দিয়ে এখনই কোনো বাধা ছাড়াই ঢুকতে পারেন।
            </p>
          </div>
        )}

        {/* 1-Click Firebase Google Sign-in */}
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
          <span>{googleLoading ? 'কানেক্ট হচ্ছে...' : 'Google দিয়ে সরাসরি প্রবেশ করুন'}</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-stone-700"></div>
          <span className="flex-shrink mx-3 text-stone-500 text-[11px]">অথবা পাসওয়ার্ড দিয়ে লগইন করুন</span>
          <div className="flex-grow border-t border-stone-700"></div>
        </div>

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
              পাসওয়ার্ড (Password)
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
                className="text-stone-400 hover:text-white absolute right-3 top-2.5 p-0.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>{loading ? 'যাচাই হচ্ছে...' : 'লগইন করুন (Sign In)'}</span>
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

        {onSwitchToSetup && (
          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={onSwitchToSetup}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              নতুন পাসওয়ার্ড তৈরি করতে চান? এখানে সেটআপ করুন
            </button>
          </div>
        )}

        <div className="pt-3 border-t border-stone-700/60 flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Firebase Firestore & Cloud Auth সুরক্ষিত</span>
        </div>

      </div>
    </div>
  );
};
