import React from 'react';
import { Heart, Eye, Plus, Star, Share2 } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onOpenShare?: (product: Product) => void;
  language?: 'bn' | 'en';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  onQuickView,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onOpenShare,
  language = 'bn',
}) => {
  // Staggered bounce entrance on scroll
  const rotationOffset = (index % 3) === 0 ? -2 : (index % 3) === 1 ? 2 : -1;

  // Bilingual Title handling
  const primaryTitle = language === 'bn' ? (product.titleBn || product.title) : product.title;
  const secondaryTitle = language === 'bn' ? (product.titleBn ? product.title : null) : product.titleBn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 45, scale: 0.9, rotate: rotationOffset }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        type: 'spring',
        stiffness: 250,
        damping: 18,
        mass: 0.8,
        delay: (index % 3) * 0.1,
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.96 }}
      className="group relative bg-white dark:bg-stone-900 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-xl dark:hover:shadow-stone-950/50 cursor-pointer w-full"
      onClick={() => onQuickView(product)}
    >
      
      {/* 1:1 (ONE BY ONE) STRICT SQUARE IMAGE STAGE */}
      <div
        className="relative w-full bg-stone-100 dark:bg-stone-800 overflow-hidden"
        style={{ aspectRatio: '1 / 1', minHeight: '120px' }}
      >
        <motion.img
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          src={product.image}
          alt={primaryTitle}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
          style={{ aspectRatio: '1 / 1' }}
          loading="lazy"
        />

        {/* Subtle Text Tag */}
        {product.badge && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-stone-900/90 dark:bg-amber-500 dark:text-stone-950 text-white text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm shadow-xs pointer-events-none">
            {product.badge}
          </div>
        )}

        {/* Top-Right Action Badges: Share & Wishlist */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5 z-10">
          {onOpenShare && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.75 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenShare(product);
              }}
              aria-label="Share product"
              title={language === 'bn' ? 'প্রোডাক্ট লিংক শেয়ার করুন' : 'Share product link'}
              className="p-1.5 sm:p-2 rounded-full transition-colors bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-stone-800 shadow-xs backdrop-blur-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.75 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={language === 'bn' ? 'পছন্দের তালিকায় রাখুন' : 'Save to wishlist'}
            className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer ${
              isWishlisted
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-stone-800 shadow-xs backdrop-blur-xs'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current text-white' : ''}`} />
          </motion.button>
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-1.5 sm:py-2 px-2 bg-white/95 dark:bg-stone-800/95 hover:bg-white dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 text-[10px] sm:text-xs font-semibold rounded-md shadow-md flex items-center justify-center gap-1 backdrop-blur-xs transition-colors"
          >
            <Eye className="w-3 h-3 text-stone-600 dark:text-stone-300" />
            <span className="hidden sm:inline">
              {language === 'bn' ? 'কুইক ভিউ' : 'Quick View'}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="p-1.5 sm:p-2 bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 rounded-md shadow-md transition-colors"
            title={language === 'bn' ? 'ব্যাগে যোগ করুন' : 'Add to Bag'}
            aria-label="Add to cart"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between bg-white dark:bg-stone-900">
        <div>
          {/* Clean Unboxed Metadata with Typographic Separator */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span className="capitalize truncate max-w-[80px] sm:max-w-none">{product.category.replace('-', ' & ')}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center text-amber-700 dark:text-amber-400 font-medium shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5 inline" />
              {product.rating}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-2 hover:text-amber-800 dark:hover:text-amber-400 transition-colors leading-snug">
            {primaryTitle}
          </h3>

          {/* Subtitle if available */}
          {secondaryTitle && (
            <p className="text-[10px] sm:text-[11px] text-stone-400 dark:text-stone-500 truncate mt-0.5 font-normal">
              {secondaryTitle}
            </p>
          )}
        </div>

        {/* Pricing & Stock Bottom Row */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
            <span className="text-xs sm:text-base font-bold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-stone-400 dark:text-stone-500 line-through font-mono tabular-nums">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="text-[10px] sm:text-[11px]">
            {product.inStock ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-medium whitespace-nowrap">
                {language === 'bn' ? 'স্টকে আছে' : 'In Stock'}
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-medium whitespace-nowrap">
                {language === 'bn' ? 'স্টক শেষ' : 'Stock Out'}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
