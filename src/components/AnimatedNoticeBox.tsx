import React from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Sparkles, 
  Truck
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
  language = 'bn',
}) => {
  const defaultNoticeBn = "সারাদেশে ৬৪ জেলায় দ্রুত ক্যাশ অন ডেলিভারি চালু আছে! যেকোনো পণ্য ডেলিভারি ম্যানের সামনে দেখে নেওয়ার ১০০% নিশ্চয়তা এবং ৳১,৯৯৯+ অর্ডারে পাচ্ছেন সম্পূর্ণ ফ্রি হোম ডেলিভারি।";
  const defaultNoticeEn = "Cash on delivery active across all 64 districts! Inspect your products upon arrival with 100% genuine quality guarantee. Free nationwide shipping on orders over ৳1,999.";

  const activeNotice = noticeText?.trim() || (language === 'bn' ? defaultNoticeBn : defaultNoticeEn);

  return (
    <motion.div
      data-purpose="animated-category-notice-box"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
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
        <div className="relative z-10 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-[calc(1rem-1px)] sm:rounded-[calc(1.5rem-1px)] p-4 sm:p-6 text-stone-800 dark:text-stone-100 transition-colors">
          
          <div className="flex items-center sm:items-start md:items-center gap-3.5 sm:gap-4.5">
            
            {/* Notice Icon with Pulsing Effect */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 animate-subtle-float" />
              </div>
              {/* Blinking Live Indicator */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-stone-900"></span>
              </span>
            </div>

            {/* Notification Text Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'জরুরি নোটিশ' : 'Important Notice'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Truck className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                </span>
              </div>

              {/* Large, clearly readable notification text */}
              <p className="text-sm sm:text-base md:text-lg font-semibold text-stone-800 dark:text-stone-100 leading-relaxed tracking-normal">
                {activeNotice}
              </p>
            </div>

          </div>

        </div>
      </div>
    </motion.div>
  );
};
