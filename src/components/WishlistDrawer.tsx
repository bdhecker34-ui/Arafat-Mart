import React from 'react';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-stone-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-800 fill-current" />
            <h2 className="text-base font-bold text-stone-900">Your Wishlist</h2>
            <span className="text-xs font-semibold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full">
              {wishlist.length}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close wishlist"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <Heart className="w-12 h-12 text-stone-300 mb-3 stroke-1" />
              <h3 className="text-base font-semibold text-stone-800">Your wishlist is empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                Save your favorite kurtis, panjabis, tech gadgets, and cookware for later.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
              >
                Browse Items
              </button>
            </div>
          ) : (
            wishlist.map((product) => (
              <div
                key={product.id}
                className="flex gap-3.5 p-3 rounded-xl border border-stone-200 bg-stone-50/40 relative group"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-18 h-18 object-cover rounded-lg border border-stone-200 bg-white shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-stone-900 truncate">
                      {product.title}
                    </h4>
                    <span className="text-[11px] text-stone-500 capitalize">
                      {product.category.replace('-', ' & ')}
                    </span>
                    <div className="mt-1 text-xs font-bold text-stone-900 font-mono tabular-nums">
                      ৳{product.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => onAddToCart(product)}
                      className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </motion.button>

                    <button
                      onClick={() => onRemoveFromWishlist(product)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
