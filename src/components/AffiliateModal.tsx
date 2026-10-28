import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  TrendingUp,
  Wallet,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Gift,
  Award,
  Info,
  DollarSign,
  Send,
  Link as LinkIcon,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedNumber } from './AnimatedNumber';
import { User } from '../firebase';
import {
  AffiliateAccount,
  AffiliatePayout,
  Product,
} from '../types';
import {
  createAffiliateAccount,
  requestAffiliatePayout,
  subscribeAffiliatePayouts,
  updateAffiliatePayoutSettings,
} from '../services/firestoreService';

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  affiliateAccount: AffiliateAccount | null;
  onAffiliateCreated: (acc: AffiliateAccount) => void;
  products?: Product[];
}

export const AffiliateModal: React.FC<AffiliateModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  affiliateAccount,
  onAffiliateCreated,
  products = [],
}) => {
  // Tabs for dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'payout' | 'terms'>('overview');

  // Terms agreement state for creation flow
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  // Link copy feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedProductLink, setCopiedProductLink] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  // Payout request form
  const [payoutMethod, setPayoutMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>(
    affiliateAccount?.payoutMethod || 'bkash'
  );
  const [payoutNumber, setPayoutNumber] = useState<string>(affiliateAccount?.payoutNumber || '');
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Real-time payout history
  const [payoutHistory, setPayoutHistory] = useState<AffiliatePayout[]>([]);

  useEffect(() => {
    if (affiliateAccount?.payoutMethod) {
      setPayoutMethod(affiliateAccount.payoutMethod);
    }
    if (affiliateAccount?.payoutNumber) {
      setPayoutNumber(affiliateAccount.payoutNumber);
    }
  }, [affiliateAccount]);

  useEffect(() => {
    if (!currentUser || !affiliateAccount) return;
    const unsubscribe = subscribeAffiliatePayouts(currentUser.uid, (payouts) => {
      setPayoutHistory(payouts);
    });
    return () => unsubscribe();
  }, [currentUser, affiliateAccount]);

  if (!isOpen) return null;

  // Base URL for referral link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://easymartbd.com';
  const mainReferralLink = affiliateAccount
    ? `${origin}/?ref=${affiliateAccount.affiliateId}`
    : '';

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const productReferralLink =
    affiliateAccount && selectedProduct
      ? `${origin}/?product=${selectedProduct.id}&ref=${affiliateAccount.affiliateId}`
      : '';

  // 1-Click Join Handler
  const handleJoinAffiliate = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!termsAgreed) {
      setCreationError('অনুগ্রহ করে শর্তাবলিতে সম্মতি দিন।');
      return;
    }

    setIsCreating(true);
    setCreationError(null);

    try {
      const res = await createAffiliateAccount({
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName,
      });

      if (res.success && res.account) {
        onAffiliateCreated(res.account);
      } else {
        setCreationError(res.error || 'অ্যাফিলিয়েট একাউন্ট তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (e: any) {
      setCreationError(e.message || 'নেটওয়ার্ক বা পারমিশন ত্রুটি।');
    } finally {
      setIsCreating(false);
    }
  };

  // Copy Link Handler
  const handleCopy = (text: string, isProduct = false) => {
    navigator.clipboard.writeText(text);
    if (isProduct) {
      setCopiedProductLink(text);
      setTimeout(() => setCopiedProductLink(null), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = (link: string, title?: string) => {
    const text = encodeURIComponent(
      title
        ? `🔥 Easy Mart থেকে কিনুন ${title} সেরা দামে: ${link}`
        : `🛍️ Easy Mart-এ অবিশ্বাস্য অফার ও ডিসকাউন্টে কেনাকাটা করুন! ৬৪ জেলায় ক্যাশ অন ডেলিভারি: ${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Payout Submit Handler
  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !affiliateAccount) return;

    const amountNum = parseFloat(payoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPayoutMessage({ type: 'error', text: 'সঠিক উত্তোলনের পরিমাণ লিখুন।' });
      return;
    }
    if (amountNum < 100) {
      setPayoutMessage({ type: 'error', text: 'সর্বনিম্ন উত্তোলনের পরিমাণ ১০০ টাকা।' });
      return;
    }
    if (amountNum > affiliateAccount.balance) {
      setPayoutMessage({ type: 'error', text: 'আপনার কাছে পর্যাপ্ত উত্তোলনযোগ্য ব্যালেন্স নেই।' });
      return;
    }
    if (!payoutNumber.trim()) {
      setPayoutMessage({ type: 'error', text: 'পেমেন্ট নম্বর প্রদান করুন।' });
      return;
    }

    setIsSubmittingPayout(true);
    setPayoutMessage(null);

    const res = await requestAffiliatePayout({
      userId: currentUser.uid,
      affiliateId: affiliateAccount.affiliateId,
      amount: amountNum,
      paymentMethod: payoutMethod,
      paymentNumber: payoutNumber.trim(),
      accountHolderName: accountHolderName.trim() || undefined,
    });

    setIsSubmittingPayout(false);

    if (res.success) {
      setPayoutMessage({
        type: 'success',
        text: `৳${amountNum} উত্তোলনের আবেদন সফলভাবে গ্রহণ করা হয়েছে! অ্যাডমিন অনুমোদনের পর পেমেন্ট পাঠানো হবে।`,
      });
      setPayoutAmount('');
    } else {
      setPayoutMessage({
        type: 'error',
        text: res.error || 'উত্তোলন অনুরোধ ব্যর্থ হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden relative"
      >
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/30 border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Easy Mart অ্যাফিলিয়েট প্রোগ্রাম
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Earn 5% Commission
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {affiliateAccount
                  ? 'আপনার পার্সোনাল রেফারেল লিংক শেয়ার করে কমিশন উপার্জন করুন'
                  : 'রেফার করে প্রতি সফল অর্ডারে নিশ্চিত কমিশন আয় করুন'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
          {/* SCENARIO 1: User Not Logged In */}
          {!currentUser && (
            <div className="text-center py-8 px-4 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-white">Google দিয়ে ১-ক্লিকে লগইন করুন</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Easy Mart-এর বিদ্যমান Google Sign-In সিস্টেমের সাথে যুক্ত হয়ে কোনো ঝামেলা ছাড়াই সরাসরি আপনার অ্যাফিলিয়েট অ্যাকাউন্ট চালু করুন। কোনো ফি বা অতিরিক্ত পাসওয়ার্ডের প্রয়োজন নেই।
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onOpenAuth();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5 bg-white p-0.5 rounded-full"
                  />
                  <span>Google দিয়ে লগইন / সাইন আপ করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* SCENARIO 2: User is Logged In, BUT doesn't have an Affiliate Account yet */}
          {currentUser && !affiliateAccount && (
            <div className="space-y-5">
              {/* Profile Confirmation Card */}
              <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-base shrink-0 border border-amber-500/20">
                  {currentUser.displayName?.charAt(0)?.toUpperCase() || currentUser.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-stone-400">আপনার বিদ্যমান Google একাউন্ট:</div>
                  <div className="text-sm font-bold text-white truncate">{currentUser.displayName || 'সম্মানিত ইউজার'}</div>
                  <div className="text-xs text-amber-400/90 font-mono truncate">{currentUser.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ভেরিফাইড
                  </span>
                </div>
              </div>

              {/* Benefits Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-850/80 border border-stone-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">৫% সরাসরি কমিশন</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">প্রতিটি সফলভাবে ডেলিভারিকৃত অর্ডারে সরাসরি ৫% লাভ।</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-850/80 border border-stone-800">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">সহজ মোবাইল উত্তোলন</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">বিকাশ, নগদ, রকেটে সর্বনিম্ন মাত্র ১০০ টাকা থেকে উত্তোলন।</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-850/80 border border-stone-800">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">১০০% সম্পূর্ণ ফ্রি</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">কোনো রেজিস্ট্রেশন ফি বা ইনভেস্টমেন্টের প্রয়োজন নেই।</div>
                </div>
              </div>

              {/* Terms and Conditions Box */}
              <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Info className="w-4 h-4" />
                  <span>অ্যাফিলিয়েট প্রোগ্রামের গুরুত্বপূর্ণ শর্তাবলি:</span>
                </div>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong className="text-white">ডেলিভারি নির্ভর কমিশন:</strong> কমিশন কেবল সফলভাবে ডেলিভারি সম্পন্ন হওয়া যোগ্য অর্ডারের ক্ষেত্রেই প্রদান করা হবে। অর্ডার বাতিল বা কাস্টমার রিটার্ন করলে কমিশন প্রদেয় হবে না।
                  </li>
                  <li>
                    <strong className="text-white">একক একাউন্ট নীতি:</strong> প্রতিটি Google অ্যাকাউন্টের বিপরীতে একটিমাত্র ইউনিক অ্যাফিলিয়েট আইডি প্রদান করা হবে।
                  </li>
                  <li>
                    <strong className="text-white">ন্যায্য ব্যবহার:</strong> কোনো স্প্যাম, প্রতারণামূলক লিংক ক্লিক বা ভুয়া অর্ডারের ক্ষেত্রে অ্যাকাউন্ট স্থগিতের অধিকার কর্তৃপক্ষ সংরক্ষণ করে।
                  </li>
                  <li>
                    <strong className="text-white">উত্তোলন প্রসেসিং:</strong> আবেদনের পর অ্যাডমিন ভেরিফিকেশন সাপেক্ষে বিকাশ/নগদে ২৪-৭২ ঘণ্টার মধ্যে ফান্ড ট্রান্সফার হবে।
                  </li>
                </ul>

                {/* Agreement Checkbox */}
                <label className="flex items-start gap-2.5 pt-2 text-xs text-stone-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-stone-700 bg-stone-800 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>
                    আমি Easy Mart অ্যাফিলিয়েট প্রোগ্রামের উল্লেখিত শর্তাবলিতে সম্মত হয়ে একাউন্ট তৈরি করতে চাই।
                  </span>
                </label>
              </div>

              {creationError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{creationError}</span>
                </div>
              )}

              {/* 1-Click Action Button */}
              <button
                onClick={handleJoinAffiliate}
                disabled={!termsAgreed || isCreating}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  termsAgreed && !isCreating
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                }`}
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>অ্যাফিলিয়েট একাউন্ট তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Become an Affiliate — এক ক্লিকে একাউন্ট খুলুন</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* SCENARIO 3: User is Logged In AND Already has an Affiliate Account -> DASHBOARD */}
          {currentUser && affiliateAccount && (
            <div className="space-y-5">
              {/* Top Affiliate Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-stone-850 to-stone-900 border border-amber-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-400">অ্যাফিলিয়েট আইডি:</span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 text-xs">
                      {affiliateAccount.affiliateId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      সক্রিয় পার্টনার
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {affiliateAccount.name || currentUser.displayName || 'Affiliate Partner'}
                  </h3>
                  <div className="text-xs text-stone-400 font-mono truncate">{affiliateAccount.email}</div>
                </div>

                <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800 text-right sm:text-right">
                  <div className="text-[11px] text-stone-400">উত্তোলনযোগ্য ব্যালেন্স</div>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">
                    <AnimatedNumber value={affiliateAccount.balance || 0} prefix="৳" />
                  </div>
                  <div className="text-[10px] text-stone-500">কমিশন রেট: {affiliateAccount.commissionRate || 5}%</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-stone-800 bg-stone-950/60 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2 text-xs font-bold transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>ওভারভিউ</span>
                </button>

                <button
                  onClick={() => setActiveTab('links')}
                  className={`flex-1 py-2 text-xs font-bold transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'links'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>রেফারেল লিংক</span>
                </button>

                <button
                  onClick={() => setActiveTab('payout')}
                  className={`flex-1 py-2 text-xs font-bold transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'payout'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>উত্তোলন</span>
                </button>

                <button
                  onClick={() => setActiveTab('terms')}
                  className={`flex-1 py-2 text-xs font-bold transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'terms'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>নীতিমালা</span>
                </button>
              </div>

              {/* TAB 1: OVERVIEW METRICS */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-stone-850 border border-stone-800 transition-all hover:border-stone-700">
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 mb-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>সর্বমোট আয়</span>
                      </div>
                      <div className="text-lg font-bold text-white font-mono">
                        <AnimatedNumber value={affiliateAccount.totalEarnings || 0} prefix="৳" />
                      </div>
                      <div className="text-[10px] text-emerald-400/80 mt-1">ডেলিভারিকৃত অর্ডার</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-850 border border-stone-800 transition-all hover:border-stone-700">
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 mb-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>অপেক্ষমাণ আয়</span>
                      </div>
                      <div className="text-lg font-bold text-amber-400 font-mono">
                        <AnimatedNumber value={affiliateAccount.pendingEarnings || 0} prefix="৳" />
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1">ডেলিভারির পর যুক্ত হবে</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-850 border border-stone-800 transition-all hover:border-stone-700">
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                        <span>সফল সেলস</span>
                      </div>
                      <div className="text-lg font-bold text-white font-mono">
                        <AnimatedNumber value={affiliateAccount.totalReferredOrders || 0} suffix=" টি" />
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1">অর্ডার সম্পন্ন</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-850 border border-stone-800 transition-all hover:border-stone-700">
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 mb-1">
                        <Share2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>লিংক ক্লিক</span>
                      </div>
                      <div className="text-lg font-bold text-white font-mono">
                        <AnimatedNumber value={affiliateAccount.totalClicks || 0} suffix=" বার" />
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1">ইউজার ভিজিট</div>
                    </div>
                  </div>

                  {/* Quick Share Main Link */}
                  <div className="p-4 rounded-2xl bg-stone-850/90 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                        আপনার মূল রেফারেল লিংক
                      </span>
                      <span className="text-[10px] text-stone-400">এই লিংকে প্রবেশকারী প্রতিটি অর্ডারে আপনি ৫% পাবেন</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={mainReferralLink}
                        className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-stone-300 focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopy(mainReferralLink)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          copiedLink
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold'
                        }`}
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                      <button
                        onClick={() => handleShareWhatsApp(mainReferralLink)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer"
                        title="WhatsApp-এ শেয়ার করুন"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Commission Policy Reminder Notice */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-white">গুরুত্বপূর্ণ নির্দেশনা:</strong> রেফারেল লিংকের মাধ্যমে অর্ডার প্লেস হলে তা প্রথমে "অপেক্ষমাণ আয়" হিসেবে গণ্য হয়। পণ্যটি কাস্টমারের ঠিকানায় সফলভাবে ডেলিভারি ও পেমেন্ট সম্পন্ন হলেই তা আপনার "উত্তোলনযোগ্য ব্যালেন্স"-এ জমা হবে।
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: REFERRAL LINKS & PRODUCT LINK BUILDER */}
              {activeTab === 'links' && (
                <div className="space-y-4">
                  {/* Storefront Universal Link */}
                  <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-2.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>হোমপেজ ও সম্পূর্ণ স্টোর লিংক</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      এই লিংকটি ফেসবুক, মেসেঞ্জার, হোয়াটসঅ্যাপ বা যেকোনো সোশ্যাল মিডিয়ায় শেয়ার করতে পারেন। ভিজিটর যেকোনো প্রোডাক্ট কিনলেই আপনি ৫% কমিশন পাবেন।
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={mainReferralLink}
                        className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-stone-300"
                      />
                      <button
                        onClick={() => handleCopy(mainReferralLink)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          copiedLink ? 'bg-emerald-600 text-white' : 'bg-stone-750 hover:bg-stone-700 text-stone-200'
                        }`}
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Specific Product Link Builder */}
                  {products.length > 0 && (
                    <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-3">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>নির্দিষ্ট প্রোডাক্টের রেফারেল লিংক তৈরি করুন</span>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        নিচের তালিকা থেকে যেকোনো ট্রেন্ডিং প্রোডাক্ট নির্বাচন করে সরাসরি সেই প্রোডাক্টের অ্যাফিলিয়েট লিংক তৈরি করুন:
                      </p>

                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-stone-300">প্রোডাক্ট সিলেক্ট করুন:</label>
                        <select
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} (৳{p.price}) — কমিশন: ৳{Math.round(p.price * 0.05)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedProduct && (
                        <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-3">
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.title}
                            className="w-12 h-12 rounded-lg object-cover bg-stone-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{selectedProduct.title}</div>
                            <div className="text-[11px] text-amber-400 font-mono">
                              মূল্য: ৳{selectedProduct.price} | প্রতি সেলে সম্ভাব্য লাভ: ৳{Math.round(selectedProduct.price * 0.05)}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={productReferralLink}
                          className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-stone-300"
                        />
                        <button
                          onClick={() => handleCopy(productReferralLink, true)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                            copiedProductLink === productReferralLink
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                          }`}
                        >
                          {copiedProductLink === productReferralLink ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedProductLink === productReferralLink ? 'কপি হয়েছে' : 'কপি'}</span>
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(productReferralLink, selectedProduct?.title)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PAYOUT / WITHDRAWAL */}
              {activeTab === 'payout' && (
                <div className="space-y-4">
                  {/* Balance Status Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-stone-900 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-stone-400">উত্তোলনযোগ্য ব্যালেন্স</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        ৳{(affiliateAccount.balance || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right text-xs text-stone-400">
                      <div>সর্বনিম্ন উত্তোলন: <span className="text-white font-bold">৳১০০</span></div>
                      <div className="text-[10px] text-stone-500">প্রসেসিং সময়: ২৪-৭২ ঘণ্টা</div>
                    </div>
                  </div>

                  {/* Withdrawal Form */}
                  <form onSubmit={handlePayoutSubmit} className="p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-3.5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>কমিশন উত্তোলনের আবেদন করুন</span>
                    </h4>

                    {/* Method Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-stone-300">পেমেন্ট মেথড:</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['bkash', 'nagad', 'rocket', 'bank'] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPayoutMethod(method)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                              payoutMethod === method
                                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow'
                                : 'bg-stone-900 text-stone-400 border-stone-700 hover:border-stone-600'
                            }`}
                          >
                            {method === 'bkash'
                              ? 'bKash'
                              : method === 'nagad'
                              ? 'Nagad'
                              : method === 'rocket'
                              ? 'Rocket'
                              : 'Bank'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number / Account */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-stone-300">
                          {payoutMethod === 'bank' ? 'ব্যাংক একাউন্ট নম্বর:' : 'মোবাইল ওয়ালেট নম্বর (01XXXXXXXXX):'}
                        </label>
                        <input
                          type="text"
                          required
                          value={payoutNumber}
                          onChange={(e) => setPayoutNumber(e.target.value)}
                          placeholder={payoutMethod === 'bank' ? 'Account Number' : '017XXXXXXXX'}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-stone-300">উত্তোলনের পরিমাণ (৳):</label>
                        <input
                          type="number"
                          required
                          min="100"
                          max={affiliateAccount.balance}
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder="কমপক্ষে ১০০ টাকা"
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    {payoutMethod === 'bank' && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-stone-300">ব্যাংক নাম ও একাউন্ট হোল্ডার নাম:</label>
                        <input
                          type="text"
                          value={accountHolderName}
                          onChange={(e) => setAccountHolderName(e.target.value)}
                          placeholder="e.g. Dutch-Bangla Bank, Md. Rahim"
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}

                    {payoutMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                          payoutMessage.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                        }`}
                      >
                        {payoutMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{payoutMessage.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingPayout || (affiliateAccount.balance || 0) < 100}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        (affiliateAccount.balance || 0) >= 100 && !isSubmittingPayout
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                      }`}
                    >
                      {isSubmittingPayout ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>আবেদন পাঠানো হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>উত্তোলনের আবেদন জমা দিন</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Payout History List */}
                  <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        উত্তোলনের ইতিহাস
                      </span>
                      <span className="text-[10px] text-stone-400">{payoutHistory.length} টি রেকর্ড</span>
                    </h4>

                    {payoutHistory.length === 0 ? (
                      <div className="text-center py-6 text-xs text-stone-500">
                        এখনো কোনো উত্তোলনের আবেদন করা হয়নি।
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {payoutHistory.map((po) => (
                          <div
                            key={po.id}
                            className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>৳{po.amount}</span>
                                <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 font-mono">
                                  {po.paymentMethod}
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-400 font-mono">{po.paymentNumber}</div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  po.status === 'processed'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : po.status === 'rejected'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {po.status === 'processed'
                                  ? 'পরিশোধিত'
                                  : po.status === 'rejected'
                                  ? 'বাতিল'
                                  : 'অপেক্ষমাণ'}
                              </span>
                              <div className="text-[9px] text-stone-500 mt-0.5">
                                {new Date(po.createdAt).toLocaleDateString('bn-BD')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: RULES & TERMS */}
              {activeTab === 'terms' && (
                <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-3 text-xs text-stone-300 leading-relaxed">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>অ্যাফিলিয়েট নীতিমালা ও সাধারণ নিয়মাবলি</span>
                  </h4>

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <div className="font-bold text-amber-400 mb-1">১. কমিশন কীভাবে গণনা করা হয়?</div>
                      <div>
                        আপনার রেফারেল লিংক ব্যবহার করে কাস্টমার অর্ডার করার পর অর্ডারটি সিস্টেমে যুক্ত হয়। কাস্টমারের কাছে পণ্যটি সফলভাবে ডেলিভারি হওয়ার পর মোট পণ্যের মূল্যের ৫% স্বয়ংক্রিয়ভাবে নিশ্চিত আয় হিসেবে আপনার একাউন্টে যোগ হবে।
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <div className="font-bold text-amber-400 mb-1">২. বাতিল বা রিটার্ন হওয়া অর্ডারের ক্ষেত্রে কি কমিশন পাওয়া যাবে?</div>
                      <div>
                        না। যদি কোনো কারণে কাস্টমার অর্ডার বাতিল করে বা পার্সেল রিটার্ন করে, তবে সেই অর্ডারের জন্য কোনো কমিশন প্রদেয় হবে না।
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <div className="font-bold text-amber-400 mb-1">৩. উত্তোলনের সময়সীমা ও চার্জ</div>
                      <div>
                        বিকাশ, নগদ বা রকেটে উত্তোলনের জন্য কোনো সার্ভিস চার্জ কাটা হয় না। উত্তোলনের আবেদন করার ২৪ থেকে ৭২ ঘণ্টার মধ্যে টাকা পাঠিয়ে দেওয়া হয়।
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Easy Mart ভেরিফাইড অ্যাফিলিয়েট নেটওয়ার্ক</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold cursor-pointer transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
};
