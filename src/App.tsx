/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { ProductShareModal, getProductShareUrl } from './components/ProductShareModal';
import { CustomerWishModal } from './components/CustomerWishModal';
import { CommunityFeed } from './components/CommunityFeed';
import { PWAInstallModal } from './components/PWAInstallModal';
import { AffiliateModal } from './components/AffiliateModal';

import { AdminSetup } from './admin/AdminSetup';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { adminApi, AdminContentState } from './services/adminApi';
import { DEFAULT_STORE_CONTENT } from './data/defaultStoreContent';
import {
  subscribeStoreContent,
  saveStoreContentToFirestore,
  saveOrderToFirestore,
  saveCustomerWishToFirestore,
  subscribeCustomerWishes,
  updateCustomerWishStatusInFirestore,
  deleteCustomerWishFromFirestore,
  subscribeFeedPosts,
  deleteFeedPostFromFirestore,
  subscribeAffiliateAccount,
  recordAffiliateClick,
} from './services/firestoreService';
import { testConnection, auth, signOut, onAuthStateChanged, User } from './firebase';

import { BANGLADESH_DIVISIONS } from './data/bangladeshDistricts';
import { Product, ProductCategory, CartItem, Order, CustomerWish, WishStatus, FeedPost, AffiliateAccount } from './types';
import {
  SlidersHorizontal,
  Check,
  Search,
  Truck,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  MessageCircle,
  AlertTriangle,
  Lock,
  LayoutGrid,
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  Package,
  Star,
  Zap,
  Clock,
  Mail,
  Phone,
} from 'lucide-react';
import { motion } from 'motion/react';

const EASY_MART_DEPARTMENTS = [
  {
    category: 'fashion' as ProductCategory,
    title: "Women's Fashion",
    subtitle: "Kurtis, sarees, abayas & more",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiHnErktCnu9k041RuNnT1g4f-JIGWxhpKXSkVaVGjJrHkcYBfJjMg5f0WO6QDSSyFXH2p2mOFcnFdk3yvPxgTIg3j7fQwRLdCjGuTkVt1F7OQLImb6a6nnwK_m3Ef4JSbz_PY9ku9WpMtUQHoMRuNLQJ-wnpSTMrt9qo1M9wKqgg-Y5cgFBo11pilv5iy5eT19ky7tAkeGZ0wCegUdPnt4f9zggDX5tir2kXUkWk"
  },
  {
    category: 'fashion' as ProductCategory,
    title: "Men's Fashion",
    subtitle: "Panjabis, shirts & trousers",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQoNY2Mvu-Ql6Gy-6qZHCqyhcGn0Qa6ZOciRa3f8r2V6v5SpsRlAbTl-RNzjpxcwYyG37o_Alj1rw6ozDDO8SG7qPggHe4mDsV97B-8N3r4Km3upQqVo5tIwwYa9JoRqrNOnt69bUOnXTVbj0qksYgTX9PHE6LCOLIBt38DDUk18RvItFliWLqI2F8CRIi7oKClxQJrmaLmjmm1XVNG7c0vYm0luWYZNwELiXJULA"
  },
  {
    category: 'gadgets' as ProductCategory,
    title: "Electronics & Gadgets",
    subtitle: "Power banks, audio & more",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoD7KSmflCMzVD4jNZtiHN4Zg6O6WT_AQb4QRijXbqlWMqnry_y9gcGvuq1q7CN3dJzDpKdpl3c6HiJ0WxqISRIhvO9jfTH8dfBmfu01fnpeqE73eX9nSeuJQTU_PGBSAjRNRmguRVVk9rcmmF2Qao3hyyygH1_y97Nx5Zi5TDehAYx78_I7GN0sRjNn3Etv3aG_r-UvmOG1Ug_ZEdfVyaAsvzxdB7-nRiiy5ftjg"
  },
  {
    category: 'home-kitchen' as ProductCategory,
    title: "Home & Kitchen",
    subtitle: "Cookware, storage & dining",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBLFUFnzdJ6B1VVi1OmJzINLgeGd_5BSeYbTBb0UtW0eAdNlKQ5_9V50Lg5KhVTcmIXvlYJTfEJ9uSUYcrRyQ0e_pKwZ1ePA6FYDHEv2_td5VoBLpx1R5egLmbi8rYsz4hiEBVhcBBLif2Asu9sBwxMroLjJYQ8Y5iQvGfGUrk94MB9UIk9jiGi-IigZO1ndzN_x1iwETMrrzGt0_Coe_cdFSJf-u6nGSs0u1_VKw"
  },
  {
    category: 'beauty-care' as ProductCategory,
    title: "Beauty & Personal Care",
    subtitle: "Skincare, hair & makeup",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcE24PDlvii7KJBGQ3NfIBmV01l_rK1X0aBWN8ElRS3O8pE_fGNynjdadASLktbH5E-3DgN__U0XgfZHHNcD85qZtYG0ADauH803UVZk3fnLsycpk4ZTWu2KsGBwK1X6Dob0ZPOJKu_YPiB0Agn9ByNi14GA8SJp9BLleSMHkhWkbF5GI9-yQ5mwuqp3q1bOFa1Ld8pjmPXxUWKySaLB5fOM76Qj8R8x21JXwPu-U"
  },
  {
    category: 'fashion' as ProductCategory,
    title: "Bags & Accessories",
    subtitle: "Totes, handbags & wallets",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjSV6UJtqaFud8FY9agO6rxgWp6YFtKMMcm81CtE3uSycyVqMie73qlXVCSq7MtXGAwop8_8b42pLwZ9bjhHApxjtXdz90ej7t2YaoAIPZhfg3CcnNPhsI27Wk9zV9weUepIYoyCpksYlLd6uzWzMs_0ItWiGkX0ms9qsLMa-tU3XlgLa_3kOgpLkkknX1UObgIQwNJKtFszV1SltRGBeFz3z99Pis2xEYJnnkwpY"
  },
  {
    category: 'gadgets' as ProductCategory,
    title: "Watches & Wearables",
    subtitle: "Smartwatches & classics",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCclr2WyM3kfH93zbiqRiSnD4mbE0RoADFG-64I4W9shpIGlMxYwXkm84-dg5dMmg_mEezy_MAV937el6z3LrC1XpqOKqLxaCCHZ84bthi7JB9a-igHDv9ip12PtfOKQX2tyg8cTfVaH7pUsIGbmpFqbbnZg6CE7_gPnCjQxyDG268F7vh9_rAnkwCKkaUsJCG7NoaXrvrBE5Bo5uFGjzoMqqwGr93fK_08L4IOB4k"
  },
  {
    category: 'fashion' as ProductCategory,
    title: "Kids & Baby",
    subtitle: "Hoodies, frocks & sets",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXDmTe_uHntyPkVnurhKJCU40xK50H6Q3BbciwMd-wgPknFAK0uA6unkxE-nQ_5SA1Wis0xrnlxhlPIUNvLTBTZq1t9OqV0EDdb3WMVJwaYBKEdekFPpn98dHuBCYPhViI0DSM97l7Yl-zUxzLT3v84ogCZ9gjXKvgZXd6NCeAHlEjIerjM9JLOSFYb9e4ANQOtjo4L07qTE0v8rn9zBjQMk17kpn6shO9zSE0f8g"
  }
];

