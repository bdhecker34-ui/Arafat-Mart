import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, X, Truck, Phone, ShieldCheck } from 'lucide-react';
import { ProductCategory } from '../types';
import { motion } from 'motion/react';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenTrackOrder: () => void;
  onOpenAdmin?: () => void;
  activeCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  noticeText?: string;
  noticeEnabled?: boolean;
  whatsappNumber?: string;
  storeName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenTrackOrder,
  onOpenAdmin,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  noticeText,
  noticeEnabled = true,
  whatsappNumber = '01410556747',
  storeName = 'Easy Mart',
}) => {
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const bannerText = noticeText || 'Cash on Delivery Across All 64 Districts in Bangladesh · Free Nationwide Delivery on orders over ৳1,999';

  return (
    <header className="sticky top-0 z-40 bg-[#f7f3ea]/95 backdrop-blur-md border-b border-stone-200">
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
        <div className="flex items-center justify-between gap-4 sm:gap-8 min-h-[86px] sm:min-h-[96px] py-2">
          
          {/* Zone 1: Easy Mart Brand Header Banner */}
          <div className="flex items-center shrink-0">
            <a href="#" className="flex items-center group py-1" title="Easy Mart — সবকিছু, এক ঠিকানায়।">
              <img
                src="./assets/images/easy_mart_header.png"
                alt="Easy Mart — সবকিছু, এক ঠিকানায়।"
                className="h-14 sm:h-16 md:h-20 lg:h-22 w-auto max-w-[220px] sm:max-w-[280px] md:max-w-none object-contain transition-transform group-hover:scale-[1.03]"
              />
            </a>
          </div>

          {/* Zone 2: 4-5 Clean Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
            <button
              onClick={() => onSelectCategory('all')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeCategory === 'all'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-600'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => onSelectCategory('fashion')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeCategory === 'fashion'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-600'
              }`}
            >
              Fashion
            </button>
            <button
              onClick={() => onSelectCategory('gadgets')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeCategory === 'gadgets'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-600'
              }`}
            >
              Gadgets
            </button>
            <button
              onClick={() => onSelectCategory('home-kitchen')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeCategory === 'home-kitchen'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-600'
              }`}
            >
              Home & Living
            </button>
            <button
              onClick={onOpenTrackOrder}
              className="text-stone-600 hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 border-transparent flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4 text-amber-700" />
              <span>Track Order</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Quick Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Trigger */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 shadow-xs w-48 sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search panjabi, power bank..."
                    className="w-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none bg-transparent"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="text-stone-400 hover:text-stone-600 ml-1 p-0.5"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search store"
                  className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg transition-colors"
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
              className="relative p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-amber-700 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
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
              className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-lg transition-colors shadow-xs"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-stone-950 text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold hidden sm:inline whitespace-nowrap">
                {cartTotal > 0 ? `৳${cartTotal.toLocaleString()}` : 'Bag'}
              </span>
            </motion.button>

            {/* Admin Console Toggle Button */}
            {onOpenAdmin && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={onOpenAdmin}
                title="Admin Control Panel"
                aria-label="Admin Control Panel"
                className="flex items-center gap-1.5 px-2.5 py-2 bg-stone-200/70 hover:bg-stone-300 text-stone-800 rounded-lg transition-colors border border-stone-300/80 text-xs font-bold"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span className="hidden md:inline">Admin</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Categories Strip */}
        <div className="md:hidden flex items-center gap-3 overflow-x-auto py-2.5 border-t border-stone-200 no-scrollbar text-xs">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-200/60 text-stone-700'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => onSelectCategory('fashion')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
              activeCategory === 'fashion'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-200/60 text-stone-700'
            }`}
          >
            Fashion
          </button>
          <button
            onClick={() => onSelectCategory('gadgets')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
              activeCategory === 'gadgets'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-200/60 text-stone-700'
            }`}
          >
            Gadgets
          </button>
          <button
            onClick={() => onSelectCategory('home-kitchen')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
              activeCategory === 'home-kitchen'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-200/60 text-stone-700'
            }`}
          >
            Home & Kitchen
          </button>
          <button
            onClick={() => onSelectCategory('beauty-care')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
              activeCategory === 'beauty-care'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-200/60 text-stone-700'
            }`}
          >
            Beauty & Care
          </button>
          <button
            onClick={onOpenTrackOrder}
            className="px-3 py-1 rounded-md whitespace-nowrap font-medium bg-amber-100 text-amber-900 border border-amber-200"
          >
            Track Order
          </button>
        </div>
      </div>
    </header>
  );
};
