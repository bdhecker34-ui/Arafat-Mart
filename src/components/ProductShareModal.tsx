import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  Send, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProductShareModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  language?: 'bn' | 'en';
  onToast?: (message: string) => void;
}

export const getProductShareUrl = (productId: string): string => {
  if (typeof window === 'undefined') return `?product=${productId}`;
  const url = new URL(window.location.href);
  url.searchParams.set('product', productId);
  return url.toString();
};

export const ProductShareModal: React.FC<ProductShareModalProps> = ({
  product,
  isOpen,
  onClose,
  language = 'bn',
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const shareUrl = getProductShareUrl(product.id);
  const displayTitle = language === 'bn' ? (product.titleBn || product.title) : product.title;

  // Pre-formatted share messages
  const shareText = language === 'bn'
    ? `🛍️ Easy Mart-এ দুর্দান্ত অফারে দেখুন: ${displayTitle}\n💰 দাম: ৳${product.price.toLocaleString()} টাকা\n🚚 সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি!\n👉 অর্ডার লিংক: ${shareUrl}`
    : `🛍️ Check out this deal on Easy Mart: ${displayTitle}\n💰 Price: ৳${product.price.toLocaleString()}\n🚚 Nationwide Cash on Delivery!\n👉 Order Link: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers or non-https iframe
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      if (onToast) {
        onToast(language === 'bn' ? 'প্রোডাক্টের লিংক কপি করা হয়েছে!' : 'Product link copied to clipboard!');
      }
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy link error:', err);
    }
  };

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Facebook Share
  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(displayTitle)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  // Telegram Share
  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(displayTitle)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  // Native Web Share API (Mobile Devices)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User dismissed or share error
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-xs">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                  <span>{language === 'bn' ? 'প্রোডাক্ট লিংক শেয়ার করুন' : 'Share Product Link'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <p className="text-[11px] text-stone-300">
                  {language === 'bn' ? 'যেকোনো মানুষের কাছে এই প্রোডাক্টের ডিরেক্ট লিংক পাঠান' : 'Send this direct product link to anyone'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close share dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            
            {/* Product Mini Preview Card */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center gap-3">
              <img
                src={product.image}
                alt={displayTitle}
                className="w-16 h-16 object-cover rounded-xl border border-stone-200 dark:border-stone-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 block truncate">
                  {product.category.replace('-', ' & ')}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {displayTitle}
                </h4>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100 font-mono">
                    ৳{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 line-through font-mono">
                      ৳{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct URL Input & Copy Button */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {language === 'bn' ? 'ডিরেক্ট শেয়ার লিংক:' : 'Direct Share Link:'}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full pl-3 pr-8 py-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-800 dark:text-stone-200 select-all focus:outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-amber-400 shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{language === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Quick Share Platforms */}
            <div>
              <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                {language === 'bn' ? 'সোশ্যাল মিডিয়ায় এক ক্লিকে পাঠান:' : 'Share Directly To:'}
              </div>
              <div className="grid grid-cols-3 gap-2">
                
                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-emerald-800 dark:text-emerald-300 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-xs">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-xs font-bold">WhatsApp</span>
                  <span className="text-[9px] text-stone-500 dark:text-stone-400">
                    {language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'Chat'}
                  </span>
                </button>

                {/* Facebook */}
                <button
                  onClick={handleShareFacebook}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-blue-800 dark:text-blue-300 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-xs">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold">Facebook</span>
                  <span className="text-[9px] text-stone-500 dark:text-stone-400">
                    {language === 'bn' ? 'ফেসবুক' : 'Feed'}
                  </span>
                </button>

                {/* Telegram */}
                <button
                  onClick={handleShareTelegram}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-sky-800 dark:text-sky-300 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#229ED9] text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-xs">
                    <Send className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-xs font-bold">Telegram</span>
                  <span className="text-[9px] text-stone-500 dark:text-stone-400">
                    {language === 'bn' ? 'টেলিগ্রাম' : 'Direct'}
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile Native Share Button */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{language === 'bn' ? 'ফোনের অন্যান্য অ্যাপে শেয়ার করুন' : 'More App Options (Share)'}</span>
              </button>
            )}

            {/* Helpful Notice */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">💡</span>
              <p>
                {language === 'bn'
                  ? 'এই লিংকে যে কেউ ক্লিক করলেই সরাসরি ওয়েবসাইটে এসে ঠিক এই প্রোডাক্টটি ওপেন হবে এবং সেখান থেকে সরাসরি অর্ডার করতে পারবে।'
                  : 'Anyone who clicks this link will arrive directly at this specific product page on Easy Mart to view details and place an order immediately.'}
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