type ViewMode = 'store' | 'admin-setup' | 'admin-login' | 'admin-dashboard' | 'feed';

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
  const [isCustomerWishModalOpen, setIsCustomerWishModalOpen] = useState(false);
  const [customerWishes, setCustomerWishes] = useState<CustomerWish[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [hasHandledInitialDeepLink, setHasHandledInitialDeepLink] = useState(false);
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);

  // Customer Authentication & Account States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Affiliate Program States
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [affiliateAccount, setAffiliateAccount] = useState<AffiliateAccount | null>(null);

  // Display Theme & Language Preferences (Persisted across sessions)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('easymart_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // fallback
    }
    return 'light';
  });

  const [language, setLanguage] = useState<'bn' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('easymart_lang');
      if (saved === 'bn' || saved === 'en') return saved;
    } catch {
      // fallback
    }
    return 'bn';
  });

  // Apply dark mode class to <html> root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('easymart_theme', theme);
    } catch {}
  }, [theme]);

  // Persist language preference
  useEffect(() => {
    try {
      localStorage.setItem('easymart_lang', language);
    } catch {}
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  }, []);

  // Deep-Linking: Automatically open specific product if URL has ?product=<id> or #product=<id>
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndOpenDeepLinkedProduct = () => {
      const params = new URLSearchParams(window.location.search);
      let prodId = params.get('product');

      if (!prodId && window.location.hash) {
        const hashMatch = window.location.hash.match(/product=([^&]+)/);
        if (hashMatch) {
          prodId = hashMatch[1];
        }
      }

      if (prodId) {
        const productList = (storeContent.products && storeContent.products.length > 0)
          ? storeContent.products
          : DEFAULT_STORE_CONTENT.products;
        const matched = productList.find((p) => p.id === prodId);
        if (matched) {
          setSelectedProduct(matched);
          if (!hasHandledInitialDeepLink) {
            setHasHandledInitialDeepLink(true);
            showToast(language === 'bn' ? 'শেয়ার করা পণ্যটি ওপেন করা হয়েছে!' : 'Shared product opened!');
          }
        }
      }
    };

    checkAndOpenDeepLinkedProduct();

    const handlePopState = () => {
      checkAndOpenDeepLinkedProduct();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [storeContent.products, language, hasHandledInitialDeepLink]);

  // Sync URL query parameter when product modal is opened or closed
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const url = new URL(window.location.href);
      if (selectedProduct) {
        if (url.searchParams.get('product') !== selectedProduct.id) {
          url.searchParams.set('product', selectedProduct.id);
          window.history.replaceState({ productId: selectedProduct.id }, '', url.toString());
        }
      } else {
        if (url.searchParams.has('product')) {
          url.searchParams.delete('product');
          window.history.replaceState({}, '', url.toString());
        }
      }
    } catch (e) {
      // In case of restricted iframe security
    }
  }, [selectedProduct]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Affiliate Account for current user
  useEffect(() => {
    if (!currentUser) {
      setAffiliateAccount(null);
      return;
    }
    const unsub = subscribeAffiliateAccount(currentUser.uid, (acc) => {
      setAffiliateAccount(acc);
    });
    return () => unsub();
  }, [currentUser]);

  // Track referral param (?ref=EM-AFF-XXXX) on landing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        localStorage.setItem('easymart_referral_ref', refParam);
        recordAffiliateClick(refParam);
      }
    } catch (e) {
      console.warn('Referral param error:', e);
    }
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

    // 4. Real-time customer wishes subscription
    const unsubscribeWishes = subscribeCustomerWishes(
      (wishes) => {
        setCustomerWishes(wishes);
      },
      (err) => {
        console.warn('Wishes subscription note:', err);
      }
    );

    // 5. Real-time community feed subscription
    const unsubscribeFeed = subscribeFeedPosts(
      (posts) => {
        setFeedPosts(posts);
      },
      (err) => {
        console.warn('Feed subscription note:', err);
      }
    );

    // Deep-link check for Community Feed
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'feed' || urlParams.has('post') || window.location.hash === '#feed') {
        setCurrentView('feed');
      }
    } catch {}

    return () => {
      unsubscribe();
      unsubscribeWishes();
      unsubscribeFeed();
    };
  }, []);

  // Admin Console Routing & Access Controller
  const openAdminConsole = useCallback(async () => {
    setIsVerifyingAdmin(true);
    try {
      if (adminApi.isAuthenticated()) {
        const email = adminApi.getAdminEmail()?.trim().toLowerCase();
        if (email === 'bdhecker34@gmail.com' || email === 'ashik140267@gmail.com') {
          setAdminEmail(email);
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
    const email = adminApi.getAdminEmail() || currentUser?.email || 'ashik140267@gmail.com';
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
    if (cleaned === 'EASY10' || cleaned === 'ARAFAT10') {
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
    let storedRef: string | null = null;
    try {
      storedRef = localStorage.getItem('easymart_referral_ref');
    } catch {}

    const orderWithRef: Order = {
      ...order,
      affiliateRef: storedRef || undefined,
      affiliateCommission: storedRef ? Math.round(order.total * 0.05) : undefined,
    };

    setOrders((prev) => [orderWithRef, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setLatestOrder(orderWithRef);
    showToast('Order confirmed successfully!');

    // Persist order to Firebase Firestore database
    try {
      await saveOrderToFirestore({
        orderId: orderWithRef.id,
        customerName: orderWithRef.customer.fullName,
        customerPhone: orderWithRef.customer.phone,
        deliveryDistrict: orderWithRef.customer.district,
        deliveryAddress: orderWithRef.customer.fullAddress,
        paymentMethod: orderWithRef.paymentMethod,
        trxId: orderWithRef.trxId,
        totalAmount: orderWithRef.total,
        status: orderWithRef.orderStatus,
        items: orderWithRef.items,
        notes: orderWithRef.customer.orderNote,
        userId: orderWithRef.userId,
        userEmail: orderWithRef.userEmail,
        affiliateRef: orderWithRef.affiliateRef,
        affiliateCommission: orderWithRef.affiliateCommission,
      });
    } catch (e) {
      console.warn('Firestore order save note:', e);
    }
  };

  // Submit Customer Wish / Product Request
  const handleCustomerWishSubmit = async (wish: CustomerWish): Promise<boolean> => {
    try {
      const ok = await saveCustomerWishToFirestore(wish);
      if (ok) {
        setCustomerWishes((prev) => [wish, ...prev.filter((w) => w.id !== wish.id)]);
        showToast(language === 'bn' ? 'আপনার উইশটি অ্যাডমিনের কাছে জমা হয়েছে!' : 'Your wish has been submitted to admin!');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Customer wish submit error:', e);
      return false;
    }
  };

  // Update Customer Wish Status & Notes
  const handleUpdateCustomerWishStatus = async (
    wishId: string,
    status: WishStatus,
    adminNotes?: string
  ): Promise<boolean> => {
    try {
      const ok = await updateCustomerWishStatusInFirestore(wishId, status, adminNotes);
      if (ok) {
        setCustomerWishes((prev) =>
          prev.map((w) => (w.id === wishId ? { ...w, status, adminNotes: adminNotes ?? w.adminNotes } : w))
        );
        showToast('উইশ স্ট্যাটাস আপডেট হয়েছে');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Update wish status error:', e);
      return false;
    }
  };

  // Delete Customer Wish
  const handleDeleteCustomerWish = async (wishId: string): Promise<boolean> => {
    try {
      const ok = await deleteCustomerWishFromFirestore(wishId);
      if (ok) {
        setCustomerWishes((prev) => prev.filter((w) => w.id !== wishId));
        showToast('উইশ মুছে ফেলা হয়েছে');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Delete wish error:', e);
      return false;
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

  // Category Carousel Slider State & Controls
  const categorySliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isCategoryAutoSlidePaused, setIsCategoryAutoSlidePaused] = useState(false);
  const [isHoveredOrTouched, setIsHoveredOrTouched] = useState(false);

  const checkCategoryScrollButtons = useCallback(() => {
    if (categorySliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categorySliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = categorySliderRef.current;
    if (!el) return;
    checkCategoryScrollButtons();
    el.addEventListener('scroll', checkCategoryScrollButtons, { passive: true });
    window.addEventListener('resize', checkCategoryScrollButtons);
    return () => {
      el.removeEventListener('scroll', checkCategoryScrollButtons);
      window.removeEventListener('resize', checkCategoryScrollButtons);
    };
  }, [checkCategoryScrollButtons, categoryTabs]);

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categorySliderRef.current) {
      const el = categorySliderRef.current;
      const scrollStep = Math.max(el.clientWidth * 0.45, 190);
      
      if (direction === 'right') {
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 15;
        if (atEnd) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: scrollStep, behavior: 'smooth' });
        }
      } else {
        const atStart = el.scrollLeft <= 10;
        if (atStart) {
          el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: -scrollStep, behavior: 'smooth' });
        }
      }
    }
  };

  // Automatic Slide Interval (loops smoothly every 2.6 seconds, pauses when user hovers or touches)
  useEffect(() => {
    if (isCategoryAutoSlidePaused || isHoveredOrTouched) return;

    const intervalId = setInterval(() => {
      if (categorySliderRef.current) {
        const el = categorySliderRef.current;
        if (el.scrollWidth <= el.clientWidth) return;

        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 25;
        if (atEnd) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Slide by roughly one category card with gap
          const step = 175;
          el.scrollBy({ left: step, behavior: 'smooth' });
        }
      }
    }, 2600);

    return () => clearInterval(intervalId);
  }, [isCategoryAutoSlidePaused, isHoveredOrTouched, categoryTabs]);

  // Center active category inside the slider view when chosen
  useEffect(() => {
    if (categorySliderRef.current && activeCategory) {
      const activeBtn = categorySliderRef.current.querySelector<HTMLElement>(
        `[data-category-id="${activeCategory}"]`
      );
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategory]);

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
        adminEmail={adminEmail || 'admin@easymart.com'}
        content={storeContent}
        orders={orders}
        customerWishes={customerWishes}
        feedPosts={feedPosts}
        onUpdateContent={handleUpdateContent}
        onUpdateOrders={handleUpdateOrders}
        onUpdateWishStatus={handleUpdateCustomerWishStatus}
        onDeleteWish={handleDeleteCustomerWish}
        onDeleteFeedPost={async (postId) => {
          return await deleteFeedPostFromFirestore(postId);
        }}
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

  // ================= EASY MART NEWS FEED =================
  if (currentView === 'feed') {
    return (
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans">
        <CommunityFeed
          currentUser={currentUser}
          posts={feedPosts}
          language={language}
          onBackToStore={() => {
            setCurrentView('store');
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('view');
              url.searchParams.delete('post');
              window.history.replaceState({}, '', url.toString());
            } catch {}
          }}
          onOpenAuth={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          adminEmail={adminApi.getAdminEmail() || currentUser?.email || 'ashik140267@gmail.com'}
        />

        {/* Customer Auth & Account Modals */}
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            defaultMode={authModalMode}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={() => {
              setIsAuthModalOpen(false);
              showToast('স্বাগতম! আপনি সফলভাবে লগইন করেছেন');
            }}
          />
        )}
        {isAccountModalOpen && currentUser && (
          <CustomerAccountModal
            isOpen={isAccountModalOpen}
            user={currentUser}
            onClose={() => setIsAccountModalOpen(false)}
            onOpenAffiliate={() => setIsAffiliateModalOpen(true)}
            affiliateAccount={affiliateAccount}
            onTrackOrder={(orderId) => {
              setIsAccountModalOpen(false);
              setTrackingOrderId(orderId);
              setIsTrackOrderOpen(true);
            }}
            onLogout={async () => {
              await signOut(auth);
              setIsAccountModalOpen(false);
              showToast('আপনি সফলভাবে লগআউট করেছেন');
            }}
          />
        )}

        {/* Affiliate Modal */}
        <AffiliateModal
          isOpen={isAffiliateModalOpen}
          onClose={() => setIsAffiliateModalOpen(false)}
          currentUser={currentUser}
          onOpenAuth={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          affiliateAccount={affiliateAccount}
          onAffiliateCreated={(newAcc) => {
            setAffiliateAccount(newAcc);
            showToast('অভিনন্দন! আপনার অ্যাফিলিয়েট একাউন্ট সফলভাবে সক্রিয় হয়েছে');
          }}
          products={
            storeContent.products && storeContent.products.length > 0
              ? storeContent.products
              : DEFAULT_STORE_CONTENT.products
          }
        />

        {/* PWA App Installation Popup System */}
        <PWAInstallModal
          language={language}
          isOpenManual={isPWAInstallModalOpen}
          onCloseManual={() => setIsPWAInstallModalOpen(false)}
        />
      </div>
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
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-[#f36805] selection:text-white transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-200">
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
        onOpenCustomerWishModal={() => setIsCustomerWishModalOpen(true)}
        onOpenFeed={() => setCurrentView('feed')}
        onOpenInstallApp={() => setIsPWAInstallModalOpen(true)}
        onOpenAffiliate={() => setIsAffiliateModalOpen(true)}
        hasAffiliateAccount={!!affiliateAccount}
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
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
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

      {/* Main Catalog & Content Stream */}
      <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-16">
        
        {/* BEGIN: CategoriesSection - Find your aisle (Shop by Department) */}
        <motion.section
          id="departments-section"
          data-purpose="department-grid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#f36805] uppercase">
                SHOP BY DEPARTMENT
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Find your aisle
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Eight departments, one basket. Browse the categories our customers order from most.
              </p>
            </div>
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                const el = document.getElementById('featured-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#f36805] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Browse everything</span>
              <ArrowRight className="w-3.5 h-3.5 text-[11px]" />
            </motion.button>
          </div>

          {/* 8 Categories Visual Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            {EASY_MART_DEPARTMENTS.map((dept, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveCategory(dept.category);
                  setSearchQuery('');
                  const el = document.getElementById('featured-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-xs hover:shadow-lg transition-all text-left cursor-pointer border border-slate-100"
              >
                <img
                  alt={dept.title}
                  src={dept.image}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-xs sm:text-sm leading-tight">
                    {dept.title}
                  </h3>
                  <p className="text-[10px] text-stone-300 mt-0.5 line-clamp-1">
                    {dept.subtitle}
                  </p>
                  <span className="text-[10px] font-semibold text-orange-300 flex items-center gap-1 mt-1 group-hover:translate-x-1 transition-transform">
                    Shop now <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>
        {/* END: CategoriesSection */}

        {/* BEGIN: FeaturedPicksSection - Handpicked this week */}
        <section id="featured-section" data-purpose="featured-products">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#f36805] uppercase">
                HANDPICKED THIS WEEK
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Featured picks
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The pieces our team keeps restocking — checked for stitching, finish and value.
              </p>
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>

              {activeCategory !== 'all' && (
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-[#f36805] hover:underline cursor-pointer"
                >
                  Show all
                </button>
              )}
            </div>
          </div>

          {/* Active Search Filter State */}
          {searchQuery.trim() && (
            <div className="mb-6 flex items-center justify-between bg-amber-50 border border-orange-100 px-4 py-2.5 rounded-xl text-xs text-slate-800">
              <span>
                Searching for: &ldquo;<strong className="text-[#f36805]">{searchQuery}</strong>&rdquo; ({filteredProducts.length} results)
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#f36805] underline font-semibold hover:text-[#db5c00] cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* 4-Column Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                No matching products found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Try searching for &quot;panjabi&quot;, &quot;kurti&quot;, &quot;power bank&quot;, or &quot;cookware&quot;, or switch category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-[#f36805] hover:bg-[#db5c00] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.slice(0, 8).map((product, index) => (
                <ProductCard
                  key={product.id}
                  index={index}
                  product={product}
                  language={language}
                  onQuickView={setSelectedProduct}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  isWishlisted={wishlist.some((w) => w.id === product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onOpenShare={setSharingProduct}
                />
              ))}
            </div>
          )}
        </section>
        {/* END: FeaturedPicksSection */}

        {/* BEGIN: PromoBannerSection - Up to 35% off home & kitchen */}
        <motion.section
          data-purpose="promo-banner"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="rounded-3xl bg-[#0f172a] overflow-hidden grid grid-cols-1 md:grid-cols-2 text-white shadow-xl relative">
            {/* Content Side */}
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider w-max mb-4 border border-orange-500/30">
                <Zap className="w-3.5 h-3.5 text-xs text-orange-400" />
                <span>WEEKEND DROP</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-white mb-4">
                Up to 35% off home &amp; kitchen
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed max-w-md">
                Cookware sets, dinnerware and small appliances at their lowest price of the season. Stock is limited to what is already in our warehouse.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveCategory('home-kitchen');
                    setSearchQuery('');
                    const el = document.getElementById('featured-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 bg-[#f36805] hover:bg-[#db5c00] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer btn-press"
                >
                  <span>Shop the deals</span>
                  <ArrowRight className="w-3 h-3 text-[10px]" />
                </motion.button>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>Ends Sunday midnight</span>
                </div>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative min-h-[260px] md:min-h-full overflow-hidden">
              <img
                alt="Kitchen Cookware Banner"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyg47fYNc_P3KRSjqhu4uBL5dMhCPvYpUU77I3RTXDW83eDxelB-P4I6zbdaJHVdO8JjF9Bw-wg8T8c9puemFYW61rYm0p3xeJyPhSZoT9SFWd1UmztqQDVj4y39d5h6McrdSSYKtdRuQnR_Hml24XLYi9znELgT9XED-U8kvx22nJHgRqm9s0o_4FnmebszzoBJmHkqJsnyM1mxnMZx5rqP3YtbDEJpWV9BNDdDE"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0f172a] via-transparent to-transparent"></div>
            </div>
          </div>
        </motion.section>
        {/* END: PromoBannerSection */}

        {/* BEGIN: NewArrivalsSection - Fresh Stock */}
        <motion.section
          data-purpose="new-arrivals"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#f36805] uppercase">
                FRESH STOCK
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                New arrivals
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Just landed in the warehouse and ready to ship today.
              </p>
            </div>
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveCategory('all');
                setSortBy('featured');
                const el = document.getElementById('featured-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#f36805] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Shop new in</span>
              <ArrowRight className="w-3.5 h-3.5 text-[11px]" />
            </motion.button>
          </div>

          {/* 8 New Arrivals Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {(filteredProducts.length > 8 ? filteredProducts.slice(8, 16) : [...filteredProducts].reverse()).map((product, index) => (
              <ProductCard
                key={`new-${product.id}`}
                index={index}
                product={product}
                language={language}
                onQuickView={setSelectedProduct}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                isWishlisted={wishlist.some((w) => w.id === product.id)}
                onToggleWishlist={handleToggleWishlist}
                onOpenShare={setSharingProduct}
              />
            ))}
          </div>
        </motion.section>
        {/* END: NewArrivalsSection */}

        {/* BEGIN: TestimonialsSection - 26,000 orders and counting */}
        <motion.section
          data-purpose="customer-reviews"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="mb-6">
            <span className="text-[10px] font-extrabold tracking-widest text-[#f36805] uppercase">
              FROM OUR CUSTOMERS
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              26,000 orders and counting
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real notes from shoppers who ordered this season.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                text: "Ordered a three-piece on Thursday night and it reached Sylhet by Saturday morning. The fabric was exactly like the photos.",
                author: "Nusrat Jahan",
                loc: "Sylhet, Bangladesh",
                initials: "NJ",
                color: "bg-emerald-100 text-emerald-800",
              },
              {
                text: "I was sceptical about the power bank price but it has been solid for four months. Delivery guy called before arriving too.",
                author: "Rakib Hasan",
                loc: "Chattogram, Bangladesh",
                initials: "RH",
                color: "bg-cyan-100 text-cyan-800",
              },
              {
                text: "The cookware set arrived well packed with no dents. Customer support replied on WhatsApp within minutes when I asked about the lid.",
                author: "Farhana Akter",
                loc: "Dhaka, Bangladesh",
                initials: "FA",
                color: "bg-emerald-100 text-emerald-800",
              },
            ].map((review, rIdx) => (
              <motion.div
                key={rIdx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: rIdx * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl bg-amber-50/30 border border-orange-100 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-orange-100/60">
                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${review.color}`}>
                    {review.initials}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{review.author}</h5>
                    <span className="text-[10px] text-slate-400">{review.loc}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
        {/* END: TestimonialsSection */}

        {/* BEGIN: SupportAndContactSection - Talk to a real person in Jashore */}
        <section id="contact-section" className="pt-6 border-t border-slate-100" data-purpose="contact-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                CONTACT US
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Talk to a real person in Jashore
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Questions about sizing, delivery or a return? Message us on WhatsApp for the fastest reply, or email us any time — we answer every message within a day.
              </p>
            </div>
            <a
              className="inline-flex items-center gap-2 bg-[#2d7350] hover:bg-[#235e40] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors whitespace-nowrap self-start sm:self-center"
              href="https://wa.me/8801410556747"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Info Cards & Map Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* 4 Contact Info Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1 */}
              <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-100/80">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#f36805] flex items-center justify-center text-xs mb-2.5">
                  <MapPin className="w-4 h-4 text-[#f36805]" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  VISIT OUR OFFICE
                </h4>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  Mohanpur, Manirampur, Jashore, Bangladesh
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100/80">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs mb-2.5">
                  <Mail className="w-4 h-4 text-emerald-700" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  EMAIL US
                </h4>
                <a
                  className="text-xs font-semibold text-[#f36805] hover:underline mt-1 block truncate"
                  href="mailto:arafathossain.main@gmail.com"
                >
                  arafathossain.main@gmail.com
                </a>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-100/80">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#f36805] flex items-center justify-center text-xs mb-2.5">
                  <Phone className="w-4 h-4 text-[#f36805]" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  WHATSAPP
                </h4>
                <p className="text-xs font-semibold text-slate-800 mt-1">01410556747</p>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  International format: +8801410556747
                </span>
              </div>

              {/* Card 4 */}
              <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-100/80">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#f36805] flex items-center justify-center text-xs mb-2.5">
                  <Clock className="w-4 h-4 text-[#f36805]" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  OPENING HOURS
                </h4>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  Saturday - Thursday, 9am to 9pm
                </p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Call <a className="text-[#f36805] font-medium" href="tel:01410556747">01410556747</a>
                </span>
              </div>

              {/* Wide Badge: Delivery info */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-orange-50/50 border border-orange-100/90 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#f36805] flex items-center justify-center text-xs shrink-0">
                  <Truck className="w-4 h-4 text-[#f36805]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Delivery to all 64 districts
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cash on delivery available nationwide.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map Component */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 relative min-h-[280px] shadow-xs bg-slate-100">
              <iframe
                allowFullScreen
                className="w-full h-full min-h-[300px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14693.303916962295!2d89.222718!3d23.011832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ff39a8ab02ea37%3A0xe54e8ec6da339893!2sManirampur%2C%20Bangladesh!5e0!3m2!1sen!2sbd!4v1715000000000!5m2!1sen!2sbd"
                title="Easy Mart Location Map"
              ></iframe>
              {/* Floating Location Badge on Map */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-slate-200/80 max-w-xs text-left">
                <h5 className="text-xs font-bold text-slate-900">Mohanpur, College road</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">26FM+P46, Manirampur, Bangladesh</p>
                <a
                  className="mt-2 inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold px-2.5 py-1 rounded shadow-xs transition-colors"
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="w-3 h-3" /> Open in Maps
                </a>
              </div>
            </div>
          </div>
        </section>
        {/* END: SupportAndContactSection */}

        {/* Nationwide 64-District Logistics Network Banner */}
        {storeContent.homepage?.showNationwideBanner !== false && (
          <section className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Delivery Commitment */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase font-bold tracking-widest text-[#f36805] mb-2">
                    {language === 'bn' ? 'দেশজুড়ে ৬৪ জেলায় ডেলিভারি নেটওয়ার্ক' : 'Nationwide Logistics Network'}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {language === 'bn' 
                      ? '৬৪ জেলার যেকোনো প্রান্তে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি।' 
                      : 'Fast, verified doorstep delivery to all 64 districts.'}
                  </h2>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {language === 'bn'
                      ? 'ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহী, বগুড়া কিংবা প্রত্যন্ত যেকোনো উপজেলায়—আমাদের নির্ভরযোগ্য কুরিয়ার টিম নিশ্চিত করে অক্ষত ও অরিজিনাল প্যাকেজ।'
                      : 'Whether you are in Dhaka, Chattogram, Sylhet, Bogura, Rajshahi, or remote thanas of Khulna and Barishal, our courier partners ensure your package arrives securely wrapped with double tamper-evident seals.'}
                  </p>

                  {/* 3 Value Pillars */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block">
                        {language === 'bn' ? 'ঢাকা মেট্রো এরিয়া' : 'Dhaka Metropolis'}
                      </span>
                      <span className="text-slate-500 text-[11px] mt-0.5 block">
                        {language === 'bn' ? '২৪ – ৪৮ ঘণ্টায় ডেলিভারি' : '24 – 48 Hours Delivery'} · ৳{storeContent.settings?.dhakaDeliveryFee ?? 60}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block">
                        {language === 'bn' ? 'ঢাকার বাইরে সব জেলা' : 'All Other Districts'}
                      </span>
                      <span className="text-slate-500 text-[11px] mt-0.5 block">
                        {language === 'bn' ? '২ – ৩ দিনে ডেলিভারি' : '2 – 3 Days Delivery'} · ৳{storeContent.settings?.outsideDeliveryFee ?? 120}
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-orange-100">
                      <span className="font-bold text-slate-900 block">
                        {language === 'bn' ? `৳${storeContent.settings?.freeShippingThreshold ?? 2500} এর বেশি অর্ডারে` : `Orders over ৳${storeContent.settings?.freeShippingThreshold ?? 2500}`}
                      </span>
                      <span className="text-[#f36805] text-[11px] mt-0.5 block font-semibold">
                        {language === 'bn' ? '১০০% ফ্রি হোম ডেলিভারি' : '100% Free Nationwide Delivery'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      {language === 'bn' ? 'ডেলিভারি ম্যানের সামনে পার্সেল চেক করার সুবিধা' : 'Parcel open check before paying rider allowed'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setTrackingOrderId(undefined);
                      setIsTrackOrderOpen(true);
                    }}
                    className="font-bold text-[#f36805] hover:text-[#db5c00] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'পার্সেল ট্র্যাক করুন' : 'Track Consignment'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Division Summary Grid */}
              <div className="lg:col-span-5 bg-slate-50/70 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#f36805]" />
                  <span>{language === 'bn' ? 'সেবা প্রদানকারী প্রশাসনিক বিভাগসমূহ:' : 'Administrative Divisions Served:'}</span>
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <div
                      key={div.id}
                      className="p-2 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800">
                        {language === 'bn' ? div.nameBn : div.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {div.districts.length} {language === 'bn' ? 'জেলা' : 'Dist.'}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[11px] text-slate-500 text-center">
                  {language === 'bn' 
                    ? 'ক্যাশ অন ডেলিভারিতে সমগ্র ৬৪ জেলা ও ৪৯৫+ উপজেলা অন্তর্ভুক্ত।' 
                    : 'Total 64 districts and 495+ upazilas covered nationwide with Cash on Delivery.'}
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
        onOpenShare={setSharingProduct}
        language={language}
        onToast={showToast}
      />

      {/* Product Share Modal */}
      <ProductShareModal
        product={sharingProduct}
        isOpen={!!sharingProduct}
        onClose={() => setSharingProduct(null)}
        language={language}
        onToast={showToast}
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
          onOpenAffiliate={() => setIsAffiliateModalOpen(true)}
          affiliateAccount={affiliateAccount}
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

      {/* Customer Wish / Product Request Modal */}
      <CustomerWishModal
        isOpen={isCustomerWishModalOpen}
        onClose={() => setIsCustomerWishModalOpen(false)}
        currentUser={currentUser}
        language={language}
        onSubmitWish={handleCustomerWishSubmit}
        whatsappNumber={storeContent.contact?.whatsapp}
      />

      {/* Affiliate Program & Dashboard Modal */}
      <AffiliateModal
        isOpen={isAffiliateModalOpen}
        onClose={() => setIsAffiliateModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        affiliateAccount={affiliateAccount}
        onAffiliateCreated={(newAcc) => {
          setAffiliateAccount(newAcc);
          showToast('অভিনন্দন! আপনার অ্যাফিলিয়েট একাউন্ট সফলভাবে সক্রিয় হয়েছে');
        }}
        products={
          storeContent.products && storeContent.products.length > 0
            ? storeContent.products
            : DEFAULT_STORE_CONTENT.products
        }
      />

      {/* PWA App Installation Popup System */}
      <PWAInstallModal
        language={language}
        isOpenManual={isPWAInstallModalOpen}
        onCloseManual={() => setIsPWAInstallModalOpen(false)}
      />

      {/* Floating WhatsApp Quick Contact Button (Positioned on the Right side) */}
      <motion.a
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        href={`https://wa.me/88${storeContent.contact?.whatsapp || '01410556747'}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat on WhatsApp: ${storeContent.contact?.whatsapp || '01410556747'}`}
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all border border-emerald-300/40 hover:shadow-emerald-500/30 group cursor-pointer"
      >
        <span className="relative flex items-center justify-center">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </span>
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          WhatsApp {storeContent.contact?.whatsapp || '01410556747'}
        </span>
      </motion.a>
    </div>
  );
}
