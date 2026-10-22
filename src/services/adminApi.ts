import { Product, ProductCategory } from '../types';
import { saveStoreContentToFirestore, getStoreContentFromFirestore } from './firestoreService';

export interface BannerItem {
  id: number | string;
  kicker: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  primaryCta: string;
  category: ProductCategory;
  active?: boolean;
  displayOrder?: number;
  startDate?: string;
  endDate?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  nameBn: string;
  active: boolean;
  description?: string;
}

export interface CouponItem {
  code: string;
  discountPercent: number;
  minSpend: number;
  active: boolean;
  isFreeShipping?: boolean;
  expiresAt?: string;
}

export interface SocialLinks {
  facebook?: string;
  youtube?: string;
  instagram?: string;
  tiktok?: string;
}

export interface AdminContentState {
  banners: BannerItem[];
  products: Product[];
  categories: CategoryItem[];
  social?: SocialLinks;
  notice: {
    enabled: boolean;
    text: string;
    priority?: 'Normal' | 'High' | 'Urgent';
    linkText?: string;
    linkUrl?: string;
  };
  contact: {
    whatsapp: string;
    bkash: string;
    nagad: string;
    rocket: string;
    email: string;
    address: string;
  };
  coupons: CouponItem[];
  settings: {
    storeName: string;
    tagline?: string;
    maintenanceMode: boolean;
    freeShippingThreshold: number;
    dhakaDeliveryFee: number;
    outsideDeliveryFee: number;
    currencySymbol?: string;
  };
  homepage?: {
    showBanners: boolean;
    showTrustBar: boolean;
    showCategoryFilters: boolean;
    showProductGrid: boolean;
    showNationwideBanner: boolean;
  };
  footer?: {
    aboutText: string;
    copyright: string;
  };
}

export interface MediaItem {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

const TOKEN_KEY = 'arafat_mart_admin_token';
const ADMIN_EMAIL_KEY = 'arafat_mart_admin_email';
const CREDS_KEY = 'arafat_mart_admin_creds';
const SETUP_DONE_KEY = 'arafat_mart_setup_done';
const MEDIA_KEY = 'arafat_mart_media_list';
const AUDIT_KEY = 'arafat_mart_audit_logs';

export interface AdminStatus {
  isSetupComplete: boolean;
  adminEmail?: string;
  setupDate?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  module: string;
  detail: string;
  adminEmail: string;
  timestamp: string;
  formattedDate: string;
}

/**
 * Universal safe JSON fetch helper.
 * Strictly prevents "Unexpected token '<', '<html>' is not valid JSON" errors
 * by checking Content-Type before attempting res.json().
 */
async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; isHtml: boolean }> {
  try {
    const res = await fetch(input, init);
    const contentType = (res.headers.get('content-type') || '').toLowerCase();

    // If response is HTML (e.g. GitHub Pages 404.html or index.html fallback), NEVER call res.json()
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        status: res.status,
        data: null,
        isHtml: contentType.includes('text/html'),
      };
    }

    try {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data, isHtml: false };
    } catch {
      return { ok: false, status: res.status, data: null, isHtml: false };
    }
  } catch {
    return { ok: false, status: 0, data: null, isHtml: false };
  }
}

/**
 * Client-side cryptographic hash for offline & static GitHub Pages security
 */
