import React, { useState } from 'react';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Package,
  Layers,
  Bell,
  PhoneCall,
  Tag,
  Truck,
  Settings,
  ShieldCheck,
  Smartphone,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  Search,
  ArrowUp,
  ArrowDown,
  X,
  AlertTriangle,
  Menu,
  Images,
  Sliders,
  Upload,
  Copy,
} from 'lucide-react';
import { Product, ProductCategory, Order, OrderStatus } from '../types';
import { adminApi, AdminContentState, BannerItem, AuditLogEntry, MediaItem } from '../services/adminApi';

interface AdminDashboardProps {
  adminEmail: string;
  content: AdminContentState;
  orders: Order[];
  onUpdateContent: (newContent: AdminContentState) => void;
  onUpdateOrders: (newOrders: Order[]) => void;
  onLogout: () => void;
  onViewStore: () => void;
}

type TabType =
  | 'overview'
  | 'banners'
  | 'products'
  | 'categories'
  | 'homepage'
  | 'notices'
  | 'contact'
  | 'coupons'
  | 'orders'
  | 'media'
  | 'settings'
  | 'security'
  | 'android';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  content,
  orders,
  onUpdateContent,
  onUpdateOrders,
  onLogout,
  onViewStore,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Local draft state
  const [localContent, setLocalContent] = useState<AdminContentState>(content);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Product Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'product' | 'banner' | 'media' | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);

  // STRICT ACCESS CONTROL GATE
  if (adminEmail?.toLowerCase().trim() !== 'bdhecker34@gmail.com') {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-rose-700/60 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/40 text-2xl font-bold">
            ✕
          </div>
          <h2 className="text-xl font-bold text-white">অ্যাক্সেস ডিনাইড (Access Denied)</h2>
          <p className="text-stone-300 text-xs leading-relaxed">
            এই অ্যাকাউন্টটি (<span className="text-rose-400 font-mono">{adminEmail || 'Unknown'}</span>) অনুমোদিত নয়। শুধুমাত্র প্রধান অ্যাডমিন <strong className="text-amber-400">bdhecker34@gmail.com</strong> এই প্যানেলে প্রবেশ করতে পারেন।
          </p>
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
          >
            লগআউট করে বেরিয়ে যান
          </button>
        </div>
      </div>
    );
  }

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Media Management
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await adminApi.saveStoreContent(localContent);
      if (res.success) {
        onUpdateContent(localContent);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        alert(res.error || 'Failed to save changes.');
      }
    } catch {
      onUpdateContent(localContent);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadAudit = async () => {
    const logs = await adminApi.fetchAuditLogs();
    setAuditLogs(logs);
  };

  const handleLoadMedia = async () => {
    const list = await adminApi.fetchMedia();
    setMediaList(list);
  };

  const handleUploadMediaFile = async (file: File): Promise<string | null> => {
    setIsUploadingMedia(true);
    setMediaUploadError(null);
    try {
      const res = await adminApi.uploadImage(file);
      if (res.success && res.url) {
        handleLoadMedia();
        return res.url;
      } else {
        setMediaUploadError(res.error || 'Failed to upload image');
        return null;
      }
    } catch (err: any) {
      setMediaUploadError(err.message || 'Error uploading image');
      return null;
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleDeleteMediaFile = async (fileName: string) => {
    const res = await adminApi.deleteMedia(fileName);
    if (res.success) {
      handleLoadMedia();
      setMediaToDelete(null);
    } else {
      alert(res.error || 'Failed to delete file');
    }
  };

  // Orders update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const nextTimeline = o.timeline.map((ev) => {
          if (ev.status === newStatus) {
            return { ...ev, completed: true, current: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
          }
          return { ...ev, current: false };
        });
        return { ...o, orderStatus: newStatus, timeline: nextTimeline };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  // Product CRUD
  const handleSaveProduct = (p: Product) => {
    if (isAddingProduct) {
      setLocalContent((prev) => ({
        ...prev,
        products: [p, ...prev.products],
      }));
      setIsAddingProduct(false);
    } else {
      setLocalContent((prev) => ({
        ...prev,
        products: prev.products.map((item) => (item.id === p.id ? p : item)),
      }));
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setLocalContent((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
    setDeleteConfirmId(null);
  };

  // Filtered products
  const filteredProducts = localContent.products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.titleBn && p.titleBn.toLowerCase().includes(productSearch.toLowerCase())) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const outOfStockCount = localContent.products.filter((p) => !p.inStock || p.stockCount === 0).length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-stone-900 border-b border-stone-800 p-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <img src="./assets/images/easy_mart_logo.png" alt="Easy Mart Logo" className="w-6 h-6 object-contain rounded bg-black" />
          <span className="font-extrabold text-emerald-400 tracking-tight text-sm uppercase">Easy Mart</span>
          <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded font-mono">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewStore}
            className="p-1.5 bg-stone-800 text-stone-300 hover:text-white rounded text-xs"
            title="View Store"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 bg-stone-800 text-stone-300 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-stone-900 border-r border-stone-800 flex flex-col justify-between shrink-0 z-20`}
      >
        <div>
          {/* Brand Wordmark */}
          <div className="p-5 border-b border-stone-800 hidden md:flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="./assets/images/easy_mart_logo.png" alt="Easy Mart Logo" className="w-8 h-8 object-contain rounded-lg bg-black p-0.5 border border-stone-700" />
              <div>
                <h1 className="font-extrabold text-emerald-400 text-base tracking-tight">
                  Easy Mart
                </h1>
                <p className="text-[11px] text-stone-400 font-medium">Control Console</p>
              </div>
            </div>
            <button
              onClick={onViewStore}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
              title="View Live Storefront"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'banners', label: 'Banners & Sliders', icon: ImageIcon },
              { id: 'products', label: 'Product Catalog', icon: Package },
              { id: 'categories', label: 'Categories', icon: Layers },
              { id: 'homepage', label: 'Homepage Layout', icon: Sliders },
              { id: 'notices', label: 'Notice & Announcements', icon: Bell },
              { id: 'contact', label: 'Contact & Social Links', icon: PhoneCall },
              { id: 'coupons', label: 'Vouchers & Coupons', icon: Tag },
              { id: 'orders', label: 'Orders & 64 Districts', icon: Truck },
              { id: 'media', label: 'Media & Uploads', icon: Images },
              { id: 'settings', label: 'Global Settings', icon: Settings },
              { id: 'security', label: 'Security & Audit Logs', icon: ShieldCheck },
              { id: 'android', label: 'Android App & APK', icon: Smartphone },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setMobileMenuOpen(false);
                    if (tab.id === 'security') handleLoadAudit();
                    if (tab.id === 'media') handleLoadMedia();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800 space-y-2 text-xs">
          <div className="truncate text-stone-400 text-[11px]">
            Logged in as: <strong className="text-white block truncate">{adminEmail}</strong>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex-1 py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] font-medium transition-colors"
            >
              Password
            </button>
            <button
              onClick={onLogout}
              className="py-1.5 px-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Workspace Top Bar */}
        <header className="bg-stone-900/90 border-b border-stone-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
            {saveSuccess && (
              <span className="text-[11px] bg-emerald-950 border border-emerald-700 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Changes Saved Live
              </span>
            )}
            <span className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-950/60 border border-orange-700/60 text-orange-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Firebase Live
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewStore}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-colors border border-stone-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Syncing...' : 'Save & Publish Live'}</span>
            </button>
          </div>
        </header>

        {/* Tab Modules */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
          
          {/* ================= 1. OVERVIEW TAB ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl">
                  <span className="text-xs text-stone-400 block">Total Active Products</span>
                  <span className="text-2xl font-extrabold text-white font-mono mt-1 block">
                    {localContent.products.length}
                  </span>
                </div>
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl">
                  <span className="text-xs text-stone-400 block">Total Orders</span>
                  <span className="text-2xl font-extrabold text-amber-400 font-mono mt-1 block">
                    {orders.length}
                  </span>
                </div>
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl">
                  <span className="text-xs text-stone-400 block">Total Revenue</span>
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">
                    ৳{totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl">
                  <span className="text-xs text-stone-400 block">Low / Out of Stock</span>
                  <span className={`text-2xl font-extrabold font-mono mt-1 block ${outOfStockCount > 0 ? 'text-rose-400' : 'text-stone-400'}`}>
                    {outOfStockCount}
                  </span>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="text-[11px] uppercase bg-stone-800/60 text-stone-400 font-mono">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-stone-800/40">
                          <td className="p-3 font-mono font-bold text-amber-300">{o.id}</td>
                          <td className="p-3">{o.customer.fullName}</td>
                          <td className="p-3 text-stone-400">{o.customer.district}</td>
                          <td className="p-3 font-mono font-bold">৳{o.total.toLocaleString()}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-200 uppercase">
                              {o.orderStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <select
                              value={o.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                              className="bg-stone-800 text-stone-200 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none"
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="quality_check">Quality Check</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. BANNERS TAB ================= */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Hero Sliders & Promotional Banners</h3>
                  <p className="text-xs text-stone-400">Add, edit, reorder or toggle banners on the homepage slider.</p>
                </div>
                <button
                  onClick={() => {
                    const newBanner: BannerItem = {
                      id: Date.now(),
                      kicker: 'Special Campaign',
                      title: 'New Featured Collection',
                      subtitle: 'Premium handcrafted essentials tailored for modern Bangladeshi lifestyle.',
                      image: '/src/assets/images/hero_arafat_mart_lifestyle_1792405781284.jpg',
                      tag: 'Fast Delivery',
                      primaryCta: 'Explore Collection',
                      category: 'all',
                      active: true,
                    };
                    setLocalContent({ ...localContent, banners: [...localContent.banners, newBanner] });
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slide</span>
                </button>
              </div>

              <div className="space-y-4">
                {localContent.banners.map((slide, idx) => (
                  <div key={slide.id || idx} className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                      <span className="font-bold text-amber-400 text-xs">Slide 0{idx + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => {
                            const copy = [...localContent.banners];
                            const temp = copy[idx - 1];
                            copy[idx - 1] = copy[idx];
                            copy[idx] = temp;
                            setLocalContent({ ...localContent, banners: copy });
                          }}
                          className="p-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded text-stone-300"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === localContent.banners.length - 1}
                          onClick={() => {
                            const copy = [...localContent.banners];
                            const temp = copy[idx + 1];
                            copy[idx + 1] = copy[idx];
                            copy[idx] = temp;
                            setLocalContent({ ...localContent, banners: copy });
                          }}
                          className="p-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded text-stone-300"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setLocalContent({
                              ...localContent,
                              banners: localContent.banners.filter((_, i) => i !== idx),
                            });
                          }}
                          className="p-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-stone-400 block mb-1">Headline Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            const copy = [...localContent.banners];
                            copy[idx].title = e.target.value;
                            setLocalContent({ ...localContent, banners: copy });
                          }}
                          className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Top Kicker Text</label>
                        <input
                          type="text"
                          value={slide.kicker}
                          onChange={(e) => {
                            const copy = [...localContent.banners];
                            copy[idx].kicker = e.target.value;
                            setLocalContent({ ...localContent, banners: copy });
                          }}
                          className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-stone-400 block mb-1">Subtitle Description</label>
                        <textarea
                          rows={2}
                          value={slide.subtitle}
                          onChange={(e) => {
                            const copy = [...localContent.banners];
                            copy[idx].subtitle = e.target.value;
                            setLocalContent({ ...localContent, banners: copy });
                          }}
                          className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Button Text</label>
                        <input
                          type="text"
                          value={slide.primaryCta}
                          onChange={(e) => {
                            const copy = [...localContent.banners];
                            copy[idx].primaryCta = e.target.value;
                            setLocalContent({ ...localContent, banners: copy });
                          }}
                          className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-stone-300 text-xs font-semibold">ব্যানার ছবির ইউআরএল</label>
                          <label className="text-xs bg-stone-700 hover:bg-stone-600 text-amber-300 px-2.5 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-all">
                            <span>📁 আপলোড করুন</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleUploadMediaFile(file);
                                  if (url) {
                                    const copy = [...localContent.banners];
                                    copy[idx].image = url;
                                    setLocalContent({ ...localContent, banners: copy });
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="https://... অথবা আপলোড করুন"
                          value={slide.image}
                          onChange={(e) => {
                            const copy = [...localContent.banners];
                            copy[idx].image = e.target.value;
                            setLocalContent({ ...localContent, banners: copy });
                          }}
                          className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 3. PRODUCTS TAB ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Product Catalog Management</h3>
                  <p className="text-xs text-stone-400">Total {localContent.products.length} products published.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct({
                      id: `afm-${Date.now()}`,
                      title: '',
                      titleBn: '',
                      category: 'fashion',
                      price: 1500,
                      originalPrice: 1800,
                      rating: 4.9,
                      reviewsCount: 1,
                      inStock: true,
                      stockCount: 20,
                      image: '/src/assets/images/product_silk_embroidered_panjabi_1792405780182.jpg',
                      gallery: ['/src/assets/images/product_silk_embroidered_panjabi_1792405780182.jpg'],
                      description: '',
                      features: ['100% Quality Checked'],
                      specs: { Material: 'Premium Quality' },
                      sizes: ['M', 'L', 'XL'],
                      colors: ['Classic'],
                      isFeatured: true,
                    });
                    setIsAddingProduct(true);
                  }}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product name or ID..."
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                  />
                </div>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-stone-900 border border-stone-800 text-stone-200 rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="all">All Categories</option>
                  <option value="fashion">Fashion</option>
                  <option value="gadgets">Gadgets</option>
                  <option value="home-kitchen">Home & Kitchen</option>
                  <option value="beauty-care">Beauty & Wellness</option>
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-800/60 text-stone-400 uppercase font-mono text-[11px]">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-stone-800/40">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-10 h-10 object-cover rounded-lg border border-stone-700 bg-stone-800 shrink-0"
                                style={{ aspectRatio: '1/1' }}
                              />
                              <div className="min-w-0">
                                <span className="font-semibold text-white block truncate max-w-xs">{p.title}</span>
                                <span className="text-[10px] text-stone-500 font-mono">{p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 capitalize">{p.category}</td>
                          <td className="p-3 font-mono font-bold text-amber-400">৳{p.price.toLocaleString()}</td>
                          <td className="p-3 font-mono">{p.stockCount} units</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                p.inStock ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                              }`}
                            >
                              {p.inStock ? 'In Stock' : 'Stock Out'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct({ ...p });
                                  setIsAddingProduct(false);
                                }}
                                className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded"
                                title="Edit Product"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(p.id)}
                                className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. CATEGORIES TAB ================= */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Store Categories</h3>
                  <p className="text-xs text-stone-400">Configure catalog categories and bilingual labels.</p>
                </div>
                <button
                  onClick={() => {
                    const newCat = {
                      id: `cat-${Date.now()}`,
                      name: 'New Category',
                      nameBn: 'নতুন ক্যাটাগরি',
                      active: true,
                    };
                    setLocalContent({ ...localContent, categories: [...localContent.categories, newCat] });
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="space-y-3">
                {localContent.categories.map((cat, idx) => (
                  <div key={cat.id} className="p-3 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-stone-400 block">English Name</label>
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => {
                            const copy = [...localContent.categories];
                            copy[idx].name = e.target.value;
                            setLocalContent({ ...localContent, categories: copy });
                          }}
                          className="w-full p-1.5 bg-stone-800 border border-stone-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-400 block">Bengali Name</label>
                        <input
                          type="text"
                          value={cat.nameBn}
                          onChange={(e) => {
                            const copy = [...localContent.categories];
                            copy[idx].nameBn = e.target.value;
                            setLocalContent({ ...localContent, categories: copy });
                          }}
                          className="w-full p-1.5 bg-stone-800 border border-stone-700 rounded text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const copy = [...localContent.categories];
                          copy[idx].active = !copy[idx].active;
                          setLocalContent({ ...localContent, categories: copy });
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-semibold ${
                          cat.active ? 'bg-emerald-950 text-emerald-300' : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {cat.active ? 'Visible' : 'Hidden'}
                      </button>
                      <button
                        onClick={() => {
                          setLocalContent({
                            ...localContent,
                            categories: localContent.categories.filter((_, i) => i !== idx),
                          });
                        }}
                        className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 5. NOTICES TAB ================= */}
          {activeTab === 'notices' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">Top Notification Bar</h3>
                <p className="text-xs text-stone-400">Control the top promotional bar displayed across all pages.</p>
              </div>

              <div className="p-5 bg-stone-900 border border-stone-800 rounded-xl space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Enable Top Announcement Bar</span>
                  <input
                    type="checkbox"
                    checked={localContent.notice.enabled}
                    onChange={(e) =>
                      setLocalContent({
                        ...localContent,
                        notice: { ...localContent.notice, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-amber-600 rounded bg-stone-800 border-stone-700"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Announcement Text</label>
                  <textarea
                    rows={2}
                    value={localContent.notice.text}
                    onChange={(e) =>
                      setLocalContent({
                        ...localContent,
                        notice: { ...localContent.notice, text: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. CONTACT & PAYMENT NUMBERS TAB ================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-sm font-bold text-white">Customer Support & Payment Accounts</h3>
                <p className="text-xs text-stone-400">
                  Manage WhatsApp helpline and payment accounts displayed in Checkout and Footer.
                </p>
              </div>

              <div className="p-5 bg-stone-900 border border-stone-800 rounded-xl space-y-4 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">WhatsApp Customer Support Helpline</label>
                  <input
                    type="text"
                    value={localContent.contact.whatsapp}
                    onChange={(e) =>
                      setLocalContent({
                        ...localContent,
                        contact: { ...localContent.contact, whatsapp: e.target.value },
                      })
                    }
                    placeholder="01410556747"
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-pink-400 font-semibold block mb-1">bKash Account Number</label>
                    <input
                      type="text"
                      value={localContent.contact.bkash}
                      onChange={(e) =>
                        setLocalContent({
                          ...localContent,
                          contact: { ...localContent.contact, bkash: e.target.value },
                        })
                      }
                      placeholder="01350292697"
                      className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-orange-400 font-semibold block mb-1">Nagad Account Number</label>
                    <input
                      type="text"
                      value={localContent.contact.nagad}
                      onChange={(e) =>
                        setLocalContent({
                          ...localContent,
                          contact: { ...localContent.contact, nagad: e.target.value },
                        })
                      }
                      placeholder="01350292697"
                      className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-purple-400 font-semibold block mb-1">Rocket Account Number</label>
                    <input
                      type="text"
                      value={localContent.contact.rocket}
                      onChange={(e) =>
                        setLocalContent({
                          ...localContent,
                          contact: { ...localContent.contact, rocket: e.target.value },
                        })
                      }
                      placeholder="01410556740"
                      className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Official Support Email</label>
                  <input
                    type="email"
                    value={localContent.contact.email}
                    onChange={(e) =>
                      setLocalContent({
                        ...localContent,
                        contact: { ...localContent.contact, email: e.target.value },
                      })
                    }
                    placeholder="arafathossain.main@gmail.com"
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Central Distribution Hub Address</label>
                  <input
                    type="text"
                    value={localContent.contact.address}
                    onChange={(e) =>
                      setLocalContent({
                        ...localContent,
                        contact: { ...localContent.contact, address: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded text-white"
                  />
                </div>
              </div>

              {/* ================= SOCIAL MEDIA PLATFORMS SECTION ================= */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>সোশ্যাল মিডিয়া প্ল্যাটফর্ম ও লিংক (Social Media Links)</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      ওয়েবসাইটের নিচে ফেসবুক, ইউটিউব, ইনস্টাগ্রাম ও টিকটক লিংক প্রদর্শন করুন। ইউজাররা ক্লিক করলে সরাসরি আপনার পেজ ওপেন হবে।
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-stone-900 border border-stone-800 rounded-xl space-y-5 text-xs">
                  {/* Facebook Field */}
                  <div className="space-y-1.5 p-3.5 bg-stone-800/60 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          f
                        </span>
                        <span>Facebook Page / Profile Link (ফেসবুক পেজ লিংক)</span>
                      </label>
                      {localContent.social?.facebook && (
                        <a
                          href={localContent.social.facebook.startsWith('http') ? localContent.social.facebook : `https://${localContent.social.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/50"
                        >
                          ভিজিট করে টেস্ট করুন <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={localContent.social?.facebook || ''}
                      onChange={(e) =>
                        setLocalContent({
                          ...localContent,
                          social: {
                            ...(localContent.social || {}),
                            facebook: e.target.value,
                          },
                        })
                      }
                      placeholder="https://facebook.com/your-page-username"
                      className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-stone-500">
                      উদাহরণ: <span className="font-mono text-stone-400">https://facebook.com/easymartbd</span>
                    </p>
                  </div>

                  {/* YouTube Field */}
                  <div className="space-y-1.5 p-3.5 bg-stone-800/60 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#FF0000] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          ▶
                        </span>
                        <span>YouTube Channel Link (ইউটিউব চ্যানেল লিংক)</span>
                      </label>
                      {localContent.social?.youtube && (
                        <a
                          href={localContent.social.youtube.startsWith('http') ? localContent.social.youtube : `https://${localContent.social.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/50"
                        >
                          ভিজিট করে টেস্ট করুন <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={localContent.social?.youtube || ''}
                      onChange={(e) =>
                        setLocalContent({
                          ...localContent,
                          social: {
                            ...(localContent.social || {}),
                            youtube: e.target.value,
                          },
                        })
                      }
                      placeholder="https://youtube.com/@your-channel"
                      className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded text-white font-mono text-xs focus:border-rose-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-stone-500">
                      উদাহরণ: <span className="font-mono text-stone-400">https://youtube.com/@easymartbd</span>
                    </p>
                  </div>

                  {/* Instagram Field */}
                  <div className="space-y-1.5 p-3.5 bg-stone-800/60 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          📷
                        </span>
                        <span>Instagram Profile Link (ইনস্টাগ্রাম প্রোফাইল লিংক)</span>
                      </label>
                      {localContent.social?.instagram && (
                        <a
                          href={localContent.social.instagram.startsWith('http') ? localContent.social.instagram : `https://${localContent.social.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-800/50"
                        >
                          ভিজিট করে টেস্ট করুন <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={localContent.social?.instagram || ''}
                      onChange={(e) =>
                        setLocalContent({
                          ...localContent,
                          social: {
                            ...(localContent.social || {}),
                            instagram: e.target.value,
                          },
                        })
                      }
                      placeholder="https://instagram.com/your-username"
                      className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded text-white font-mono text-xs focus:border-pink-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-stone-500">
                      উদাহরণ: <span className="font-mono text-stone-400">https://instagram.com/easymartbd</span>
                    </p>
                  </div>

                  {/* TikTok Field */}
                  <div className="space-y-1.5 p-3.5 bg-stone-800/60 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-black border border-cyan-400 text-cyan-400 flex items-center justify-center font-bold text-xs shadow-sm">
                          ♪
                        </span>
                        <span>TikTok Profile Link (টিকটক প্রোফাইল লিংক)</span>
                      </label>
                      {localContent.social?.tiktok && (
                        <a
                          href={localContent.social.tiktok.startsWith('http') ? localContent.social.tiktok : `https://${localContent.social.tiktok}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50"
                        >
                          ভিজিট করে টেস্ট করুন <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={localContent.social?.tiktok || ''}
                      onChange={(e) =>
                        setLocalContent({
                          ...localContent,
                          social: {
                            ...(localContent.social || {}),
                            tiktok: e.target.value,
                          },
                        })
                      }
                      placeholder="https://tiktok.com/@your-username"
                      className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-stone-500">
                      উদাহরণ: <span className="font-mono text-stone-400">https://tiktok.com/@easymartbd</span>
                    </p>
                  </div>

                  {/* Live Status Summary Card */}
                  <div className="p-3 bg-stone-800/40 border border-stone-700/60 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                      লাইভ স্ট্যাটাস প্রিভিউ (Live Status on Website)
                    </span>
                    <p className="text-[11px] text-stone-400">
                      উপরে যেকোনো লিংক পরিবর্তন করে উপরের ডানদিকের <strong>"Save Changes"</strong> বাটনে ক্লিক করলে তা সরাসরি ওয়েবসাইটে লাইভ সেভ হয়ে যাবে।
                    </p>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${localContent.social?.facebook ? 'bg-blue-900/60 text-blue-300 border border-blue-700' : 'bg-stone-800 text-stone-500'}`}>
                        Facebook: {localContent.social?.facebook ? 'সংযুক্ত আছে' : 'দেওয়া নেই'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${localContent.social?.youtube ? 'bg-rose-900/60 text-rose-300 border border-rose-700' : 'bg-stone-800 text-stone-500'}`}>
                        YouTube: {localContent.social?.youtube ? 'সংযুক্ত আছে' : 'দেওয়া নেই'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${localContent.social?.instagram ? 'bg-pink-900/60 text-pink-300 border border-pink-700' : 'bg-stone-800 text-stone-500'}`}>
                        Instagram: {localContent.social?.instagram ? 'সংযুক্ত আছে' : 'দেওয়া নেই'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${localContent.social?.tiktok ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700' : 'bg-stone-800 text-stone-500'}`}>
                        TikTok: {localContent.social?.tiktok ? 'সংযুক্ত আছে' : 'দেওয়া নেই'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 7. COUPONS TAB ================= */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Promotions & Vouchers</h3>
                  <p className="text-xs text-stone-400">Create discount coupons for shoppers.</p>
                </div>
                <button
                  onClick={() => {
                    const newCoupon = {
                      code: `SAVE${Math.floor(Math.random() * 90 + 10)}`,
                      discountPercent: 10,
                      minSpend: 1500,
                      active: true,
                    };
                    setLocalContent({ ...localContent, coupons: [...localContent.coupons, newCoupon] });
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Voucher</span>
                </button>
              </div>

              <div className="space-y-3">
                {localContent.coupons.map((c, idx) => (
                  <div key={idx} className="p-3 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-stone-400 block">Voucher Code</label>
                        <input
                          type="text"
                          value={c.code}
                          onChange={(e) => {
                            const copy = [...localContent.coupons];
                            copy[idx].code = e.target.value.toUpperCase();
                            setLocalContent({ ...localContent, coupons: copy });
                          }}
                          className="w-full p-1.5 bg-stone-800 border border-stone-700 rounded text-amber-400 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-400 block">Discount %</label>
                        <input
                          type="number"
                          value={c.discountPercent}
                          onChange={(e) => {
                            const copy = [...localContent.coupons];
                            copy[idx].discountPercent = Number(e.target.value);
                            setLocalContent({ ...localContent, coupons: copy });
                          }}
                          className="w-full p-1.5 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-400 block">Min Spend (৳)</label>
                        <input
                          type="number"
                          value={c.minSpend}
                          onChange={(e) => {
                            const copy = [...localContent.coupons];
                            copy[idx].minSpend = Number(e.target.value);
                            setLocalContent({ ...localContent, coupons: copy });
                          }}
                          className="w-full p-1.5 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setLocalContent({
                          ...localContent,
                          coupons: localContent.coupons.filter((_, i) => i !== idx),
                        });
                      }}
                      className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded ml-3"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 8. ORDERS TAB ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">All Orders & Courier Dispatch Status</h3>
                <p className="text-xs text-stone-400">Total {orders.length} orders recorded nationwide.</p>
              </div>

              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800">
                      <div>
                        <span className="font-mono font-bold text-amber-400 text-sm mr-2">{o.id}</span>
                        <span className="text-stone-400">({o.createdAt})</span>
                        <span className="ml-2 font-mono text-[11px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                          Tracking: {o.trackingNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-300">Milestone:</span>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="bg-stone-800 text-amber-300 font-semibold border border-stone-700 rounded px-2.5 py-1 text-xs focus:outline-none"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="quality_check">Quality Check</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-stone-300">
                      <div>
                        <strong className="text-white block">Recipient Details:</strong>
                        <span>{o.customer.fullName}</span>
                        <span className="block font-mono text-stone-400">{o.customer.phone}</span>
                      </div>
                      <div>
                        <strong className="text-white block">Delivery Address:</strong>
                        <span>{o.customer.fullAddress}</span>
                        <span className="block text-stone-400">{o.customer.district}, {o.customer.division}</span>
                      </div>
                      <div>
                        <strong className="text-white block">Payment & Total:</strong>
                        <span className="uppercase text-amber-400 font-bold">{o.paymentMethod}</span>
                        <span className="block font-mono font-bold text-white text-sm">৳{o.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 9. MEDIA & UPLOADS TAB ================= */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Media & Uploads Library</h3>
                  <p className="text-xs text-stone-400">
                    Upload and manage high-resolution banners, product photos, and campaign assets.
                  </p>
                </div>
                <button
                  onClick={handleLoadMedia}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg border border-stone-700 self-start sm:self-auto"
                >
                  Refresh Library
                </button>
              </div>

              {/* Upload Box */}
              <div className="p-6 bg-stone-900 border-2 border-dashed border-stone-700 hover:border-amber-500 rounded-2xl text-center space-y-3 transition-colors">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Upload New Image File</h4>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Supports JPG, PNG, and WebP format. Maximum file size: 5 MB.
                  </p>
                </div>

                {mediaUploadError && (
                  <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg max-w-md mx-auto">
                    {mediaUploadError}
                  </div>
                )}

                <div className="flex items-center justify-center">
                  <label className="cursor-pointer px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>{isUploadingMedia ? 'Uploading Image...' : 'Select File to Upload'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={isUploadingMedia}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleUploadMediaFile(file);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded Media Grid */}
              <div>
                <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-3">
                  Stored Media Files ({mediaList.length})
                </h4>

                {mediaList.length === 0 ? (
                  <div className="p-8 bg-stone-900 border border-stone-800 rounded-2xl text-center text-xs text-stone-400">
                    <Images className="w-10 h-10 text-stone-600 mx-auto mb-2" />
                    <p>No uploaded media files yet.</p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Upload photos above to host them locally and use their URLs across banners and products.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaList.map((item) => (
                      <div
                        key={item.url}
                        className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden flex flex-col group"
                      >
                        <div className="aspect-square bg-stone-950 relative overflow-hidden">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between text-xs space-y-2">
                          <div className="truncate">
                            <span className="font-semibold text-stone-200 block truncate" title={item.name}>
                              {item.name}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {(item.size / 1024).toFixed(1)} KB
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-stone-800">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.url);
                                setCopiedUrl(item.url);
                                setTimeout(() => setCopiedUrl(null), 2000);
                              }}
                              className="flex-1 py-1 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedUrl === item.url ? 'Copied!' : 'Copy URL'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMediaFile(item.name)}
                              className="p-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded transition-colors"
                              title="Delete File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= 10. SETTINGS TAB ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">Global Application Configuration</h3>
                <p className="text-xs text-stone-400">Configure logistics thresholds and store operations.</p>
              </div>

              <div className="p-5 bg-stone-900 border border-stone-800 rounded-xl space-y-4 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Store Name</label>
                  <input
                    type="text"
                    value={localContent.settings.storeName}
                    onChange={(e) =>
                      setLocalContent({
                        ...localContent,
                        settings: { ...localContent.settings, storeName: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-stone-400 block mb-1">Free Delivery Minimum (৳)</label>
                    <input
                      type="number"
                      value={localContent.settings.freeShippingThreshold}
                      onChange={(e) =>
                        setLocalContent({
                          ...localContent,
                          settings: { ...localContent.settings, freeShippingThreshold: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Dhaka City Shipping (৳)</label>
                    <input
                      type="number"
                      value={localContent.settings.dhakaDeliveryFee}
                      onChange={(e) =>
                        setLocalContent({
                          ...localContent,
                          settings: { ...localContent.settings, dhakaDeliveryFee: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Outside Dhaka Shipping (৳)</label>
                    <input
                      type="number"
                      value={localContent.settings.outsideDeliveryFee}
                      onChange={(e) =>
                        setLocalContent({
                          ...localContent,
                          settings: { ...localContent.settings, outsideDeliveryFee: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Maintenance Mode</span>
                    <span className="text-[11px] text-stone-400">Temporarily disables checkout on public storefront.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localContent.settings.maintenanceMode}
                    onChange={(e) =>
                      setLocalContent({
                        ...localContent,
                        settings: { ...localContent.settings, maintenanceMode: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-amber-600 rounded bg-stone-800 border-stone-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= 10. SECURITY & AUDIT TAB ================= */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Security & Audit Event Logs</h3>
                <p className="text-xs text-stone-400">Immutable trail of administrative updates and logins.</p>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-800/60 text-stone-400 uppercase font-mono text-[11px]">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Module</th>
                      <th className="p-3">Detail</th>
                      <th className="p-3">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-stone-500">
                          No recent security events logged.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-stone-800/40">
                          <td className="p-3 font-mono text-[11px] text-stone-400">{log.formattedDate}</td>
                          <td className="p-3 font-semibold text-amber-300">{log.action}</td>
                          <td className="p-3">{log.module}</td>
                          <td className="p-3 text-stone-300">{log.detail}</td>
                          <td className="p-3 font-mono text-stone-400">{log.adminEmail}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 11. ANDROID APP & APK TAB ================= */}
          {activeTab === 'android' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-sm font-bold text-white">Android Application & APK Build Architecture</h3>
                <p className="text-xs text-stone-400">Production guidelines for publishing Easy Mart on Android.</p>
              </div>

              <div className="p-5 bg-stone-900 border border-stone-800 rounded-xl space-y-4 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-400 text-sm">Option A: Instant Installable Android PWA</h4>
                  <p className="text-stone-300 leading-relaxed">
                    Easy Mart is configured with a Progressive Web App manifest and service worker. When Android users open the website in Chrome, they receive the prompt: <strong>&ldquo;Add Easy Mart to Home screen&rdquo;</strong>, which installs it with an Android app icon, splash screen, and full-screen experience without browser URL bars.
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-800 space-y-2">
                  <h4 className="font-bold text-amber-400 text-sm">Option B: Standalone APK via Jetpack Compose / WebView</h4>
                  <p className="text-stone-300 leading-relaxed">
                    To compile a Google Play Store signed release APK:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-stone-400">
                    <li>Open Android Studio, select &ldquo;New Project &gt; Empty Activity (Jetpack Compose)&rdquo;.</li>
                    <li>Add Android Internet permission to `AndroidManifest.xml`:</li>
                  </ol>
                  <pre className="p-3 bg-stone-950 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`}
                  </pre>
                  <p className="text-stone-300">
                    In `MainActivity.kt`, wrap the application in a custom WebView pointing to your production Cloud Run URL:
                  </p>
                  <pre className="p-3 bg-stone-950 rounded-lg text-amber-300 font-mono text-[11px] overflow-x-auto">
{`AndroidView(
    factory = { context ->
        WebView(context).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            loadUrl("https://ais-pre-klhmxzxunk4y3l7aaoltp3-115447853638.asia-southeast1.run.app")
        }
    },
    modifier = Modifier.fillMaxSize()
)`}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Product Edit / Add Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="font-bold text-white text-sm">
                {isAddingProduct ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Bengali Title</label>
                <input
                  type="text"
                  value={editingProduct.titleBn || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, titleBn: e.target.value })}
                  className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                    className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white"
                  >
                    <option value="fashion">Fashion</option>
                    <option value="gadgets">Gadgets</option>
                    <option value="home-kitchen">Home & Kitchen</option>
                    <option value="beauty-care">Beauty & Wellness</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.stockCount}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Selling Price (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Original Price (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-300 text-xs font-semibold">ছবির ইউআরএল (Image URL)</label>
                  <label className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded cursor-pointer font-medium flex items-center gap-1 shadow-sm transition-all">
                    <span>📁 ডিভাইস থেকে ছবি দিন</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadMediaFile(file);
                          if (url) {
                            setEditingProduct({ ...editingProduct, image: url });
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="https://... বা ImgBB / PostImages লিঙ্ক দিন"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white font-mono text-xs"
                />
                {editingProduct.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={editingProduct.image}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded border border-stone-600"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[11px] text-stone-400">ছবির বর্তমান প্রিভিউ</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={editingProduct.inStock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="inStockCheck" className="text-white font-semibold">Available In Stock</label>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveProduct(editingProduct)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 p-6 rounded-xl max-w-sm w-full space-y-3 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h4 className="font-bold text-white text-sm">Delete Product</h4>
            <p className="text-xs text-stone-400">
              Are you sure you want to permanently remove this product from the storefront?
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 p-6 rounded-xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h4 className="font-bold text-white text-sm">Change Admin Password</h4>
              <button onClick={() => setShowPasswordModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {pwMsg && (
              <p className={`text-xs ${pwMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pwMsg.text}
              </p>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white"
                />
              </div>
              <div>
                <label className="text-stone-400 block mb-1">New Password (min 8 chars)</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full p-2 bg-stone-800 border border-stone-700 rounded text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  const res = await adminApi.changePassword(currentPw, newPw);
                  if (res.success) {
                    setPwMsg({ text: 'Password updated successfully.', success: true });
                    setCurrentPw('');
                    setNewPw('');
                    setTimeout(() => setShowPasswordModal(false), 1500);
                  } else {
                    setPwMsg({ text: res.error || 'Failed to update.', success: false });
                  }
                }}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
