import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag, Check } from 'lucide-react';
import { CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
  appliedDiscount: number;
  onApplyCoupon: (code: string) => boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  appliedDiscount,
  onApplyCoupon,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 1999;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const isFreeShipping = subtotal >= freeShippingThreshold || appliedDiscount === 9999;
  const standardDelivery = isFreeShipping ? 0 : 60; // Dhaka standard, adjustable in checkout
  const finalDiscount = appliedDiscount === 9999 ? 0 : appliedDiscount;
  const total = Math.max(0, subtotal - finalDiscount + standardDelivery);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const ok = onApplyCoupon(couponCode.trim());
    if (ok) {
      setCouponMsg({ text: 'Coupon applied successfully!', success: true });
    } else {
      setCouponMsg({ text: 'Invalid or expired coupon code', success: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-stone-200"
      >
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-800" />
            <h2 className="text-base font-bold text-stone-900">Your Shopping Bag</h2>
            <span className="text-xs font-semibold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart drawer"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="px-4 py-2.5 bg-amber-50/70 border-b border-amber-200/60 text-xs">
          {amountToFreeShipping > 0 ? (
            <div>
              <p className="text-stone-700">
                Add <strong className="text-amber-900 font-mono">৳{amountToFreeShipping.toLocaleString()}</strong> more to get <strong>Free Nationwide Delivery</strong>!
              </p>
              <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You unlocked <strong>Free Nationwide Delivery</strong> across all 64 districts!</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <ShoppingBag className="w-12 h-12 text-stone-300 mb-3 stroke-1" />
              <h3 className="text-base font-semibold text-stone-800">Your bag is empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                Explore our handpicked collection of panjabis, kurtis, power banks, and non-stick cookware.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <motion.div
                  key={`${item.product.id}-${index}-${item.selectedSize}-${item.selectedColor}`}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="flex gap-3.5 p-3 rounded-xl border border-stone-200 bg-stone-50/40 relative group"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-18 h-18 object-cover rounded-lg border border-stone-200 bg-white shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 truncate">
                        {item.product.title}
                      </h4>
                      
                      {/* Size and Color tags */}
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedSize && item.selectedColor && <span>·</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      </div>

                      <div className="mt-1 text-xs font-bold text-stone-900 font-mono tabular-nums">
                        ৳{(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60">
                      <div className="flex items-center border border-stone-300 rounded bg-white overflow-hidden text-xs">
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 font-bold font-mono">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/70 space-y-3">
            
            {/* Promo Voucher Form */}
            <form onSubmit={handleCouponSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code (e.g. EASY10)"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:border-stone-900 uppercase font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Apply
              </button>
            </form>

            {couponMsg && (
              <p className={`text-[11px] ${couponMsg.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                {couponMsg.text}
              </p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs pt-2">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">৳{subtotal.toLocaleString()}</span>
              </div>

              {finalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Special Voucher Discount</span>
                  <span className="font-mono tabular-nums">-৳{finalDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Estimated Shipping</span>
                <span className="font-mono tabular-nums">
                  {standardDelivery === 0 ? (
                    <strong className="text-emerald-700 font-normal">FREE</strong>
                  ) : (
                    `৳${standardDelivery}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums text-base">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA with Tapping Animation */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash on Delivery available on next step</span>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
