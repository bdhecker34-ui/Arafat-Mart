import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from '../firebase';
import { saveUserProfileToFirestore } from '../services/firestoreService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        // Save/merge profile into Firestore
        await saveUserProfileToFirestore(res.user.uid, {
          uid: res.user.uid,
          email: res.user.email || '',
          fullName: res.user.displayName || 'সম্মানিত কাস্টমার',
          phone: res.user.phoneNumber || '',
        });
        resetForm();
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('লগইন উইন্ডো বন্ধ করা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      } else {
        setErrorMsg('গুগল দিয়ে লগইন করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (res.user) {
          resetForm();
          if (onSuccess) onSuccess();
          onClose();
        }
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMsg('অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
          setLoading(false);
          return;
        }

        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (res.user) {
          await updateProfile(res.user, { displayName: name.trim() });
          await saveUserProfileToFirestore(res.user.uid, {
            uid: res.user.uid,
            email: res.user.email || '',
            fullName: name.trim(),
            phone: phone.trim(),
          });
          resetForm();
          if (onSuccess) onSuccess();
          onClose();
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('অনুগ্রহ করে আপনার ইমেইল এড্রেস লিখুন।');
          setLoading(false);
          return;
        }
        await sendPasswordResetEmail(auth, email.trim());
        setSuccessMsg('আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে! ইনবক্স চেক করুন।');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার যাচাই করে চেষ্টা করুন।');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMsg('এই ইমেইলে কোনো একাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন।');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('এই ইমেইলটি দিয়ে ইতিমধ্যে একাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন।');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('সঠিক ইমেইল এড্রেস প্রদান করুন।');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('পাসওয়ার্ডটি খুব দুর্বল। অন্তত ৬ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।');
      } else {
        setErrorMsg(err.message || 'একটি সমস্যা দেখা দিয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-b from-stone-850 to-stone-900 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="./assets/images/easy_mart_logo.png"
              alt="Easy Mart Logo"
              className="w-10 h-10 object-contain rounded-xl bg-black p-1 border border-stone-700 shadow-md"
            />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Easy Mart একাউন্ট</h2>
              <p className="text-xs text-stone-400">সবকিছু, এক ঠিকানায়।</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-stone-800 bg-stone-950/60 p-1">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold transition-all rounded-xl ${
                mode === 'login'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              লগইন করুন (Sign In)
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold transition-all rounded-xl ${
                mode === 'signup'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              নতুন একাউন্ট (Sign Up)
            </button>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1-Click Google Sign In */}
          {mode !== 'forgot' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 active:scale-[0.99] border border-stone-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md"
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
                <span>Google দিয়ে ১-ক্লিকে {mode === 'login' ? 'লগইন করুন' : 'সাইন আপ করুন'}</span>
              </button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-stone-800"></div>
                <span className="flex-shrink mx-4 text-stone-500 text-[11px] font-medium">অথবা ইমেইল দিয়ে</span>
                <div className="flex-grow border-t border-stone-800"></div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  আপনার সম্পূর্ণ নাম <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: মোঃ সাকিব হোসেন"
                    className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                ইমেইল এড্রেস <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  মোবাইল নাম্বার (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-300">
                    পাসওয়ার্ড <span className="text-rose-400">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর..."
                    className="w-full pl-9 pr-10 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : mode === 'login' ? (
                'লগইন করুন'
              ) : mode === 'signup' ? (
                'অ্যাকাউন্ট তৈরি করুন'
              ) : (
                'রিসেট লিংক পাঠান'
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-amber-400 hover:underline cursor-pointer font-semibold"
              >
                ← লগইন পেজে ফিরে যান
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
