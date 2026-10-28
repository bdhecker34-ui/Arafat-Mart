import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Sparkles, 
  Truck, 
  Tag, 
  Copy, 
  Check, 
  MessageCircle, 
  ArrowRight, 
  X,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

interface AnimatedNoticeBoxProps {
  noticeText?: string;
  linkText?: string;
  linkUrl?: string;
  whatsappNumber?: string;
  language?: 'bn' | 'en';
  onTrackOrder?: () => void;
  onShopNow?: () => void;
}

export const AnimatedNoticeBox: React.FC<AnimatedNoticeBoxProps> = ({
  noticeText,
  linkText,
  linkUrl,
  whatsappNumber = '01410556747',
  language = 'bn',
  onTrackOrder,
  onShopNow,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const cleanWhatsApp = whatsappNumber.replace(/\D/g, '') || '01410556747';
  const whatsappUrl = `https://wa.me/88${cleanWhatsApp}?text=${encodeURIComponent('আসসালামু আলাইকুম, Easy Mart থেকে পণ্য সম্পর্কে জানতে চাচ্ছি।')}`;

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('EASY10');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  if (isDismissed) return null;

  const defaultNoticeBn = "সারাদেশে ৬৪ জেলায় দ্রুত ক্যাশ অন ডেলিভারি চালু আছে! যেকোনো পণ্য ডেলিভারি ম্যানের সামনে দেখে নেওয়ার ১০০% নিশ্চয়তা এবং ৳১,৯৯৯+ অর্ডারে পাচ্ছেন সম্পূর্ণ ফ্রি হোম ডেলিভারি।";
  const defaultNoticeEn = "Cash on delivery active across all 64 districts! Inspect your products upon arrival with 100% genuine quality guarantee. Free nationwide shipping on orders over ৳1,999.";

  const activeNotice = noticeText?.trim() || (language === 'bn' ? defaultNoticeBn : defaultNoticeEn);

  return (
    <AnimatePresence>
      <motion.div
        data-purpose="animated-category-notice-box"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative my-6"
      >
        {/* Soft Ambient Glow under the box */}
        <div 
          aria-hidden="true" 
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 opacity-20 blur-xl -z-10 animate-border-glow pointer-events-none"
        />

        {/* Outer Rounded Container with 2.5px padding to reveal the Animated Motion Graphic Border */}
        <div className="relative rounded-2xl sm:rounded-3xl p-[2.5px] overflow-hidden shadow-xl shadow-orange-500/10 dark:shadow-orange-950/20">
          
          {/* Animated Motion Graphic Rotating Border (conic-gradient sweeping around the edges) */}
          <div 
            aria-hidden="true"
            className="absolute -inset-[120%] animate-border-spin pointer-events-none opacity-90"
            style={{
              background: 'conic-gradient(from 0deg, #f36805 0%, #fb923c 15%, #facc15 30%, #ec4899 50%, #8b5cf6 70%, #06b6d4 85%, #f36805 100%)'
            }}
          />

          {/* Inner Content Card (High contrast, rounded corners inside) */}
          <div className="relative z-10 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-[calc(1rem-1px)] sm:rounded-[calc(1.5rem-1px)] p-4 sm:p-5 text-stone-800 dark:text-stone-100 transition-colors">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left Side: Animated Badge & Message */}
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                
                {/* Notice Icon with Pulsing Effect */}
                <div className="relative shrink-0 mt-0.5 sm:mt-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
                    <Bell className="w-5 h-5 animate-subtle-float" />
                  </div>
                  {/* Blinking Live Indicator */}
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-stone-900"></span>
                  </span>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      <Sparkles className="w-3 h-3" />
                      {language === 'bn' ? 'জরুরি নোটিশ ও অফার' : 'Special Notice & Offers'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Truck className="w-3.5 h-3.5" />
                      {language === 'bn' ? 'সারাদেশে ক্যাশ অন ডেলিভারি' : 'Cash on Delivery Nationwide'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200 leading-snug">
                    {activeNotice}
                  </p>
                </div>
              </div>

              {/* Right Side: Quick Action Chips & Dismiss Button */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                
                {/* Coupon Copy Chip */}
                <button
                  type="button"
                  onClick={handleCopyCoupon}
                  title="Click to copy coupon EASY10"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all cursor-pointer select-none active:scale-95"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>EASY10</span>
                  {copiedCoupon ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> কপিড!
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 opacity-60" />
                  )}
                </button>

                {/* Track Order CTA */}
                {onTrackOrder && (
                  <button
                    type="button"
                    onClick={onTrackOrder}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                  >
                    <PackageCheck className="w-3.5 h-3.5 text-orange-500" />
                    <span>{language === 'bn' ? 'ট্র্যাক করুন' : 'Track Order'}</span>
                  </button>
                )}

                {/* WhatsApp Support CTA */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
                </a>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  aria-label="Dismiss notice"
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
