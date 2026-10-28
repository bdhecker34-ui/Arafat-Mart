import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Share2, Check } from 'lucide-react';
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
  const [justAdded, setJustAdded] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  // Bilingual Title handling
  const primaryTitle = language === 'bn' ? (product.titleBn || product.title) : product.title;

  // Calculate discount percentage if original price is higher
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  // Review count based on rating or id
  const reviewCount = 50 + ((product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 7) % 450);

  // Category or Brand kicker
  const kicker = product.badge || product.category.replace('-', ' ').toUpperCase();

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartAnim(true);
    onToggleWishlist(product);
    setTimeout(() => setHeartAnim(false), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.06 }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-2xl border border-slate-100 p-3 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer w-full text-left"
    >
      <div>
        {/* Aspect-Square Image Container */}
        <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-50 mb-3">
          {/* Badge */}
          {discountPercent ? (
            <span className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              -{discountPercent}%
            </span>
          ) : product.badge ? (
            <span className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              {product.badge}
            </span>
          ) : null}

          {/* Product Image with Smooth Micro-Zoom */}
          <img
            alt={primaryTitle}
            src={product.image}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />

          {/* Top-Right Action Badges: Share & Wishlist */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            {onOpenShare && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenShare(product);
                }}
                aria-label="Share product"
                title="Share product link"
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-[#f36805] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.82 }}
              onClick={handleWishlistClick}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              title="Save to wishlist"
              className={`w-7 h-7 rounded-full shadow-xs flex items-center justify-center transition-colors cursor-pointer ${
                isWishlisted
                  ? 'bg-[#f36805] text-white'
                  : 'bg-white/90 hover:bg-white text-slate-600 hover:text-[#f36805]'
              } ${heartAnim ? 'animate-heart-pop' : ''}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current text-white' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Brand / Category Kicker */}
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase line-clamp-1">
          {kicker}
        </span>

        {/* Product Title */}
        <h3 className="text-xs font-bold text-slate-800 mt-0.5 line-clamp-1 group-hover:text-[#f36805] transition-colors">
          {primaryTitle}
        </h3>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs">
          <div className="flex text-amber-400 text-[10px]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          </div>
          <span className="font-bold text-[11px] text-slate-700">{product.rating}</span>
          <span className="text-slate-400 text-[10px]">({reviewCount} reviews)</span>
        </div>
      </div>

      {/* Price & Bag CTA Button */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-50">
        <div className="flex items-baseline">
          <span className="text-sm font-extrabold text-slate-900 font-mono">
            ৳{product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-slate-400 line-through ml-1.5 font-mono">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          onClick={handleAddClick}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm cursor-pointer ${
            justAdded
              ? 'bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/40'
              : 'bg-[#f36805] hover:bg-[#db5c00] text-white shadow-orange-500/30'
          }`}
          title={language === 'bn' ? 'ব্যাগে যোগ করুন' : 'Add to cart'}
          aria-label="Add to cart"
        >
          {justAdded ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          ) : (
            <ShoppingBag className="w-3.5 h-3.5" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
