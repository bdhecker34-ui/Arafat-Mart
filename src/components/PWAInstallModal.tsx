/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Smartphone,
  CheckCircle2,
  Zap,
  Package,
  Bell,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  MoreVertical,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  language?: 'bn' | 'en';
  /**
   * Optional force-open trigger (e.g. from header dropdown menu)
   */
  isOpenManual?: boolean;
  onCloseManual?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  language = 'bn',
  isOpenManual = false,
  onCloseManual,
}) => {
  const {
    isInstalled,
    isPromptReady,
    isIOS,
    isAndroid,
    canShowAutoPopup,
    dismissPopup,
    triggerInstall,
  } = usePWAInstall();

  const [isOpen, setIsOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<'none' | 'ios' | 'android' | 'desktop'>('none');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Auto-trigger popup after initial delay on first visit
  useEffect(() => {
    if (isInstalled) return;

    // Manual override from parent component
    if (isOpenManual) {
      setIsOpen(true);
      return;
    }

    if (!canShowAutoPopup()) return;

    // 3.5 seconds delay after initial page load
    const timer = setTimeout(() => {
      if (canShowAutoPopup()) {
        setIsOpen(true);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [isInstalled, canShowAutoPopup, isOpenManual]);

  // Synchronize manual open prop
  useEffect(() => {
    if (isOpenManual) {
      setIsOpen(true);
      setActiveGuide('none');
    }
  }, [isOpenManual]);

  const handleClose = () => {
    setIsOpen(false);
    setActiveGuide('none');
    if (onCloseManual) onCloseManual();
  };

  const handleNotNow = () => {
    // Snooze for 24 hours
    dismissPopup(24);
    handleClose();
  };

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const result = await triggerInstall();

      if (result === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          handleClose();
          setInstallSuccess(false);
        }, 2200);
      } else if (result === 'guide_ios') {
        setActiveGuide('ios');
      } else if (result === 'guide_android') {
        setActiveGuide('android');
      } else if (result === 'guide_desktop') {
        setActiveGuide('desktop');
      }
    } finally {
      setIsInstalling(false);
    }
  };

  // If already installed and not manually forced, do not render
  if (isInstalled && !isOpenManual) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-stone-950/65 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden z-10 p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
          >
            {/* Top Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              aria-label="Close install popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success State */}
            {installSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-lg font-black text-stone-900 dark:text-white">
                  {language === 'bn' ? 'অ্যাপ সফলভাবে ইনস্টল হয়েছে!' : 'App Installed Successfully!'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {language === 'bn'
                    ? 'Easy Mart এখন আপনার হোম স্ক্রিনে যুক্ত রয়েছে। যেকোনো সময় সরাসরি ওপেন করুন।'
                    : 'Easy Mart is now added to your home screen. Enjoy instant shopping!'}
                </p>
              </div>
            ) : activeGuide === 'ios' ? (
              /* iOS Safari Installation Guide */
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                      {language === 'bn' ? 'iPhone / iPad-এ ইনস্টল করুন' : 'Install on iPhone / iPad'}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {language === 'bn' ? 'মাত্র ২টি সহজ ধাপে হোম স্ক্রিনে যোগ করুন:' : 'Add to home screen in 2 simple steps:'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
                    <div className="w-7 h-7 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      ১
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <span>সফারি ব্রাউজারের নিচে শেয়ার বাটনে ট্যাপ করুন</span>
                        <Share2 className="w-4 h-4 text-blue-500 inline" />
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        Safari-র নিচের নেভিগেশন বারে থাকা <strong>"Share"</strong> আইকনটিতে ক্লিক করুন।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      ২
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <span>"Add to Home Screen" অপশন সিলেক্ট করুন</span>
                        <PlusSquare className="w-4 h-4 text-emerald-500 inline" />
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        একটু নিচে স্ক্রল করে <strong>'Add to Home Screen'</strong> চাপুন এবং উপরে ডানে <strong>'Add'</strong> ট্যাপ করুন।
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setActiveGuide('none')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    {language === 'bn' ? 'ফিরে যান' : 'Back'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer text-center"
                  >
                    {language === 'bn' ? 'বুঝেছি' : 'Got it'}
                  </button>
                </div>
              </div>
            ) : activeGuide === 'android' ? (
              /* Android Chrome Manual Guide */
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                      {language === 'bn' ? 'Android Chrome-এ ইনস্টল করুন' : 'Install on Android Chrome'}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {language === 'bn' ? 'ক্রোম ব্রাউজার মেনু থেকে ইনস্টল করার নিয়ম:' : 'How to install via Chrome menu:'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
                    <div className="w-7 h-7 rounded-xl bg-stone-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      ১
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <span>ক্রোমের উপরে ডানদিকের তিনটি ডট মেনু (⋮) ট্যাপ করুন</span>
                        <MoreVertical className="w-3.5 h-3.5 text-stone-400 inline" />
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        ব্রাউজারের অ্যাড্রেস বারের পাশে থাকা ৩টি ডট আইকনে চাপুন।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      ২
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <span>"Install app" অথবা "Add to Home screen" চাপুন</span>
                        <Download className="w-3.5 h-3.5 text-emerald-500 inline" />
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        মেনু তালিকায় <strong>'Install app'</strong> বা <strong>'হোম স্ক্রিনে যোগ করুন'</strong> অপশনটি বেছে নিয়ে কনফার্ম করুন।
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setActiveGuide('none')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    {language === 'bn' ? 'ফিরে যান' : 'Back'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer text-center"
                  >
                    {language === 'bn' ? 'বুঝেছি' : 'Got it'}
                  </button>
                </div>
              </div>
            ) : (
              /* Default Main Install Offer Popup */
              <>
                {/* Header with App Logo & Verified Badge */}
                <div className="flex items-center gap-3.5 pr-6">
                  <div className="relative shrink-0">
                    <img
                      src="./assets/images/easy_mart_logo.png"
                      alt="Easy Mart App"
                      className="w-14 h-14 rounded-2xl object-contain bg-white dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700 shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=120&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2
                        id="pwa-install-title"
                        className="text-base sm:text-lg font-black text-stone-900 dark:text-white leading-tight"
                      >
                        Easy Mart
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40">
                        Official App
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {language === 'bn' ? 'সবকিছু, এক ঠিকানায়।' : 'Everything in one place.'}
                    </p>
                  </div>
                </div>

                {/* Engaging Value Proposition Message */}
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 leading-snug">
                    {language === 'bn'
                      ? 'সেরা শপিং অভিজ্ঞতার জন্য Easy Mart অ্যাপটি ফোনে যুক্ত করুন'
                      : 'Get the official Easy Mart app for the fastest shopping experience'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {language === 'bn'
                      ? 'সহজেই কোনো ঝামেলা ছাড়াই অর্ডার ট্র্যাক করুন, এক্সক্লুসিভ ডিসকাউন্ট পান এবং কোনো মেগাবাইট খরচ ছাড়া তাৎক্ষণিক পণ্য ব্রাউজ করুন।'
                      : 'Track orders in real time, unlock exclusive coupon discounts, and enjoy a lightning-fast native shopping app.'}
                  </p>
                </div>

                {/* Feature Value Badges */}
                <div className="grid grid-cols-3 gap-2 py-1">
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-center space-y-1">
                    <Zap className="w-4 h-4 text-amber-500 mx-auto" />
                    <div className="text-[10px] font-bold text-stone-800 dark:text-stone-200">
                      {language === 'bn' ? 'সুপারফাস্ট' : 'Superfast'}
                    </div>
                    <div className="text-[9px] text-stone-400">
                      {language === 'bn' ? 'জিরো ল্যাগ' : 'Zero lag'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-center space-y-1">
                    <Package className="w-4 h-4 text-emerald-500 mx-auto" />
                    <div className="text-[10px] font-bold text-stone-800 dark:text-stone-200">
                      {language === 'bn' ? 'ট্র্যাকিং' : 'Tracking'}
                    </div>
                    <div className="text-[9px] text-stone-400">
                      {language === 'bn' ? 'লাইভ আপডেট' : 'Live status'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-center space-y-1">
                    <Bell className="w-4 h-4 text-blue-500 mx-auto" />
                    <div className="text-[10px] font-bold text-stone-800 dark:text-stone-200">
                      {language === 'bn' ? 'অফার অ্যালার্ট' : 'Offers'}
                    </div>
                    <div className="text-[9px] text-stone-400">
                      {language === 'bn' ? 'বিশেষ ছাড়' : 'Secret deals'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Install App & Not Now */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isInstalling
                        ? language === 'bn'
                          ? 'প্রক্রিয়াধীন...'
                          : 'Processing...'
                        : language === 'bn'
                        ? 'Install App (অ্যাপ ইনস্টল করুন)'
                        : 'Install App'}
                    </span>
                  </button>

                  <div className="flex items-center justify-between px-1 pt-1">
                    <button
                      onClick={handleNotNow}
                      className="text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors py-1 px-2 cursor-pointer"
                    >
                      {language === 'bn' ? 'Not Now (এখন নয়)' : 'Not Now'}
                    </button>

                    <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{language === 'bn' ? 'নিরাপদ ও হালকা সাইজ (< 1MB)' : 'Safe & lightweight (< 1MB)'}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
