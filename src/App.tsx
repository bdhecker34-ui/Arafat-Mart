/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { SmartBudgetModal } from './components/SmartBudgetModal';

import { AdminSetup } from './admin/AdminSetup';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { adminApi, AdminContentState } from './services/adminApi';
import { DEFAULT_STORE_CONTENT } from './data/defaultStoreContent';
import {
  subscribeStoreContent,
  saveStoreContentToFirestore,
  saveOrderToFirestore,
} from './services/firestoreService';
import { testConnection, auth, signOut, onAuthStateChanged, User } from './firebase';

import { BANGLADESH_DIVISIONS } from './data/bangladeshDistricts';
import { Product, ProductCategory, CartItem, Order } from './types';
import {
  SlidersHorizontal,
  Check,
  Search,
  Truck,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Phone,
  MessageCircle,
  AlertTriangle,
  Lock,
  LayoutGrid,
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  Package,
} from 'lucide-react';
import { motion } from 'motion/react';

type ViewMode = 'store' | 'admin-setup' | 'admin-login' | 'admin-dashboard';

export default function App() {
  // Navigation & View Mode State
  const [currentView, setCurrentView] = useState<ViewMode>('store');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);

  // Dynamic Store Content (Synchronized via Admin Console & Backend)
  const [storeContent, setStoreContent] = useState<AdminContentState>(DEFAULT_STORE_CONTENT);

  // Category & Filter State
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [isSmartBudgetOpen, setIsSmartBudgetOpen] = useState(false);

  // Customer Authentication & Account States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Cart & Wishlist with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('arafat_mart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('arafat_mart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('arafat_mart_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Initial sample confirmed order for immediate tracking demo
    return [
      {
        id: 'AFM-2026-84920',
        trackingNumber: 'BD-58921849',
        createdAt: '18 Oct 2026',
        customer: {
          fullName: 'Tanvir Hossain',
          phone: '01712345678',
          division: 'Dhaka Division',
          district: 'Dhaka (Metro & Suburbs)',
          thana: 'Gulshan',
          fullAddress: 'Road 11, Block D, House 42, Gulshan-1, Dhaka',
        },
        items: [
          {
            product: DEFAULT_STORE_CONTENT.products[0],
            quantity: 1,
            selectedSize: '42 (L)',
            selectedColor: 'Pearl Cream',
          },
        ],
        subtotal: 2450,
        deliveryFee: 0,
        discount: 245,
        total: 2205,
        paymentMethod: 'cod',
        paymentStatus: 'cod_verified',
        orderStatus: 'dispatched',
        timeline: [
          {
            status: 'confirmed',
            label: 'Order Confirmed',
            time: '18 Oct, 10:15 AM',
            description: 'Order placed & scheduled for automated inventory allocation.',
            completed: true,
          },
          {
            status: 'quality_check',
            label: 'Quality Inspection Passed',
            time: '18 Oct, 02:40 PM',
            description: 'Item passed physical stitching & packaging inspection at Tejgaon hub.',
            completed: true,
          },
          {
            status: 'dispatched',
            label: 'Dispatched via Steadfast Express',
            time: '19 Oct, 08:30 AM',
            description: 'Parcel handover completed, transit to local distribution center.',
            completed: true,
            current: true,
          },
          {
            status: 'out_for_delivery',
            label: 'Out for Doorstep Delivery',
            time: 'Expected by 4:00 PM',
            description: 'Rider assigned with parcel and Cash on Delivery receipt.',
            completed: false,
          },
          {
            status: 'delivered',
            label: 'Delivered & Handed Over',
            time: 'Pending',
            description: 'Recipient collects parcel & pays rider.',
            completed: false,
          },
        ],
      },
    ];
  });

  // Coupons & Toasts
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('arafat_mart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('arafat_mart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('arafat_mart_orders', JSON.stringify(orders));
  }, [orders]);

  // Load & Live-Subscribe Content from Firestore & Backend on Mount
  useEffect(() => {
    // 1. Subscribe to Firestore real-time updates for live store content
    const unsubscribe = subscribeStoreContent((remote) => {
      if (remote && remote.products && remote.products.length > 0) {
        setStoreContent(remote);
      }
    });

    // 2. Initial fallback fetch from API
    adminApi.fetchContent().then((remote) => {
      if (remote && remote.products && remote.products.length > 0) {
        setStoreContent(remote);
      }
    }).catch((err) => {
      console.warn('Backend content fetch notice:', err);
    });

    // 3. Test connection per Firebase skill directive
    testConnection().then((connected) => {
      if (connected) {
        console.log('Firebase connection verified');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Admin Console Routing & Access Controller
  const openAdminConsole = useCallback(async () => {
    setIsVerifyingAdmin(true);
    try {
      if (adminApi.isAuthenticated()) {
        const email = adminApi.getAdminEmail()?.trim().toLowerCase();
        if (email === 'bdhecker34@gmail.com') {
          setAdminEmail('bdhecker34@gmail.com');
          setCurrentView('admin-dashboard');
          window.location.hash = 'admin';
          return;
        } else {
          adminApi.clearSession();
        }
      }

      // Check if one-time setup has been completed on the trusted backend
      const statusRes = await adminApi.checkSetupStatus();
      if (statusRes.isSetupCompleted) {
        setCurrentView('admin-login');
        window.location.hash = 'admin';
      } else {
        setCurrentView('admin-setup');
        window.location.hash = 'admin';
      }
    } catch (err) {
      console.error('Failed to verify admin status:', err);
      // Fallback to login
      setCurrentView('admin-login');
      window.location.hash = 'admin';
    } finally {
      setIsVerifyingAdmin(false);
    }
  }, []);

  // URL Hash Listener (Supports direct #admin URL navigation)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        openAdminConsole();
      } else if (window.location.hash === '' || window.location.hash === '#store') {
        setCurrentView('store');
      }
    };

    if (window.location.hash === '#admin') {
      openAdminConsole();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [openAdminConsole]);

  // Handle Admin Setup Success
  const handleAdminSetupSuccess = () => {
    showToast('Administrator account provisioned! Please sign in.');
    setCurrentView('admin-login');
  };

  // Handle Admin Login Success
  const handleAdminLoginSuccess = () => {
    const email = adminApi.getAdminEmail() || 'bdhecker34@gmail.com';
    setAdminEmail(email);
    setCurrentView('admin-dashboard');
    showToast('Welcome to Easy Mart Admin Console');
  };

  // Handle Admin Logout
  const handleAdminLogout = async () => {
    adminApi.logout();
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setAdminEmail('');
    setCurrentView('store');
    window.location.hash = '';
    showToast('Admin session securely closed');
  };

  // Content Update Callback from Admin Dashboard
  const handleUpdateContent = async (newContent: AdminContentState) => {
    setStoreContent(newContent);
    try {
      // 1. Save directly to Firebase Firestore
      const firestoreRes = await saveStoreContentToFirestore(newContent);
      // 2. Also persist to backend proxy storage
      const res = await adminApi.saveContent(newContent);

      if (firestoreRes.success || res.success) {
        showToast('All changes saved to Firebase & synced nationwide!');
      } else {
        showToast('Saved locally.');
      }
    } catch (err: any) {
      showToast('Saved locally: ' + (err.message || 'Updated'));
    }
  };

  // Order Update Callback from Admin Dashboard
  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('arafat_mart_orders', JSON.stringify(newOrders));
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    const size = selectedSize || (product.sizes ? product.sizes[0] : undefined);
    const color = selectedColor || (product.colors ? product.colors[0] : undefined);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity, selectedSize: size, selectedColor: color }];
    });

    showToast(`Added "${product.title}" to your bag`);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(index);
      return;
    }
    setCart((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], quantity };
      return next;
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    showToast('Item removed from bag');
  };

  // Instant Buy via COD
  const handleInstantBuy = (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    handleAddToCart(product, quantity, selectedSize, selectedColor);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Smart Budget Multi-item Cart Insertion
  const handleAddMultipleToCart = (items: { product: Product; quantity: number }[]) => {
    setCart((prev) => {
      let next = [...prev];
      for (const item of items) {
        const size = item.product.sizes ? item.product.sizes[0] : undefined;
        const color = item.product.colors ? item.product.colors[0] : undefined;
        const idx = next.findIndex(
          (ci) => ci.product.id === item.product.id && ci.selectedSize === size && ci.selectedColor === color
        );
        if (idx > -1) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        } else {
          next.push({
            product: item.product,
            quantity: item.quantity,
            selectedSize: size,
            selectedColor: color,
          });
        }
      }
      return next;
    });
    showToast(`স্মার্ট বাজেট কম্বো: ${items.length} টি পণ্য ব্যাগে যোগ করা হয়েছে!`);
    setIsCartOpen(true);
  };

  // Smart Budget Instant Checkout
  const handleInstantCheckoutWithItems = (items: { product: Product; quantity: number }[]) => {
    handleAddMultipleToCart(items);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      showToast('Removed from wishlist');
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast('Saved to wishlist');
    }
  };

  // Dynamic Coupon application
  const handleApplyCoupon = (code: string): boolean => {
    const cleaned = code.trim().toUpperCase();
    const activeCoupons = storeContent.coupons || [];
    const matched = activeCoupons.find((c) => c.code.toUpperCase() === cleaned && c.active);

    if (matched) {
      if (matched.isFreeShipping) {
        setAppliedDiscount(9999);
      } else {
        const sub = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        setAppliedDiscount(Math.round(sub * (matched.discountPercent / 100)));
      }
      return true;
    }

    // Default built-in fallbacks
    if (cleaned === 'ARAFAT10') {
      const sub = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      setAppliedDiscount(Math.round(sub * 0.1));
      return true;
    }
    if (cleaned === 'FREESHIP') {
      setAppliedDiscount(9999);
      return true;
    }
    return false;
  };

  // Order Placement
  const handleOrderPlaced = async (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setLatestOrder(order);
    showToast('Order confirmed successfully!');

    // Persist order to Firebase Firestore database
    try {
      await saveOrderToFirestore({
        orderId: order.id,
        customerName: order.customer.fullName,
        customerPhone: order.customer.phone,
        deliveryDistrict: order.customer.district,
        deliveryAddress: order.customer.fullAddress,
        paymentMethod: order.paymentMethod,
        trxId: order.trxId,
        totalAmount: order.total,
        status: order.orderStatus,
        items: order.items,
        notes: order.customer.orderNote,
        userId: order.userId,
        userEmail: order.userEmail,
      });
    } catch (e) {
      console.warn('Firestore order save note:', e);
    }
  };

  // Category Icon Resolver
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'all':
        return <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'fashion':
        return <Shirt className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'gadgets':
        return <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'home-kitchen':
        return <Home className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'beauty-care':
        return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <Package className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  // Categories list (dynamic with fallback)
  const categoryTabs = useMemo(() => {
    const configured = (storeContent.categories || []).filter((c) => c.active !== false);
    return [
      { id: 'all' as ProductCategory, label: 'All Products', nameBn: 'সব প্রোডাক্ট' },
      ...configured.map((c) => ({
        id: c.id as ProductCategory,
        label: c.name,
        nameBn: c.nameBn,
      })),
    ];
  }, [storeContent.categories]);

  // Filtered & Sorted Products (using live storeContent.products)
  const filteredProducts = useMemo(() => {
    let result = (storeContent.products && storeContent.products.length > 0)
      ? storeContent.products
      : DEFAULT_STORE_CONTENT.products;

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.titleBn && p.titleBn.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.features && p.features.some((f) => f.toLowerCase().includes(q)))
      );
    }

    // Sort
    const sorted = [...result];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else {
      // featured default
      sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return sorted;
  }, [storeContent.products, activeCategory, searchQuery, sortBy]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Maintenance Mode Gate for Public Users
  const isMaintenance = storeContent.settings?.maintenanceMode && !adminApi.isAuthenticated();

  // ================= ADMIN CONSOLE VIEWS =================
  if (currentView === 'admin-dashboard') {
    return (
      <AdminDashboard
        adminEmail={adminEmail || 'admin@arafatmart.com'}
        content={storeContent}
        orders={orders}
        onUpdateContent={handleUpdateContent}
        onUpdateOrders={handleUpdateOrders}
        onLogout={handleAdminLogout}
        onViewStore={() => {
          setCurrentView('store');
          window.location.hash = '';
        }}
      />
    );
  }

  if (currentView === 'admin-setup') {
    return (
      <AdminSetup
        onSetupSuccess={handleAdminSetupSuccess}
        onSwitchToLogin={() => setCurrentView('admin-login')}
        onCancel={() => {
          setCurrentView('store');
          window.location.hash = '';
        }}
      />
    );
  }

  if (currentView === 'admin-login') {
    return (
      <AdminLogin
        onLoginSuccess={handleAdminLoginSuccess}
        onSwitchToSetup={() => setCurrentView('admin-setup')}
        onCancel={() => {
          setCurrentView('store');
          window.location.hash = '';
        }}
      />
    );
  }

  // ================= STOREFRONT MAINTENANCE MODE =================
  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-stone-800 border border-stone-700 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {storeContent.settings?.storeName || 'Easy Mart'} is Under Maintenance
            </h1>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">
              We are currently updating our seasonal stock and logistics channels. We will be back online shortly!
            </p>
          </div>
          <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-700/80 text-xs space-y-2">
            <p className="text-stone-300 font-medium">Need urgent order assistance?</p>
            <a
              href={`https://wa.me/88${storeContent.contact?.whatsapp || '01410556747'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: {storeContent.contact?.whatsapp || '01410556747'}</span>
            </a>
          </div>
          <div className="pt-4 border-t border-stone-700/50 flex justify-center">
            <button
              onClick={openAdminConsole}
              className="text-[11px] text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              <span>Administrator Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= PUBLIC USER APPLICATION =================
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-stone-900 flex flex-col font-sans selection:bg-amber-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header (Strict 3-zone Top Bar Contract with Admin Button) */}
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        cartTotal={cartTotal}
        wishlistCount={wishlist.length}
        categories={categoryTabs}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenTrackOrder={() => {
          setTrackingOrderId(undefined);
          setIsTrackOrderOpen(true);
        }}
        onOpenSmartBudget={() => setIsSmartBudgetOpen(true)}
        onOpenAdmin={openAdminConsole}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        noticeText={storeContent.notice?.text}
        noticeEnabled={storeContent.notice?.enabled}
        whatsappNumber={storeContent.contact?.whatsapp}
        storeName={storeContent.settings?.storeName}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Section with 4-Slide Carousel (Dynamic banners from storeContent) */}
      {storeContent.homepage?.showBanners !== false && (
        <Hero
          slides={storeContent.banners}
          onShopClick={() => {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onTrackOrderClick={() => {
            setTrackingOrderId(undefined);
            setIsTrackOrderOpen(true);
          }}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
          }}
        />
      )}

      {/* Main Catalog Section */}
      <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Modern Icon-Based Category Box Section */}
        {storeContent.homepage?.showCategoryFilters !== false && (
          <section className="mb-8" aria-label="Product Categories">
            {/* Section Heading & Category Info */}
            <div className="flex items-center justify-between mb-4 px-0.5">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
                  <span>পণ্য ক্যাটাগরি</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Categories
                  </span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  পছন্দের ক্যাটাগরি সিলেক্ট করে দ্রুত পণ্য ব্রাউজ করুন
                </p>
              </div>

              {activeCategory !== 'all' && (
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  সব পণ্য দেখুন (Show All)
                </button>
              )}
            </div>

            {/* Horizontal Single-Row Category Boxes with Smooth Horizontal Scroll */}
            <div className="relative">
              <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5">
                {categoryTabs.map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  return (
                    <motion.button
                      key={cat.id}
                      whileHover={{ y: -3, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setActiveCategory(cat.id as ProductCategory);
                        setSearchQuery('');
                      }}
                      className={`flex-1 min-w-[115px] sm:min-w-[135px] md:min-w-[150px] p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer relative select-none ${
                        isSelected
                          ? 'bg-stone-900 text-white border-2 border-stone-900 shadow-lg ring-4 ring-stone-900/10'
                          : 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90 shadow-xs hover:shadow-md hover:border-stone-300'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {/* Active Indicator Top-Right Dot */}
                      {isSelected && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                        </span>
                      )}

                      {/* Icon Container */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950 shadow-xs'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {getCategoryIcon(cat.id)}
                      </div>

                      {/* Original Category Name */}
                      <span
                        className={`text-xs sm:text-sm font-bold tracking-tight line-clamp-1 ${
                          isSelected ? 'text-white' : 'text-stone-800'
                        }`}
                      >
                        {cat.label}
                      </span>

                      {/* Subtle Bengali name subtext if available */}
                      {cat.nameBn && (
                        <span
                          className={`text-[10px] sm:text-[11px] mt-0.5 line-clamp-1 ${
                            isSelected ? 'text-stone-300' : 'text-stone-500'
                          }`}
                        >
                          {cat.nameBn}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Product Count & Sorting Control Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-stone-200">
          <div className="text-xs sm:text-sm text-stone-600 font-medium">
            <span>
              প্রদর্শিত পণ্য সংখ্যা:{' '}
              <strong className="font-mono text-stone-900 text-sm">
                {filteredProducts.length}
              </strong>{' '}
              টি
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 shadow-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Picks (বাছাইকৃত)</option>
                <option value="price-asc">Price: Low to High (কম থেকে বেশি দাম)</option>
                <option value="price-desc">Price: High to Low (বেশি থেকে কম দাম)</option>
                <option value="rating">Top Customer Rated (শীর্ষ রেটিং)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Search Filter State */}
        {searchQuery.trim() && (
          <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200/80 px-4 py-2.5 rounded-xl text-xs text-amber-900">
            <span>
              Searching for &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-amber-800 underline font-semibold hover:text-amber-950"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Product Cards Grid: 3-column strict 1:1 square display */}
        {storeContent.homepage?.showProductGrid !== false && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 p-8">
                <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">No matching products found</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                  Try searching for &quot;panjabi&quot;, &quot;kurti&quot;, &quot;power bank&quot;, or &quot;cookware&quot;, or switch to another category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:gap-5 md:gap-6 lg:gap-8">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    index={index}
                    product={product}
                    onQuickView={setSelectedProduct}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Nationwide 64-District Coverage & Logistics Banner */}
        {storeContent.homepage?.showNationwideBanner !== false && (
          <section className="mt-16 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Delivery Commitment */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase font-bold tracking-widest text-amber-800 mb-2">
                    Nationwide Logistics Network
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight leading-snug">
                    Fast, verified doorstep delivery to all 64 districts.
                  </h2>
                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Whether you are in Dhaka, Chattogram, Sylhet, Bogura, Rajshahi, or remote thanas of Khulna and Barishal, our courier partners ensure your package arrives securely wrapped with double tamper-evident seals.
                  </p>

                  {/* 3 Value Pillars */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="font-bold text-stone-900 block">Dhaka Metropolis</span>
                      <span className="text-stone-500 text-[11px] mt-0.5 block">
                        24 – 48 Hours Delivery · ৳{storeContent.settings?.dhakaDeliveryFee ?? 60}
                      </span>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="font-bold text-stone-900 block">All Other Districts</span>
                      <span className="text-stone-500 text-[11px] mt-0.5 block">
                        2 – 3 Days Delivery · ৳{storeContent.settings?.outsideDeliveryFee ?? 120}
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="font-bold text-amber-900 block">
                        Orders over ৳{storeContent.settings?.freeShippingThreshold ?? 1999}
                      </span>
                      <span className="text-amber-800 text-[11px] mt-0.5 block">
                        100% Free Nationwide Delivery
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-stone-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Parcel open check before paying rider allowed</span>
                  </div>
                  <button
                    onClick={() => {
                      setTrackingOrderId(undefined);
                      setIsTrackOrderOpen(true);
                    }}
                    className="font-bold text-stone-900 hover:text-amber-800 flex items-center gap-1 transition-colors"
                  >
                    <span>Track Consignment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Division Summary Grid */}
              <div className="lg:col-span-5 bg-stone-50/70 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-stone-200 flex flex-col justify-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  Administrative Divisions Served:
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <div
                      key={div.id}
                      className="p-2 bg-white rounded-lg border border-stone-200/80 flex items-center justify-between"
                    >
                      <span className="font-semibold text-stone-800">{div.nameBn}</span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {div.districts.length} Dist.
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[11px] text-stone-500 text-center">
                  Total 64 districts and 495+ upazilas covered nationwide with Cash on Delivery.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer
        contactInfo={storeContent.contact}
        aboutText={storeContent.footer?.aboutText}
        socialLinks={storeContent.social}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTrackOrder={() => {
          setTrackingOrderId(undefined);
          setIsTrackOrderOpen(true);
        }}
        onOpenAdmin={openAdminConsole}
      />

      {/* Modals & Slide-over Drawers */}

      {/* Product Quick View / PDP */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty, size, color) => {
          handleAddToCart(p, qty, size, color);
          setSelectedProduct(null);
        }}
        onInstantBuy={(p, qty, size, color) => {
          handleInstantBuy(p, qty, size, color);
        }}
        isWishlisted={selectedProduct ? wishlist.some((w) => w.id === selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedDiscount={appliedDiscount}
        onApplyCoupon={handleApplyCoupon}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(p) => {
          handleAddToCart(p, 1);
          setWishlist((prev) => prev.filter((item) => item.id !== p.id));
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discount={appliedDiscount}
        contactInfo={storeContent.contact}
        onOrderPlaced={handleOrderPlaced}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Customer Authentication Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        onSuccess={() => {
          showToast('স্বাগতম! আপনি সফলভাবে লগইন করেছেন');
        }}
      />

      {/* Customer Account & Order History Modal */}
      {currentUser && (
        <CustomerAccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          user={currentUser}
          onTrackOrder={(orderId) => {
            setIsAccountModalOpen(false);
            setTrackingOrderId(orderId);
            setIsTrackOrderOpen(true);
          }}
          onLogout={() => {
            showToast('আপনি সফলভাবে লগআউট করেছেন');
          }}
        />
      )}

      {/* Order Success Confirmation Modal */}
      <OrderSuccessModal
        order={latestOrder}
        onClose={() => setLatestOrder(null)}
        onTrackOrder={(orderId) => {
          setLatestOrder(null);
          setTrackingOrderId(orderId);
          setIsTrackOrderOpen(true);
        }}
      />

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => {
          setIsTrackOrderOpen(false);
          setTrackingOrderId(undefined);
        }}
        orders={orders}
        defaultOrderId={trackingOrderId}
      />

      {/* Smart Budget Shopping Modal */}
      <SmartBudgetModal
        isOpen={isSmartBudgetOpen}
        onClose={() => setIsSmartBudgetOpen(false)}
        products={
          storeContent.products && storeContent.products.length > 0
            ? storeContent.products
            : DEFAULT_STORE_CONTENT.products
        }
        onAddMultipleToCart={handleAddMultipleToCart}
        onInstantCheckoutWithItems={handleInstantCheckoutWithItems}
      />

      {/* Floating WhatsApp Quick Contact Button (Live dynamic phone) */}
      <motion.a
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        href={`https://wa.me/88${storeContent.contact?.whatsapp || '01410556747'}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat on WhatsApp: ${storeContent.contact?.whatsapp || '01410556747'}`}
        className="fixed bottom-6 left-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 transition-colors border border-emerald-400/30"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          WhatsApp {storeContent.contact?.whatsapp || '01410556747'}
        </span>
      </motion.a>
    </div>
  );
}
