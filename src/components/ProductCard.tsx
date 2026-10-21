import React from 'react';
import { Heart, Eye, Plus, Star } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  onQuickView,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) => {
  // Staggered bounce entrance on scroll
  const rotationOffset = (index % 3) === 0 ? -2 : (index % 3) === 1 ? 2 : -1;

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
      className="group relative bg-white rounded-xl sm:rounded-2xl border border-stone-200 overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-xl cursor-pointer w-full"
      onClick={() => onQuickView(product)}
    >
      
      {/* 1:1 (ONE BY ONE) STRICT SQUARE IMAGE STAGE */}
      <div
        className="relative w-full bg-stone-100 overflow-hidden"
        style={{ aspectRatio: '1 / 1', minHeight: '120px' }}
      >
        <motion.img
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
          style={{ aspectRatio: '1 / 1' }}
          loading="lazy"
        />

        {/* Subtle Text Tag */}
        {product.badge && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-stone-900/90 text-white text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm shadow-xs pointer-events-none">
            {product.badge}
          </div>
        )}

        {/* Wishlist Button with Tapping Bounce */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.75 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-colors z-10 ${
            isWishlisted
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white/90 text-stone-700 hover:text-stone-900 hover:bg-white shadow-xs backdrop-blur-xs'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current text-white' : ''}`} />
        </motion.button>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-1.5 sm:py-2 px-2 bg-white/95 hover:bg-white text-stone-800 text-[10px] sm:text-xs font-semibold rounded-md shadow-md flex items-center justify-center gap-1 backdrop-blur-xs transition-colors"
          >
            <Eye className="w-3 h-3 text-stone-600" />
            <span className="hidden sm:inline">Quick View</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="p-1.5 sm:p-2 bg-stone-900 hover:bg-stone-800 text-white rounded-md shadow-md transition-colors"
            title="Add to Bag"
            aria-label="Add to cart"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Clean Unboxed Metadata with Typographic Separator */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-stone-500 mb-1">
            <span className="capitalize truncate max-w-[80px] sm:max-w-none">{product.category.replace('-', ' & ')}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center text-amber-700 font-medium shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5 inline" />
              {product.rating}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 hover:text-amber-800 transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Bengali Subtitle if available */}
          {product.titleBn && (
            <p className="text-[10px] sm:text-[11px] text-stone-400 truncate mt-0.5 font-normal">
              {product.titleBn}
            </p>
          )}
        </div>

        {/* Pricing & Stock Bottom Row */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
            <span className="text-xs sm:text-base font-bold text-stone-900 font-mono tabular-nums">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-stone-400 line-through font-mono tabular-nums">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="text-[10px] sm:text-[11px]">
            {product.inStock ? (
              <span className="text-emerald-700 font-medium whitespace-nowrap">
                In Stock
              </span>
            ) : (
              <span className="text-rose-600 font-medium whitespace-nowrap">Stock Out</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
