import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  ShoppingBag, 
  Zap, 
  Heart,
  Share2,
  Copy,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshDistricts';
import { MOCK_REVIEWS } from '../data/products';
import { motion } from 'motion/react';
import { getProductShareUrl } from './ProductShareModal';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  onInstantBuy: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onOpenShare?: (product: Product) => void;
  language?: 'bn' | 'en';
  onToast?: (message: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onInstantBuy,
  isWishlisted,
  onToggleWishlist,
  onOpenShare,
  language = 'bn',
  onToast,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes ? product.sizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors ? product.colors[0] : undefined
  );
  const [selectedDivision, setSelectedDivision] = useState('dhaka');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [copiedLink, setCopiedLink] = useState(false);

  const primaryTitle = language === 'bn' ? (product.titleBn || product.title) : product.title;
  const secondaryTitle = language === 'bn' ? (product.titleBn ? product.title : null) : product.titleBn;

  const currentDivision = BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivision) || BANGLADESH_DIVISIONS[0];
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const shareUrl = getProductShareUrl(product.id);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
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
      setCopiedLink(true);
      if (onToast) {
        onToast(language === 'bn' ? 'প্রোডাক্টের লিংক কপি করা হয়েছে!' : 'Product link copied to clipboard!');
      }
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn('Copy error:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const text = language === 'bn'
      ? `🛍️ Easy Mart-এ দেখুন: ${primaryTitle}\n💰 দাম: ৳${product.price.toLocaleString()} টাকা\n🚚 সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি!\n👉 বিস্তারিত ও অর্ডার লিংক: ${shareUrl}`
      : `🛍️ Check out this deal on Easy Mart: ${primaryTitle}\n💰 Price: ৳${product.price.toLocaleString()}\n🚚 Nationwide Cash on Delivery!\n👉 Order Link: ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors duration-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-850/80">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 truncate mr-2">
            <span className="capitalize">{product.category.replace('-', ' & ')}</span>
            <span aria-hidden="true">/</span>
            <span className="text-stone-800 dark:text-stone-200 font-medium truncate max-w-xs">{primaryTitle}</span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Top Bar Share Trigger Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => onOpenShare ? onOpenShare(product) : handleCopyLink()}
              title={language === 'bn' ? 'প্রোডাক্ট লিংক শেয়ার করুন' : 'Share Product Link'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden sm:inline">
                {language === 'bn' ? 'শেয়ার করুন' : 'Share'}
              </span>
            </motion.button>

            <button
              onClick={onClose}
              aria-label="Close product view"
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column: Image Stage */}
            <div className="md:col-span-6 flex flex-col">
              <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-square group" style={{ aspectRatio: '1 / 1' }}>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                  style={{ aspectRatio: '1 / 1' }}
                />
                {product.badge && (
                  <div className="absolute top-3 left-3 bg-stone-900 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Trust Badges Bar */}
              <div className="mt-4 p-3.5 bg-[#f7f3ea] rounded-xl border border-stone-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="flex flex-col items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1" />
                  <span className="font-semibold text-stone-800 text-[11px]">Quality Checked</span>
                  <span className="text-[10px] text-stone-500">Pre-dispatch check</span>
                </div>
                <div className="flex flex-col items-center justify-center border-x border-stone-300/80 px-1">
                  <Truck className="w-4 h-4 text-amber-800 mb-1" />
                  <span className="font-semibold text-stone-800 text-[11px]">All 64 Districts</span>
                  <span className="text-[10px] text-stone-500">Doorstep delivery</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-stone-700 mb-1" />
                  <span className="font-semibold text-stone-800 text-[11px]">7-Day Return</span>
                  <span className="text-[10px] text-stone-500">Easy replacement</span>
                </div>
              </div>
            </div>

            {/* Right Column: Contiguous Purchase Module */}
            <div className="md:col-span-6 flex flex-col justify-between">
              <div>
                {/* Title & Bengali Translation */}
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
                  {product.title}
                </h2>
                {product.titleBn && (
                  <p className="text-sm text-stone-500 mt-0.5">{product.titleBn}</p>
                )}

                {/* Ratings & Stock */}
                <div className="mt-2.5 flex items-center gap-3 text-xs">
                  <div className="flex items-center text-amber-700 font-semibold">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500 mr-1 inline" />
                    <span>{product.rating}</span>
                    <span className="text-stone-400 font-normal ml-1">({product.reviewsCount} customer reviews)</span>
                  </div>
                  <span className="text-stone-300">·</span>
                  <div className="text-emerald-700 font-medium">
                    {product.inStock ? `${product.stockCount} Units Available` : 'Out of Stock'}
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-4 pb-4 border-b border-stone-200 flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-stone-900 font-mono tabular-nums">
                    ৳{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-stone-400 line-through font-mono tabular-nums">
                        ৳{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-sm">
                        Save ৳{(product.originalPrice - product.price).toLocaleString()} ({discountPercent}% OFF)
                      </span>
                    </>
                  )}
                </div>

                {/* Variants: Sizes */}
                {product.sizes && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-2">
                      <span>Select Size:</span>
                      <span className="text-stone-500 font-semibold">{selectedSize}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            selectedSize === size
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                              : 'bg-stone-50 text-stone-700 border-stone-300 hover:border-stone-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants: Colors */}
                {product.colors && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-2">
                      <span>Select Shade / Color:</span>
                      <span className="text-stone-500 font-semibold">{selectedColor}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            selectedColor === color
                              ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                              : 'bg-stone-50 text-stone-700 border-stone-300 hover:border-stone-400'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper */}
                <div className="mt-5 flex items-center gap-4">
                  <span className="text-xs font-medium text-stone-700">Quantity:</span>
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-stone-600 hover:bg-stone-200 text-sm font-semibold transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-xs font-bold text-stone-800 font-mono tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                      className="px-3 py-1 text-stone-600 hover:bg-stone-200 text-sm font-semibold transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Instant Action CTA Buttons with Tapping Animation */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onAddToCart(product, quantity, selectedSize, selectedColor)}
                    className="flex-1 py-3 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 text-xs font-bold rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{language === 'bn' ? 'ব্যাগে যোগ করুন' : 'Add to Bag'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onInstantBuy(product, quantity, selectedSize, selectedColor)}
                    className="flex-1 py-3 px-4 bg-amber-800 hover:bg-amber-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>{language === 'bn' ? 'ক্যাশ অন ডেলিভারি অর্ডার' : 'Cash on Delivery Order'}</span>
                  </motion.button>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => onToggleWishlist(product)}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        isWishlisted
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                          : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      aria-label="Add to wishlist"
                      title={language === 'bn' ? 'পছন্দের তালিকায় রাখুন' : 'Save to wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onOpenShare ? onOpenShare(product) : handleCopyLink()}
                      className="p-3 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      aria-label="Share product"
                      title={language === 'bn' ? 'প্রোডাক্ট লিংক শেয়ার করুন' : 'Share product link'}
                    >
                      <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Quick Share Strip */}
                <div className="mt-4 p-3 bg-stone-100/90 dark:bg-stone-800/90 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300">
                    <Share2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{language === 'bn' ? 'অন্যকে লিঙ্ক পাঠান:' : 'Share Link:'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 1-Click Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        copiedLink
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />}
                      <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
                    </button>

                    {/* Quick WhatsApp Share */}
                    <button
                      onClick={handleShareWhatsApp}
                      className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Share to WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </button>

                    {/* More Share Options */}
                    {onOpenShare && (
                      <button
                        onClick={() => onOpenShare(product)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title={language === 'bn' ? 'আরও শেয়ার অপশন' : 'More share options'}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="hidden sm:inline">{language === 'bn' ? 'আরও' : 'More'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Nationwide Delivery Calculator Box */}
                <div className="mt-5 p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>{language === 'bn' ? 'আপনার বিভাগে ডেলিভারি চেক করুন:' : 'Check Shipping to Your Division:'}</span>
                    </span>
                    <select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded px-2 py-0.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
                    >
                      {BANGLADESH_DIVISIONS.map((div) => (
                        <option key={div.id} value={div.id} className="dark:bg-stone-900 dark:text-stone-100">
                          {language === 'bn' ? div.nameBn : div.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                    <span>
                      {language === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'} <strong className="text-stone-900 dark:text-stone-100">৳{currentDivision.deliveryFee}</strong>
                    </span>
                    <span>
                      {language === 'bn' ? 'আনুমানিক সময়:' : 'Estimated:'} <strong className="text-stone-900 dark:text-stone-100">{currentDivision.estimatedDelivery}</strong>
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Bottom Tabs: Description, Specs, Reviews */}
          <div className="mt-10 border-t border-stone-200 pt-6">
            <div className="flex items-center gap-6 border-b border-stone-200 pb-3 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'specs' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'reviews' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Customer Reviews ({product.reviewsCount})
              </button>
            </div>

            <div className="mt-4 text-xs text-stone-700 leading-relaxed">
              {activeTab === 'details' && (
                <div className="space-y-3">
                  <p>{product.description}</p>
                  <div className="mt-3">
                    <h4 className="font-semibold text-stone-900 mb-1.5">Key Highlights:</h4>
                    <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                      {product.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="divide-y divide-stone-200 border border-stone-200 rounded-lg overflow-hidden">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-2 p-2.5 bg-stone-50/50 odd:bg-white text-xs">
                      <span className="font-medium text-stone-600">{key}</span>
                      <span className="text-stone-900 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {MOCK_REVIEWS.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">{rev.author}</span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-500">{rev.location}</span>
                        </div>
                        <span className="text-[11px] text-stone-400">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 my-1.5 text-amber-600">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                        {rev.verified && (
                          <span className="ml-2 text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="text-stone-600">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
