import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Truck, ArrowLeft, CheckCircle2, User as UserIcon, LogIn } from 'lucide-react';
import { CartItem, CustomerDetails, PaymentMethod, Order } from '../types';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshDistricts';
import { User } from '../firebase';
import { getUserProfileFromFirestore } from '../services/firestoreService';
import { motion } from 'motion/react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discount: number;
  onOrderPlaced: (order: Order) => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
  contactInfo?: {
    bkash: string;
    nagad: string;
    rocket: string;
  };
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discount,
  onOrderPlaced,
  currentUser,
  onOpenAuth,
  contactInfo,
}) => {
  if (!isOpen) return null;

  // Form State
  const [formData, setFormData] = useState<CustomerDetails>({
    fullName: '',
    phone: '',
    division: 'dhaka',
    district: 'dhaka-city',
    thana: '',
    fullAddress: '',
    orderNote: '',
  });

  // Pre-fill from current user profile if available
  useEffect(() => {
    if (currentUser) {
      getUserProfileFromFirestore(currentUser.uid).then((prof) => {
        if (prof) {
          setFormData((prev) => ({
            ...prev,
            fullName: prof.fullName || currentUser.displayName || prev.fullName,
            phone: prof.phone || prev.phone,
            thana: prof.thana || prev.thana,
            fullAddress: prof.fullAddress || prev.fullAddress,
          }));
        } else if (currentUser.displayName) {
          setFormData((prev) => ({
            ...prev,
            fullName: currentUser.displayName || prev.fullName,
          }));
        }
      });
    }
  }, [currentUser, isOpen]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashTrxId, setBkashTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculations
  const currentDivisionObj = BANGLADESH_DIVISIONS.find((d) => d.id === formData.division) || BANGLADESH_DIVISIONS[0];
  const currentDistrictObj = currentDivisionObj.districts.find((d) => d.id === formData.district) || currentDivisionObj.districts[0];

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= 1999 || discount === 9999;
  const deliveryFee = isFreeDelivery ? 0 : currentDivisionObj.deliveryFee;
  const totalAmount = Math.max(0, subtotal - (discount === 9999 ? 0 : discount) + deliveryFee);

  const handleDivisionChange = (divId: string) => {
    const newDiv = BANGLADESH_DIVISIONS.find((d) => d.id === divId) || BANGLADESH_DIVISIONS[0];
    setFormData((prev) => ({
      ...prev,
      division: divId,
      district: newDiv.districts[0]?.id || '',
      thana: '',
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Please enter your recipient name';
    if (!formData.phone.trim()) {
      errs.phone = 'Mobile number is required for delivery';
    } else if (!/^(\+?88)?01[3-9]\d{8}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Valid Bangladeshi phone number required (e.g. 01712345678)';
    }
    if (!formData.fullAddress.trim()) errs.fullAddress = 'Detailed street/area address is required';

    if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
      if (!bkashNumber) errs.mfsNumber = 'Enter account number used for payment';
      if (!bkashTrxId) errs.trxId = 'Enter transaction ID (or 8-character demo ID)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = `AFM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const trackingNumber = `BD-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const newOrder: Order = {
        id: orderId,
        trackingNumber,
        createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        userId: currentUser?.uid,
        userEmail: currentUser?.email || '',
        customer: {
          ...formData,
          division: currentDivisionObj.name,
          district: currentDistrictObj.name,
        },
        items,
        subtotal,
        deliveryFee,
        discount: discount === 9999 ? 0 : discount,
        total: totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'cod_verified' : 'paid',
        orderStatus: 'confirmed',
        timeline: [
          {
            status: 'confirmed',
            label: 'Order Confirmed',
            time: 'Just now',
            description: 'Order placed & scheduled for automated inventory allocation.',
            completed: true,
            current: true,
          },
          {
            status: 'quality_check',
            label: 'Quality Inspection',
            time: 'Pending next step',
            description: 'Item will undergo physical quality and packaging check.',
            completed: false,
          },
          {
            status: 'dispatched',
            label: 'Dispatched from Tejgaon Central Hub',
            time: 'Estimated tomorrow',
            description: 'Handover to dedicated courier partner.',
            completed: false,
          },
          {
            status: 'out_for_delivery',
            label: 'Out for Doorstep Delivery',
            time: currentDivisionObj.estimatedDelivery,
            description: 'Assigned rider with cash on delivery invoice.',
            completed: false,
          },
          {
            status: 'delivered',
            label: 'Delivered & Handed Over',
            time: 'Expected Soon',
            description: 'Package received by customer.',
            completed: false,
          },
        ],
      };

      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Checkout & Delivery Details
            </h2>
            <span className="text-xs text-stone-500 font-medium">· Cash on Delivery</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* User Account / Guest Notice */}
          {currentUser ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  লগইন আছেন: <strong className="font-semibold">{currentUser.displayName || currentUser.email}</strong>
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                অর্ডার একাউন্টে সেভ হবে
              </span>
            </div>
          ) : onOpenAuth ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950">
              <span>
                ⚡ এক ক্লিকে গুগল দিয়ে লগইন করুন (ঐচ্ছিক) অথবা নিচে তথ্য দিয়ে সরাসরি অর্ডার করুন:
              </span>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>লগইন করুন</span>
              </button>
            </div>
          ) : null}

          {/* Section 1: Customer Contact & Delivery Address in Bangladesh */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Recipient & Delivery Location
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ashikur Rahman"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:bg-white"
                />
                {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mobile Number (Active for Rider Call) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01712345678"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:bg-white font-mono"
                />
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Administrative Division <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.division}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:bg-white"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name} ({div.nameBn}) - ৳{div.deliveryFee} Shipping
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  District (64 Districts Available) <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:bg-white"
                >
                  {currentDivisionObj.districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name} ({dist.nameBn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Thana / Upazila / Area
                </label>
                <input
                  type="text"
                  value={formData.thana}
                  onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
                  placeholder={`e.g. ${currentDistrictObj.popularThanas.slice(0, 3).join(', ')}...`}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Street Address (House, Road, Area, Landmark) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  placeholder="House 14, Road 7, Block C, Dhanmondi, Dhaka"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:bg-white"
                />
                {errors.fullAddress && <p className="text-[11px] text-rose-600 mt-1">{errors.fullAddress}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Select Payment Method
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Cash on Delivery */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'cod'
                    ? 'border-amber-800 bg-amber-50/50 shadow-xs'
                    : 'border-stone-300 hover:border-stone-400 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-amber-800 focus:ring-amber-800"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">Cash on Delivery (COD)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Recommended</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                    Zero advance payment required. Inspect parcel & pay rider directly in cash upon delivery.
                  </p>
                </div>
              </label>

              {/* bKash */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-600 bg-pink-50/40 shadow-xs'
                    : 'border-stone-300 hover:border-stone-400 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="mt-1 text-pink-600 focus:ring-pink-600"
                />
                <div>
                  <span className="text-xs font-bold text-stone-900">bKash (Send Money / Payment)</span>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                    bKash Number: <strong className="text-pink-700 font-mono text-xs">{contactInfo?.bkash || '01350292697'}</strong>
                  </p>
                </div>
              </label>

              {/* Nagad */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'nagad'
                    ? 'border-orange-600 bg-orange-50/40 shadow-xs'
                    : 'border-stone-300 hover:border-stone-400 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'nagad'}
                  onChange={() => setPaymentMethod('nagad')}
                  className="mt-1 text-orange-600 focus:ring-orange-600"
                />
                <div>
                  <span className="text-xs font-bold text-stone-900">Nagad Payment</span>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                    Nagad Number: <strong className="text-orange-700 font-mono text-xs">{contactInfo?.nagad || '01350292697'}</strong>
                  </p>
                </div>
              </label>

              {/* Rocket */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'rocket'
                    ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                    : 'border-stone-300 hover:border-stone-400 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'rocket'}
                  onChange={() => setPaymentMethod('rocket')}
                  className="mt-1 text-purple-600 focus:ring-purple-600"
                />
                <div>
                  <span className="text-xs font-bold text-stone-900">Rocket (DBBL)</span>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                    Rocket Number: <strong className="text-purple-700 font-mono text-xs">{contactInfo?.rocket || '01410556740'}</strong>
                  </p>
                </div>
              </label>

            </div>

            {/* MFS Payment Input Details if non-COD */}
            {paymentMethod !== 'cod' && (
              <div className="mt-4 p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3 animate-in fade-in">
                <div className="p-2.5 bg-white rounded-lg border border-stone-300 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 block text-[11px]">Send ৳{totalAmount.toLocaleString()} to:</span>
                    <strong className="text-stone-900 font-mono text-sm">
                      {paymentMethod === 'rocket' ? '01410556740' : '01350292697'}
                    </strong>
                    <span className="text-[11px] text-stone-500 ml-2">({paymentMethod.toUpperCase()})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const num = paymentMethod === 'rocket' ? '01410556740' : '01350292697';
                      navigator.clipboard.writeText(num);
                    }}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-semibold border border-stone-300 transition-colors"
                  >
                    Copy Number
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      placeholder={`Your ${paymentMethod.toUpperCase()} Account Number`}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:outline-none"
                    />
                    {errors.mfsNumber && <p className="text-[11px] text-rose-600 mt-0.5">{errors.mfsNumber}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={bkashTrxId}
                      onChange={(e) => setBkashTrxId(e.target.value.toUpperCase())}
                      placeholder="Transaction ID (e.g. 9J4K28MN)"
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:outline-none font-mono uppercase"
                    />
                    {errors.trxId && <p className="text-[11px] text-rose-600 mt-0.5">{errors.trxId}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Order Review Summary */}
          <div className="pt-4 border-t border-stone-200 bg-stone-50 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              Order Breakdown ({items.length} items)
            </h4>

            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono tabular-nums text-stone-900">৳{subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && discount !== 9999 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Voucher Discount</span>
                  <span className="font-mono tabular-nums">-৳{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping ({currentDivisionObj.name})</span>
                <span className="font-mono tabular-nums">
                  {deliveryFee === 0 ? <strong className="text-emerald-700 font-normal">FREE</strong> : `৳${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Grand Total to Pay</span>
                <span className="font-mono tabular-nums text-base">৳{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'cod' ? 'Confirm Cash on Delivery Order' : 'Complete Online Payment'}
                  </span>
                </>
              )}
            </motion.button>
          </div>

        </form>

      </motion.div>
    </div>
  );
};
