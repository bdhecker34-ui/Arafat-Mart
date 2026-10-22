import React, { useState, useMemo, useCallback } from 'react';
import { 
  X, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  SlidersHorizontal,
  Plus,
  Coins,
  Trash2,
  Package
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SmartBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddMultipleToCart: (items: { product: Product; quantity: number }[]) => void;
  onInstantCheckoutWithItems: (items: { product: Product; quantity: number }[]) => void;
}

export type ComboStrategy = 'balanced' | 'max_items' | 'premium';

export const SmartBudgetModal: React.FC<SmartBudgetModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddMultipleToCart,
  onInstantCheckoutWithItems,
}) => {
  // Customer Budget State (Default ৳1,000 as requested by user)
  const [budgetInput, setBudgetInput] = useState<string>('1000');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [strategy, setStrategy] = useState<ComboStrategy>('balanced');
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);
  const [excludedProductIds, setExcludedProductIds] = useState<Set<string>>(new Set());

  // Quick budget presets
  const budgetPresets = [500, 1000, 1500, 2000, 3000, 5000];

  const parsedBudget = useMemo(() => {
    const val = parseInt(budgetInput.replace(/\D/g, ''), 10);
    return isNaN(val) ? 0 : val;
  }, [budgetInput]);

  // Filter pool of eligible products
  const eligibleProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.inStock === false) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      return p.price <= parsedBudget;
    });
  }, [products, selectedCategory, parsedBudget]);

  // Minimum priced product in catalog to guide user if budget is too low
  const minProductPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.min(...products.filter((p) => p.inStock !== false).map((p) => p.price));
  }, [products]);

  // Automatic Smart Combo Generation Algorithm
  const currentCombo = useMemo(() => {
    if (parsedBudget <= 0 || eligibleProducts.length === 0) {
      return null;
    }

    // Filter out user-excluded items
    const pool = eligibleProducts.filter((p) => !excludedProductIds.has(p.id));
    if (pool.length === 0) return null;

    // Apply deterministic permutation based on shuffleSeed
    const shuffled = [...pool];
    if (shuffleSeed > 0) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = (i * 7 + shuffleSeed * 13) % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }

    let selectedItems: Product[] = [];

    if (strategy === 'max_items') {
      // Greedily pick lowest priced items first to maximize item count
      const sortedByPrice = [...shuffled].sort((a, b) => a.price - b.price);
      let currentTotal = 0;
      for (const item of sortedByPrice) {
        if (currentTotal + item.price <= parsedBudget) {
          selectedItems.push(item);
          currentTotal += item.price;
        }
      }
    } else if (strategy === 'premium') {
      // Pick highest priced items first to maximize single item quality
      const sortedByDescPrice = [...shuffled].sort((a, b) => b.price - a.price);
      let currentTotal = 0;
      for (const item of sortedByDescPrice) {
        if (currentTotal + item.price <= parsedBudget) {
          selectedItems.push(item);
          currentTotal += item.price;
        }
      }
    } else {
      // 'balanced': mix category variety & high rating, getting as close to budget as possible
      const scored = [...shuffled].sort((a, b) => {
        const scoreA = a.rating * 10 + (a.isFeatured ? 5 : 0);
        const scoreB = b.rating * 10 + (b.isFeatured ? 5 : 0);
        return scoreB - scoreA;
      });

      const usedCategories = new Set<string>();
      let currentTotal = 0;

      // Pass 1: Try diverse categories first
      for (const item of scored) {
        if (!usedCategories.has(item.category) && currentTotal + item.price <= parsedBudget) {
          selectedItems.push(item);
          usedCategories.add(item.category);
          currentTotal += item.price;
        }
      }

      // Pass 2: Fill remaining budget with any best fit
      for (const item of scored) {
        if (!selectedItems.some((si) => si.id === item.id) && currentTotal + item.price <= parsedBudget) {
          selectedItems.push(item);
          currentTotal += item.price;
        }
      }
    }

    if (selectedItems.length === 0) return null;

    const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const totalOriginalPrice = selectedItems.reduce(
      (sum, item) => sum + (item.originalPrice || item.price),
      0
    );
    const savings = Math.max(0, totalOriginalPrice - totalPrice);
    const remainingBudget = parsedBudget - totalPrice;
    const utilization = parsedBudget > 0 ? Math.min(100, Math.round((totalPrice / parsedBudget) * 100)) : 0;

    return {
      items: selectedItems,
      totalPrice,
      totalOriginalPrice,
      savings,
      remainingBudget,
      utilization,
    };
  }, [parsedBudget, eligibleProducts, strategy, shuffleSeed, excludedProductIds]);

  // Handler to toggle an item off from current combo
  const handleToggleExcludeItem = (productId: string) => {
    setExcludedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleShuffle = () => {
    setShuffleSeed((prev) => prev + 1);
    setExcludedProductIds(new Set());
  };

  const handleAddComboToCart = () => {
    if (!currentCombo || currentCombo.items.length === 0) return;
    const cartPayload = currentCombo.items.map((product) => ({
      product,
      quantity: 1,
    }));
    onAddMultipleToCart(cartPayload);
    onClose();
  };

  const handleInstantBuyCombo = () => {
    if (!currentCombo || currentCombo.items.length === 0) return;
    const cartPayload = currentCombo.items.map((product) => ({
      product,
      quantity: 1,
    }));
    onInstantCheckoutWithItems(cartPayload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-[#f7f3ea] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] z-10"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 bg-stone-900 text-white flex items-center justify-between shrink-0 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center shadow-lg font-black shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                    Smart Budget Shopping
                  </h3>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                    অটোমেটিক কম্বিনেশন
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5">
                  আপনার নির্দিষ্ট বাজেটের মধ্যে উপযুক্ত সেরা পণ্যগুলোর স্বয়ংক্রিয় প্যাকেজ
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Step 1: Budget Input & Presets */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>আপনার বাজেট লিখুন (BDT ৳):</span>
                </label>
                <span className="text-[11px] text-stone-500">
                  সর্বনিম্ন পণ্য মূল্য: <strong>৳{minProductPrice}</strong>
                </span>
              </div>

              {/* Big Currency Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-extrabold text-stone-400 font-mono">
                  ৳
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={budgetInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setBudgetInput(clean);
                    setExcludedProductIds(new Set());
                  }}
                  placeholder="যেমন: ১,০০০"
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border-2 border-stone-200 focus:border-stone-900 rounded-xl text-xl sm:text-2xl font-bold font-mono text-stone-900 focus:outline-none transition-all placeholder:text-stone-300"
                />
                {parsedBudget > 0 && (
                  <button
                    onClick={() => setBudgetInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 rounded-lg text-xs"
                    title="ক্লিয়ার করুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                <span className="text-[11px] font-semibold text-stone-500 shrink-0">
                  জনপ্রিয় বাজেট:
                </span>
                {budgetPresets.map((amt) => {
                  const isPresetActive = parsedBudget === amt;
                  return (
                    <button
                      key={amt}
                      onClick={() => {
                        setBudgetInput(amt.toString());
                        setExcludedProductIds(new Set());
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isPresetActive
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      ৳{amt.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Controls Strip (Category Filter & Strategy Tabs) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-100/70 p-3 rounded-2xl border border-stone-200/80">
              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-stone-600 shrink-0">
                  ক্যাটাগরি:
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as any);
                    setExcludedProductIds(new Set());
                  }}
                  className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="all">সব ক্যাটাগরি (All Mixed)</option>
                  <option value="fashion">পাঞ্জাবি ও ফ্যাশন (Fashion)</option>
                  <option value="gadgets">স্মার্ট গ্যাজেটস (Gadgets)</option>
                  <option value="home-kitchen">হোম ও কিচেন (Home & Living)</option>
                  <option value="beauty-care">বিউটি ও কেয়ার (Beauty)</option>
                </select>
              </div>

              {/* Strategy Selector */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setStrategy('balanced')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    strategy === 'balanced'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="সেরা ব্যালেন্সড কম্বিনেশন"
                >
                  🎯 ব্যালেন্সড
                </button>
                <button
                  onClick={() => setStrategy('max_items')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    strategy === 'max_items'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="সর্বোচ্চ সংখ্যক পণ্য"
                >
                  📦 সর্বোচ্চ আইটেম
                </button>
                <button
                  onClick={() => setStrategy('premium')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    strategy === 'premium'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="বাজেটের মধ্যে সেরা প্রিমিয়াম পণ্য"
                >
                  👑 প্রিমিয়াম
                </button>
              </div>
            </div>

            {/* Step 3: Combination Results */}
            {currentCombo ? (
              <div className="space-y-4">
                {/* Result Summary Card */}
                <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-stone-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                        অটো-ম্যাচ সফল
                      </span>
                      <span className="text-xs text-stone-300">
                        {currentCombo.items.length} টি পণ্যের সেরা কম্বো
                      </span>
                    </div>

                    <button
                      onClick={handleShuffle}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-bold transition-all border border-stone-700 cursor-pointer self-start sm:self-auto"
                      title="অন্য একটি কম্বিনেশন তৈরি করুন"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>অন্য কম্বো দেখুন (Shuffle)</span>
                    </button>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 bg-stone-800/60 rounded-xl border border-stone-700/60">
                      <div className="text-[10px] text-stone-400">আপনার বাজেট</div>
                      <div className="text-sm sm:text-base font-extrabold text-white font-mono mt-0.5">
                        ৳{parsedBudget.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-2.5 bg-stone-800/60 rounded-xl border border-stone-700/60">
                      <div className="text-[10px] text-stone-400">কম্বো মোট মূল্য</div>
                      <div className="text-sm sm:text-base font-extrabold text-amber-400 font-mono mt-0.5">
                        ৳{currentCombo.totalPrice.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-2.5 bg-stone-800/60 rounded-xl border border-stone-700/60">
                      <div className="text-[10px] text-stone-400">বাজেট থেকে বাঁচবে</div>
                      <div className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                        ৳{currentCombo.remainingBudget.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-2.5 bg-stone-800/60 rounded-xl border border-stone-700/60">
                      <div className="text-[10px] text-stone-400">মোট সাশ্রয় (ছাড়)</div>
                      <div className="text-sm sm:text-base font-extrabold text-pink-400 font-mono mt-0.5">
                        ৳{currentCombo.savings.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Budget Usage Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>বাজেট ব্যবহার হয়েছে</span>
                      <span className="font-bold text-amber-300">{currentCombo.utilization}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${currentCombo.utilization}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Products in this Combo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-amber-700" />
                      <span>এই কম্বোতে অন্তর্ভুক্ত পণ্যসমূহ:</span>
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      (প্রয়োজনে কোনো পণ্য বাদ দিতে পারেন)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentCombo.items.map((product, idx) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl bg-stone-100 shrink-0 border border-stone-200"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 uppercase">
                                {product.category}
                              </span>
                              {product.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate mt-1">
                              {product.title}
                            </h5>
                            {product.titleBn && (
                              <p className="text-[11px] text-stone-500 truncate">
                                {product.titleBn}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs sm:text-sm font-extrabold text-stone-900 font-mono">
                                ৳{product.price.toLocaleString()}
                              </span>
                              {product.originalPrice && (
                                <span className="text-[11px] text-stone-400 line-through font-mono">
                                  ৳{product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Remove item from this combo */}
                        <button
                          onClick={() => handleToggleExcludeItem(product.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                          title="এই পণ্যটি কম্বো থেকে বাদ দিন"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold">
                  <Coins className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-stone-800">
                  {parsedBudget < minProductPrice
                    ? `বাজেট কিছুটা বৃদ্ধি করুন`
                    : `এই বাজেটে কোনো কম্বিনেশন মেলেনি`}
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {parsedBudget < minProductPrice
                    ? `আমাদের স্টোরে সর্বনিম্ন পণ্য মূল্য ৳${minProductPrice}। উপযুক্ত কম্বো পেতে বাজেট অন্তত ৳${minProductPrice} বা তার বেশি দিন।`
                    : `আপনার নির্বাচিত ফিল্টারে কোনো পণ্য মেলেনি। ক্যাটাগরি পরিবর্তন করুন অথবা বাজেট বৃদ্ধি করুন।`}
                </p>
                {parsedBudget < minProductPrice && (
                  <button
                    onClick={() => setBudgetInput('1000')}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    ৳১,০০০ বাজেট ট্রাই করুন
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          {currentCombo && (
            <div className="p-4 sm:p-5 bg-white border-t border-stone-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs text-stone-500 font-medium">
                  {currentCombo.items.length} টি পণ্যের সর্বমোট খরচ:
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-stone-900 font-mono flex items-center gap-2">
                  <span>৳{currentCombo.totalPrice.toLocaleString()}</span>
                  {currentCombo.remainingBudget > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ৳{currentCombo.remainingBudget} বেঁচে যাবে
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddComboToCart}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>সব কার্টে যোগ করুন</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstantBuyCombo}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <span>সরাসরি অর্ডার করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
