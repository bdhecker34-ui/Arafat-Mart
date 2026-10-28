import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  MapPin,
  LogOut,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  User as UserIcon,
  Phone,
  Mail,
  Save,
  Gift,
} from 'lucide-react';
import { User, signOut, auth } from '../firebase';
import {
  subscribeUserOrders,
  getUserProfileFromFirestore,
  saveUserProfileToFirestore,
} from '../services/firestoreService';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshDistricts';
import { UserProfile, OrderStatus, AffiliateAccount } from '../types';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onTrackOrder: (orderId: string) => void;
  onLogout: () => void;
  onOpenAffiliate?: () => void;
  affiliateAccount?: AffiliateAccount | null;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onTrackOrder,
  onLogout,
  onOpenAffiliate,
  affiliateAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form State
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    fullName: user.displayName || '',
    phone: user.phoneNumber || '',
    email: user.email || '',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: '',
    fullAddress: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user profile & subscribe to user orders
  useEffect(() => {
    if (!isOpen || !user) return;

    let isMounted = true;

    // 1. Fetch saved profile
    getUserProfileFromFirestore(user.uid).then((saved) => {
      if (isMounted && saved) {
        setProfile((prev) => ({
          ...prev,
          ...saved,
          email: user.email || saved.email || '',
          fullName: saved.fullName || user.displayName || '',
        }));
      }
    });

    // 2. Subscribe to user orders
    setLoadingOrders(true);
    const unsubscribe = subscribeUserOrders(user.uid, (orders) => {
      if (isMounted) {
        setUserOrders(orders);
        setLoadingOrders(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await saveUserProfileToFirestore(user.uid, profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: 'কনফার্মড', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'quality_check':
        return { label: 'কোয়ালিটি চেক', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'dispatched':
        return { label: 'কুরিয়ারে পাঠানো হয়েছে', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'out_for_delivery':
        return { label: 'ডেলিভারি ম্যানের কাছে', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'delivered':
        return { label: 'ডেলিভারি সম্পন্ন', bg: 'bg-emerald-600 text-white border-transparent' };
      default:
        return { label: status, bg: 'bg-stone-800 text-stone-300 border-stone-700' };
    }
  };

  const selectedDivisionObj =
    BANGLADESH_DIVISIONS.find((d) => d.name === profile.division || d.id === profile.division) ||
    BANGLADESH_DIVISIONS[0];
  const selectedDivisionDistricts = selectedDivisionObj.districts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header Profile Summary */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-850 via-stone-900 to-stone-850 border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-bold text-lg flex items-center justify-center shadow-lg shrink-0">
              {profile.fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {profile.fullName || user.displayName || 'সম্মানিত কাস্টমার'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Easy Mart Member
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={async () => {
                await signOut(auth);
                onLogout();
                onClose();
              }}
              title="লগআউট করুন"
              className="px-3 py-1.5 bg-stone-800 hover:bg-rose-950/60 hover:text-rose-400 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700 hover:border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Affiliate Quick Card */}
        {onOpenAffiliate && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 sm:p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <span>{affiliateAccount ? 'অ্যাফিলিয়েট পার্টনার ড্যাশবোর্ড' : 'Easy Mart অ্যাফিলিয়েট প্রোগ্রাম'}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                    affiliateAccount ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500 text-stone-950'
                  }`}>
                    {affiliateAccount ? 'সক্রিয় (Active)' : '৫% কমিশন'}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 truncate">
                  {affiliateAccount
                    ? `উত্তোলনযোগ্য ব্যালেন্স: ৳${(affiliateAccount.balance || 0).toLocaleString()} • আইডি: ${affiliateAccount.affiliateId}`
                    : '১-ক্লিকে যোগ দিন ও প্রতিটি সফল ডেলিভারিতে ৫% কমিশন নিশ্চিত করুন'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAffiliate();
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow shrink-0 flex items-center gap-1 cursor-pointer transition-all"
            >
              <span>{affiliateAccount ? 'Open Affiliate Dashboard' : 'Become an Affiliate'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 p-1.5">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all rounded-xl flex items-center justify-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>আমার অর্ডারসমূহ ({userOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all rounded-xl flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>সেভ করা ঠিকানা ও প্রোফাইল</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* ================= TAB 1: MY ORDERS ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span>আপনার অর্ডার লোড হচ্ছে...</span>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400 space-y-3">
                  <div className="w-12 h-12 bg-stone-800 text-stone-500 rounded-2xl flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">এখনও কোনো অর্ডার করেননি</h4>
                    <p className="text-[11px] text-stone-500 mt-1">
                      আমাদের কালেকশন থেকে সেরা পণ্যটি অর্ডার করুন এবং এখানে রিয়েল-টাইমে ট্র্যাক করুন।
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    শপিং শুরু করুন
                  </button>
                </div>
              ) : (
                userOrders.map((ord) => {
                  const badge = getStatusBadge(ord.orderStatus || ord.status || 'confirmed');
                  return (
                    <div
                      key={ord.id || ord.orderId}
                      className="p-4 bg-stone-850 border border-stone-800 rounded-2xl space-y-3 hover:border-stone-700 transition-colors text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
                        <div>
                          <span className="font-mono font-bold text-amber-400 mr-2">
                            #{ord.id || ord.orderId}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('bn-BD') : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-stone-300">
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block">পণ্যসমূহ</span>
                          <span className="font-medium text-white truncate block">
                            {ord.items?.map((it: any) => `${it.product?.title || 'পণ্য'} (${it.quantity})`).join(', ') || 'আইটেম'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block">ডেলিভারি ঠিকানা</span>
                          <span className="truncate block text-stone-300">
                            {ord.customer?.district || ord.deliveryDistrict}, {ord.customer?.division || ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block">মোট টাকা ও পেমেন্ট</span>
                          <span className="font-bold text-white font-mono">
                            ৳{(ord.total || ord.totalAmount || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-stone-400 ml-1.5 uppercase font-semibold">
                            ({ord.paymentMethod || 'COD'})
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-stone-400">
                          ট্র্যাকিং কোড: <strong className="text-white">{ord.trackingNumber || ord.id}</strong>
                        </span>
                        <button
                          onClick={() => {
                            onTrackOrder(ord.id || ord.orderId);
                            onClose();
                          }}
                          className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-600/40 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>লাইভ ট্র্যাক করুন</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ================= TAB 2: PROFILE & ADDRESS ================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {saveSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>আপনার প্রোফাইল ও ডেলিভারি ঠিকানা সফলভাবে সংরক্ষণ করা হয়েছে!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    আপনার সম্পূর্ণ নাম
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.fullName || ''}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    মোবাইল নাম্বার
                  </label>
                  <input
                    type="tel"
                    required
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  ইমেইল এড্রেস
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email || user.email || ''}
                  className="w-full p-2.5 bg-stone-950/60 border border-stone-800 rounded-xl text-stone-400 text-xs font-mono cursor-not-allowed"
                />
              </div>

              {/* Division and District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    বিভাগ (Division)
                  </label>
                  <select
                    value={profile.division || selectedDivisionObj.name}
                    onChange={(e) => {
                      const newDivName = e.target.value;
                      const divObj = BANGLADESH_DIVISIONS.find((d) => d.name === newDivName) || BANGLADESH_DIVISIONS[0];
                      const firstDist = divObj.districts[0]?.name || 'Dhaka';
                      setProfile({ ...profile, division: newDivName, district: firstDist });
                    }}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.nameBn} ({d.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    জেলা (District)
                  </label>
                  <select
                    value={profile.district || selectedDivisionDistricts[0]?.name}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    {selectedDivisionDistricts.map((dist) => (
                      <option key={dist.id} value={dist.name}>
                        {dist.nameBn} ({dist.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  থানা / উপজেলা (Police Station / Thana)
                </label>
                <input
                  type="text"
                  value={profile.thana || ''}
                  onChange={(e) => setProfile({ ...profile, thana: e.target.value })}
                  placeholder="যেমন: ধানমন্ডি / মিরপুর / সদর"
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  বিস্তারিত ডেলিভারি ঠিকানা (রোড, বাসা নং, এরিয়া)
                </label>
                <textarea
                  rows={2}
                  value={profile.fullAddress || ''}
                  onChange={(e) => setProfile({ ...profile, fullAddress: e.target.value })}
                  placeholder="বাসা নং, রোড নং, এরিয়া বা ল্যান্ডমার্ক..."
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>ঠিকানা সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-stone-500 text-center mt-2">
                  এই ঠিকানাটি সেভ থাকলে পরবর্তী যেকোনো অর্ডারে স্বয়ংক্রিয়ভাবে বসে যাবে।
                </p>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
