import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  X, 
  Truck, 
  Phone, 
  User as UserIcon,
  Menu,
  ChevronRight,
  LayoutGrid,
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  Package,
  Sun,
  Moon,
  Globe,
  HeartHandshake,
  Users,
  MessageSquare,
  Download
} from 'lucide-react';
import { ProductCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export interface HeaderCategoryItem {
  id: ProductCategory;
  label: string;
  nameBn?: string;
}

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  categories?: HeaderCategoryItem[];
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenTrackOrder: () => void;
  onOpenSmartBudget?: () => void;
  onOpenCustomerWishModal?: () => void;
  onOpenFeed?: () => void;
  onOpenInstallApp?: () => void;
  onOpenAdmin?: () => void;
  currentUser?: { displayName?: string | null; email?: string | null; uid?: string } | null;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  activeCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  noticeText?: string;
  noticeEnabled?: boolean;
  whatsappNumber?: string;
  storeName?: string;
  language?: 'bn' | 'en';
  onToggleLanguage?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  wishlistCount,
  categories,
  onOpenCart,
  onOpenWishlist,
  onOpenTrackOrder,
  onOpenSmartBudget,
  onOpenCustomerWishModal,
  onOpenFeed,
  onOpenInstallApp,
  onOpenAdmin,
  currentUser,
  onOpenAuth,
  onOpenAccount,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  noticeText,
  noticeEnabled = true,
  whatsappNumber = '01410556747',
  storeName = 'Easy Mart',
  language = 'bn',
  onToggleLanguage,
  theme = 'light',
  onToggleTheme,
}) => {
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Dynamic Categories matching the Product Section
  const activeCategoriesList = categories && categories.length > 0 ? categories : [
    { id: 'all' as ProductCategory, label: 'All Products', nameBn: 'সব প্রোডাক্ট' },
    { id: 'fashion' as ProductCategory, label: 'Fashion & Apparel', nameBn: 'ফ্যাশন ও পোশাক' },
    { id: 'gadgets' as ProductCategory, label: 'Tech & Gadgets', nameBn: 'প্রযুক্তি ও গ্যাজেটস' },
    { id: 'home-kitchen' as ProductCategory, label: 'Home & Kitchen', nameBn: 'হোম ও কিচেন' },
    { id: 'beauty-care' as ProductCategory, label: 'Beauty & Wellness', nameBn: 'সৌন্দর্য ও যত্ন' },
  ];

  const getCategoryDropdownMeta = (categoryId: string) => {
    switch (categoryId) {
      case 'all':
        return {
          icon: <LayoutGrid className="w-4 h-4" />,
          color: 'text-stone-700 bg-stone-100',
        };
      case 'fashion':
        return {
          icon: <Shirt className="w-4 h-4" />,
          color: 'text-amber-700 bg-amber-100',
        };
      case 'gadgets':
        return {
          icon: <Smartphone className="w-4 h-4" />,
          color: 'text-blue-700 bg-blue-100',
        };
      case 'home-kitchen':
        return {
          icon: <Home className="w-4 h-4" />,
          color: 'text-emerald-700 bg-emerald-100',
        };
      case 'beauty-care':
        return {
          icon: <Sparkles className="w-4 h-4" />,
          color: 'text-pink-700 bg-pink-100',
        };
      default:
        return {
          icon: <Package className="w-4 h-4" />,
          color: 'text-stone-700 bg-stone-100',
        };
    }
  };

  const bannerText = noticeText || 'Cash on Delivery Across All 64 Districts in Bangladesh · Free Nationwide Delivery on orders over ৳1,999';

  return (
    <header className="sticky top-0 z-40 bg-[#f7f3ea]/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors duration-200">
      {/* Dismissible Top Notification Banner */}
      {showTopBanner && noticeEnabled && (
        <div className="bg-stone-900 text-stone-200 text-xs px-4 py-2 flex items-center justify-between">
          <div className="mx-auto flex items-center gap-3 text-center truncate">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {bannerText}
            </span>
            <span className="text-stone-500 hidden md:inline">·</span>
            <a
              href={`https://wa.me/88${whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline text-amber-300 hover:text-amber-200 font-medium font-mono"
            >
              WhatsApp: {whatsappNumber}
            </a>
          </div>
          <button
            onClick={() => setShowTopBanner(false)}
            aria-label="Close promotion banner"
            className="text-stone-400 hover:text-white p-1 shrink-0 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation Bar: Strict 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 min-h-[86px] sm:min-h-[96px] py-2">
          
          {/* Zone 1: Three-line Menu Button + Logo shifted slightly to the right */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Three-line Menu Button & Interactive Dropdown */}
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={isMenuOpen}
                title={language === 'bn' ? 'মেনু ও সেটিংস' : 'Menu & Settings'}
                className={`flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl transition-all border cursor-pointer ${
                  isMenuOpen
                    ? 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 border-stone-900 dark:border-amber-500 shadow-md ring-2 ring-stone-900/20'
                    : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border-stone-300 dark:border-stone-700 shadow-xs'
                }`}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-current transition-transform duration-200" />
                ) : (
                  <Menu className="w-5 h-5 text-current transition-transform duration-200" />
                )}
                <span className="hidden sm:inline text-xs font-bold tracking-tight">
                  {language === 'bn' ? 'মেনু' : 'Menu'}
                </span>
              </motion.button>

              {/* Animated Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2.5 w-[310px] sm:w-[350px] bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 z-50 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800"
                  >
                    {/* Dropdown Header */}
                    <div className="p-3.5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 dark:from-black dark:to-stone-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="./assets/images/easy_mart_logo.png"
                          alt="Easy Mart Logo"
                          className="w-7 h-7 object-contain rounded-lg bg-black p-0.5 border border-stone-700 shadow-xs"
                        />
                        <div>
                          <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                            <span>{language === 'bn' ? 'Easy Mart মেনু' : 'Easy Mart Menu'}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          </h4>
                          <p className="text-[10px] text-amber-300">
                            {language === 'bn' ? 'সবকিছু, এক ঠিকানায়।' : 'Everything in one place.'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
                        aria-label="Close menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dynamic Categories List matching Product Section */}
                    <div className="p-2 space-y-1 max-h-[260px] overflow-y-auto">
                      <div className="px-2.5 py-1 text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center justify-between">
                        <span>{language === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories'}</span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal">
                          {language === 'bn' ? 'পণ্য ব্রাউজ করুন' : 'Browse Products'}
                        </span>
                      </div>
                      {activeCategoriesList.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        const meta = getCategoryDropdownMeta(cat.id);
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              onSelectCategory(cat.id);
                              setIsMenuOpen(false);
                              const el = document.getElementById('catalog-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all text-xs font-semibold cursor-pointer ${
                              isActive
                                ? 'bg-stone-900 text-white shadow-xs'
                                : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-amber-400 text-stone-950 font-bold' : meta.color}`}>
                                {meta.icon}
                              </div>
                              <div>
                                <div className="font-bold">{cat.label}</div>
                                {cat.nameBn && (
                                  <div className={`text-[10px] ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                                    {cat.nameBn}
                                  </div>
                                )}
                              </div>
                            </div>
                            {isActive ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-stone-950">
                                সিলেক্টেড
                              </span>
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Featured Smart Budget Shopping Option */}
                    {onOpenSmartBudget && (
                      <div className="p-2 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-t border-b border-amber-200/60 dark:border-amber-900/40">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenSmartBudget();
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-gradient-to-r from-stone-900 to-stone-850 hover:from-black hover:to-stone-900 text-white shadow-xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-white">Smart Budget Shopping</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-stone-950 uppercase tracking-wider">
                                  {language === 'bn' ? 'নতুন' : 'NEW'}
                                </span>
                              </div>
                              <div className="text-[10px] text-amber-300 font-medium">
                                {language === 'bn' ? 'বাজেট দিন, অটো পণ্য কম্বো নিন' : 'Set budget, get auto product bundles'}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </div>
                    )}

                    {/* Share Customer Wish / Product Request Option */}
                    {onOpenCustomerWishModal && (
                      <div className="p-2 bg-gradient-to-r from-rose-500/10 via-pink-400/5 to-transparent border-b border-rose-200/60 dark:border-rose-900/40">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenCustomerWishModal();
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-gradient-to-r from-stone-900 to-stone-850 hover:from-black hover:to-stone-900 text-white shadow-xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                              <HeartHandshake className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-white">
                                  {language === 'bn' ? 'উইশ বা পণ্যের আবদার জানান' : 'Share Your Wish / Request'}
                                </span>
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white uppercase tracking-wider">
                                  {language === 'bn' ? 'অনুরোধ' : 'Wish'}
                                </span>
                              </div>
                              <div className="text-[10px] text-rose-300 font-medium">
                                {language === 'bn' ? 'কাঙ্ক্ষিত পণ্যের আবদার সরাসরি অ্যাডমিনকে পাঠান' : 'Request any product you want us to stock'}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </div>
                    )}

                    {/* Easy Mart News Feed Option */}
                    {onOpenFeed && (
                      <div className="p-2 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent border-b border-emerald-200/60 dark:border-emerald-900/40">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenFeed();
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-gradient-to-r from-stone-900 to-stone-850 hover:from-black hover:to-stone-900 text-white shadow-xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-white">
                                  Easy Mart News Feed
                                </span>
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                                  {language === 'bn' ? 'নিউজ ফিড' : 'News Feed'}
                                </span>
                              </div>
                              <div className="text-[10px] text-emerald-300/90 font-medium">
                                {language === 'bn' ? 'কাস্টমার রিভিউ, ফটো ও অভিজ্ঞতা শেয়ার' : 'Customer reviews, photos & community stories'}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </div>
                    )}

                    {/* Quick Access Services */}
                    <div className="p-2 space-y-1 bg-stone-50/60">
                      <div className="px-2.5 py-1 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        দ্রুত সেবা ও একাউন্ট
                      </div>

                      {/* Track Order */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenTrackOrder();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-stone-700 hover:bg-white hover:shadow-xs transition-all border border-transparent hover:border-stone-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold">অর্ডার ট্র্যাক করুন</div>
                            <div className="text-[10px] text-stone-500">লাইভ ডেলিভারি স্ট্যাটাস ও হিস্ট্রি</div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>

                      {/* Wishlist */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenWishlist();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:shadow-xs transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-400">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold">{language === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400">
                              {language === 'bn' ? 'উইশলিস্টে সেভ করা আইটেম' : 'Saved wishlist items'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-400">
                          {wishlistCount}
                        </span>
                      </button>

                      {/* Cart */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenCart();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:shadow-xs transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold">{language === 'bn' ? 'শপিং ব্যাগ' : 'Shopping Bag'}</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400">
                              {cartTotal > 0 ? `৳${cartTotal.toLocaleString()}` : (language === 'bn' ? 'ব্যাগ খালি' : 'Empty')}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          {cartCount} {language === 'bn' ? 'টি' : 'items'}
                        </span>
                      </button>

                      {/* User Account / Auth */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (currentUser) {
                            onOpenAccount();
                          } else {
                            onOpenAuth();
                          }
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:shadow-xs transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold">
                              {currentUser ? (currentUser.displayName || (language === 'bn' ? 'আমার একাউন্ট' : 'My Account')) : (language === 'bn' ? 'কাস্টমার লগইন / সাইন আপ' : 'Customer Login / Sign Up')}
                            </div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400">
                              {currentUser ? (language === 'bn' ? 'ঠিকানা ও প্রোফাইল' : 'Profile & Orders') : (language === 'bn' ? 'নতুন একাউন্ট খুলুন' : 'Create new account')}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>

                      {/* Install Easy Mart PWA App */}
                      {onOpenInstallApp && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenInstallApp();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:shadow-xs transition-all border border-transparent hover:border-emerald-300/40 dark:hover:border-emerald-800/50 cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                <span>{language === 'bn' ? 'Easy Mart অ্যাপ ইনস্টল' : 'Install Easy Mart App'}</span>
                                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-600 text-white font-black rounded-full">
                                  PWA
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-500 dark:text-stone-400">
                                {language === 'bn' ? '১-ক্লিকে ফোনে অ্যাপ হিসেবে যুক্ত করুন' : 'Add to home screen for fast shopping'}
                              </div>
                            </div>
                          </div>
                          <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
                        </button>
                      )}
                    </div>

                    {/* Language & Dark/Light Mode Preferences Strip */}
                    <div className="p-3 bg-stone-100 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800 space-y-2.5">
                      <div className="text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>{language === 'bn' ? 'ভাষা ও ডিসপ্লে থিম' : 'Language & Display Theme'}</span>
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal">
                          {language === 'bn' ? 'সেটিংস' : 'Settings'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Language Switch: বাংলা / English */}
                        <div className="flex items-center p-0.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs">
                          <button
                            onClick={() => onToggleLanguage && language !== 'bn' && onToggleLanguage()}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              language === 'bn'
                                ? 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                          >
                            বাংলা
                          </button>
                          <button
                            onClick={() => onToggleLanguage && language !== 'en' && onToggleLanguage()}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              language === 'en'
                                ? 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                          >
                            English
                          </button>
                        </div>

                        {/* Theme Switch: Light / Dark */}
                        <div className="flex items-center p-0.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs">
                          <button
                            onClick={() => onToggleTheme && theme !== 'light' && onToggleTheme()}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              theme === 'light'
                                ? 'bg-stone-900 text-white shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                            title={language === 'bn' ? 'লাইট মোড' : 'Light Mode'}
                          >
                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                            <span>Light</span>
                          </button>
                          <button
                            onClick={() => onToggleTheme && theme !== 'dark' && onToggleTheme()}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              theme === 'dark'
                                ? 'bg-amber-500 text-stone-950 shadow-xs font-extrabold'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                            title={language === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}
                          >
                            <Moon className="w-3.5 h-3.5 text-indigo-400 dark:text-stone-950" />
                            <span>Dark</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Footer Hotline & Delivery note */}
                    <div className="p-3 bg-stone-100 dark:bg-stone-900 text-xs flex items-center justify-between border-t border-stone-200 dark:border-stone-800">
                      <a
                        href={`https://wa.me/88${whatsappNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:underline font-bold text-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === 'bn' ? `হটলাইন: ${whatsappNumber}` : `Hotline: ${whatsappNumber}`}</span>
                      </a>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                        {language === 'bn' ? '🚚 ৬৪ জেলায় ক্যাশ অন ডেলিভারি' : '🚚 Nationwide Cash on Delivery'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Easy Mart Brand Header Banner (slightly shifted right with pl-1 sm:pl-2) */}
            <a 
              href="#" 
              className="flex items-center group py-1 pl-1 sm:pl-2" 
              title="Easy Mart — সবকিছু, এক ঠিকানায়।"
            >
              <img
                src="./assets/images/easy_mart_header.png"
                alt="Easy Mart — সবকিছু, এক ঠিকানায়।"
                className="h-14 sm:h-16 md:h-20 lg:h-22 w-auto max-w-[200px] sm:max-w-[270px] md:max-w-none object-contain transition-transform group-hover:scale-[1.03]"
              />
            </a>
          </div>

          {/* Zone 2: Track Order & Community Feed Quick Links */}
          <div className="hidden md:flex items-center gap-3 text-sm font-medium text-stone-700 dark:text-stone-300">
            {onOpenFeed && (
              <button
                onClick={onOpenFeed}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Easy Mart News Feed</span>
              </button>
            )}
            <button
              onClick={onOpenTrackOrder}
              className="text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>{language === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
            </button>
          </div>

          {/* Zone 3: Primary Action & Quick Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Trigger */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center bg-white dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-lg px-2.5 py-1.5 shadow-xs w-48 sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={language === 'bn' ? 'পাঞ্জাবি, পাওয়ার ব্যাংক খুঁজুন...' : 'Search panjabi, power bank...'}
                    className="w-full text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none bg-transparent"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 ml-1 p-0.5"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search store"
                  className="p-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Wishlist Button */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onOpenWishlist}
              aria-label="View wishlist"
              className="relative p-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-amber-700 dark:bg-amber-500 text-white dark:text-stone-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </motion.button>

            {/* Shopping Cart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.92 }}
              onClick={onOpenCart}
              aria-label="Open shopping cart"
              className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-stone-100 dark:text-stone-950 rounded-lg transition-colors shadow-xs cursor-pointer font-bold"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 dark:bg-stone-900 text-stone-950 dark:text-amber-400 text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold hidden sm:inline whitespace-nowrap">
                {cartTotal > 0 ? `৳${cartTotal.toLocaleString()}` : (language === 'bn' ? 'ব্যাগ' : 'Bag')}
              </span>
            </motion.button>

            {/* Customer User Account / Sign In */}
            {currentUser ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={onOpenAccount}
                title={language === 'bn' ? 'আমার একাউন্ট ও অর্ডারসমূহ' : 'My Account & Orders'}
                aria-label="User Account"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-600/15 dark:bg-amber-500/20 hover:bg-amber-600/25 dark:hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 border border-amber-600/30 dark:border-amber-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-amber-600 dark:bg-amber-500 text-white dark:text-stone-950 flex items-center justify-center text-[10px] font-bold">
                  {currentUser.displayName?.charAt(0)?.toUpperCase() || currentUser.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {currentUser.displayName?.split(' ')[0] || (language === 'bn' ? 'একাউন্ট' : 'Account')}
                </span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={onOpenAuth}
                title={language === 'bn' ? 'লগইন বা সাইন আপ করুন' : 'Sign In or Sign Up'}
                aria-label="Sign In"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <UserIcon className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                <span className="hidden sm:inline">{language === 'bn' ? 'লগইন' : 'Login'}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