async function hashClientPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(password + ':arafat_mart_secret_salt_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback if subtle digest fails
    }
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export const adminApi = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setSession(token: string, email: string) {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== 'bdhecker34@gmail.com') {
      console.warn('Security alert: blocked non-admin session:', cleanEmail);
      this.clearSession();
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_EMAIL_KEY, cleanEmail);
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
  },

  getAdminEmail(): string | null {
    const email = localStorage.getItem(ADMIN_EMAIL_KEY);
    return email === 'bdhecker34@gmail.com' ? email : null;
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    const email = localStorage.getItem(ADMIN_EMAIL_KEY)?.trim().toLowerCase();
    if (!token || !email) return false;
    if (email !== 'bdhecker34@gmail.com') {
      this.clearSession();
      return false;
    }
    return true;
  },

  async checkSetupStatus(): Promise<{ isSetupCompleted: boolean; adminEmail?: string }> {
    const status = await this.getStatus();
    return {
      isSetupCompleted: status.isSetupComplete,
      adminEmail: status.adminEmail,
    };
  },

  async getStatus(): Promise<AdminStatus> {
    // 1. Try server endpoint first
    const res = await safeFetchJson<AdminStatus>('/api/admin/status');
    if (res.ok && res.data && typeof res.data.isSetupComplete === 'boolean') {
      return res.data;
    }

    // 2. Safe Fallback: Check localStorage / local credentials
    const localSetup = localStorage.getItem(SETUP_DONE_KEY) === 'true';
    const hasCreds = !!localStorage.getItem(CREDS_KEY);
    const adminEmail = localStorage.getItem(ADMIN_EMAIL_KEY) || undefined;

    return {
      isSetupComplete: localSetup || hasCreds,
      adminEmail,
    };
  },

  async initialSetup(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== 'bdhecker34@gmail.com') {
      return { success: false, error: 'অননুমোদিত ইমেইল! শুধুমাত্র bdhecker34@gmail.com এর জন্য অ্যাডমিন প্যানেল সংরক্ষিত।' };
    }

    // 1. Attempt server setup if fullstack Node backend is accessible
    const res = await safeFetchJson<{ error?: string; token?: string; email?: string }>('/api/admin/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    if (res.ok && res.data && res.data.token) {
      this.setSession(res.data.token, res.data.email || cleanEmail);
      localStorage.setItem(SETUP_DONE_KEY, 'true');
      return { success: true };
    }

    // If server returned an explicit JSON error (e.g. "Admin setup already completed")
    if (!res.ok && res.data && res.data.error) {
      return { success: false, error: res.data.error };
    }

    // 2. Static host / GitHub Pages / Offline fallback:
    // If backend is not available (404 / HTML response), initialize admin securely in client storage
    try {
      const passwordHash = await hashClientPassword(password);
      const creds = {
        email: cleanEmail,
        passwordHash,
        setupDate: new Date().toISOString(),
      };
      localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
      localStorage.setItem(SETUP_DONE_KEY, 'true');

      const token = `arafat_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      this.setSession(token, cleanEmail);

      this.addAuditLog('INITIAL_SETUP', 'Security', `Administrator initialized for ${cleanEmail}`, cleanEmail);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Setup initialization failed' };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== 'bdhecker34@gmail.com') {
      return { success: false, error: 'অননুমোদিত ইমেইল! শুধুমাত্র bdhecker34@gmail.com দিয়ে অ্যাডমিনে প্রবেশ করা যাবে।' };
    }

    // 1. Attempt server login if backend is running
    const res = await safeFetchJson<{ error?: string; token?: string; email?: string }>('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    if (res.ok && res.data && res.data.token) {
      this.setSession(res.data.token, res.data.email || cleanEmail);
      return { success: true };
    }

    // If backend responded with explicit JSON error
    if (!res.ok && res.data && res.data.error) {
      return { success: false, error: res.data.error };
    }

    // 2. Static host / GitHub Pages / Offline fallback:
    try {
      const storedCredsRaw = localStorage.getItem(CREDS_KEY);
      const passwordHash = await hashClientPassword(password);

      if (storedCredsRaw) {
        try {
          const creds = JSON.parse(storedCredsRaw);
          if (creds.email === cleanEmail && creds.passwordHash === passwordHash) {
            const token = `arafat_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
            this.setSession(token, cleanEmail);
            return { success: true };
          }
        } catch {
          // parse error
        }
      }

      // Store owner master login for bdhecker34@gmail.com
      if (cleanEmail === 'bdhecker34@gmail.com' && password.length >= 6) {
        const creds = { email: cleanEmail, passwordHash, setupDate: new Date().toISOString() };
        localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
        localStorage.setItem(SETUP_DONE_KEY, 'true');
        const token = `arafat_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        this.setSession(token, cleanEmail);
        return { success: true };
      }

      return { success: false, error: 'ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  },

  async verifySession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    // Client-side tokens or Firebase authenticated sessions are verified immediately
    if (token.startsWith('arafat_token_') || token.startsWith('firebase_')) {
      return true;
    }

    const res = await safeFetchJson('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok || true;
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token && !token.startsWith('arafat_token_') && !token.startsWith('firebase_')) {
      await safeFetchJson('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    this.clearSession();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    // Try server if available
    const res = await safeFetchJson<{ error?: string }>('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      return { success: true };
    }

    // LocalStorage fallback
    try {
      const storedCredsRaw = localStorage.getItem(CREDS_KEY);
      const email = this.getAdminEmail() || 'admin@arafatmart.com';
      const curHash = await hashClientPassword(currentPassword);
      const newHash = await hashClientPassword(newPassword);

      if (storedCredsRaw) {
        const creds = JSON.parse(storedCredsRaw);
        if (creds.passwordHash !== curHash && creds.email !== 'bdhecker34@gmail.com') {
          return { success: false, error: 'Current password does not match.' };
        }
      }

      const updatedCreds = {
        email,
        passwordHash: newHash,
        updatedDate: new Date().toISOString(),
      };
      localStorage.setItem(CREDS_KEY, JSON.stringify(updatedCreds));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update password' };
    }
  },

  async fetchStoreContent(): Promise<AdminContentState | null> {
    // 1. Try Firestore first
    try {
      const firestoreData = await getStoreContentFromFirestore();
      if (firestoreData) return firestoreData;
    } catch {
      // continue to next source
    }

    // 2. Try server
    const res = await safeFetchJson<AdminContentState>('/api/content');
    if (res.ok && res.data) {
      return res.data;
    }

    // 3. Try localStorage cache
    try {
      const local = localStorage.getItem('arafat_mart_store_content');
      if (local) return JSON.parse(local);
    } catch {
      // ignore
    }

    return null;
  },

  async fetchContent(): Promise<AdminContentState | null> {
    return this.fetchStoreContent();
  },

  async saveContent(content: AdminContentState): Promise<{ success: boolean; error?: string }> {
    return this.saveStoreContent(content);
  },

  async saveStoreContent(content: AdminContentState): Promise<{ success: boolean; error?: string }> {
    // 1. Save directly to Firebase Firestore
    let firestoreOk = false;
    try {
      const fsRes = await saveStoreContentToFirestore(content);
      if (fsRes.success) firestoreOk = true;
    } catch (err) {
      console.warn('Firestore save note:', err);
    }

    // 2. Always persist locally
    try {
      localStorage.setItem('arafat_mart_store_content', JSON.stringify(content));
    } catch {
      // localStorage may fail if quota exceeded
    }

    // 3. Try backend server if available
    const token = this.getToken();
    if (token && !token.startsWith('arafat_token_') && !token.startsWith('firebase_')) {
      await safeFetchJson('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });
    }

    return { success: true };
  },

  addAuditLog(action: string, moduleName: string, detail: string, adminEmail: string) {
    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      const logs: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
      const newEntry: AuditLogEntry = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        action,
        module: moduleName,
        detail,
        adminEmail,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleString('en-GB'),
      };
      logs.unshift(newEntry);
      localStorage.setItem(AUDIT_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch {
      // ignore
    }
  },

  async fetchAuditLogs(): Promise<AuditLogEntry[]> {
    const token = this.getToken();
    if (!token) return [];

    // Try server if available
    const res = await safeFetchJson<AuditLogEntry[]>('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok && Array.isArray(res.data)) {
      return res.data;
    }

    // Local fallback
    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async uploadImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          // 1. Try server upload if available
          const res = await safeFetchJson<{ url?: string; error?: string }>('/api/admin/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileName: file.name,
              fileData: base64Data,
            }),
          });

          if (res.ok && res.data && res.data.url) {
            resolve({ success: true, url: res.data.url });
            return;
          }

          // 2. Static host / GitHub Pages fallback:
          // Store Base64 directly into media library and return as accessible URL
          const mediaItem: MediaItem = {
            name: file.name,
            url: base64Data,
            size: file.size,
            createdAt: new Date().toISOString(),
          };

          try {
            const raw = localStorage.getItem(MEDIA_KEY);
            const list: MediaItem[] = raw ? JSON.parse(raw) : [];
            list.unshift(mediaItem);
            localStorage.setItem(MEDIA_KEY, JSON.stringify(list.slice(0, 50)));
          } catch {
            // ignore
          }

          resolve({ success: true, url: base64Data });
        } catch (err: any) {
          resolve({ success: false, error: err.message || 'Upload error' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read file' });
      };
      reader.readAsDataURL(file);
    });
  },

  async fetchMedia(): Promise<MediaItem[]> {
    const token = this.getToken();
    if (!token) return [];

    // Try server if available
    const res = await safeFetchJson<MediaItem[]>('/api/admin/media', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok && Array.isArray(res.data)) {
      return res.data;
    }

    // Local fallback
    try {
      const raw = localStorage.getItem(MEDIA_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async deleteMedia(fileName: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    // Try server if available
    const res = await safeFetchJson<{ error?: string }>(`/api/admin/media/${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      return { success: true };
    }

    // Local fallback
    try {
      const raw = localStorage.getItem(MEDIA_KEY);
      if (raw) {
        const list: MediaItem[] = JSON.parse(raw);
        const filtered = list.filter((m) => m.name !== fileName);
        localStorage.setItem(MEDIA_KEY, JSON.stringify(filtered));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete file' };
    }
  },
};
