import { Product, ProductCategory } from '../types';

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

export interface AdminContentState {
  banners: BannerItem[];
  products: Product[];
  categories: CategoryItem[];
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

export const adminApi = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setSession(token: string, email: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_EMAIL_KEY, email);
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
  },

  getAdminEmail(): string | null {
    return localStorage.getItem(ADMIN_EMAIL_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async checkSetupStatus(): Promise<{ isSetupCompleted: boolean; adminEmail?: string }> {
    const status = await this.getStatus();
    return {
      isSetupCompleted: status.isSetupComplete,
      adminEmail: status.adminEmail,
    };
  },

  async getStatus(): Promise<AdminStatus> {
    try {
      const res = await fetch('/api/admin/status');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API getStatus fallback:', e);
    }
    // Fallback if server is not reachable
    const localSetup = localStorage.getItem('arafat_mart_setup_done') === 'true';
    return { isSetupComplete: localSetup, adminEmail: localStorage.getItem(ADMIN_EMAIL_KEY) || undefined };
  },

  async initialSetup(email: string, password: string):Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Setup failed' };
      }
      this.setSession(data.token, data.email);
      localStorage.setItem('arafat_mart_setup_done', 'true');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during setup' };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      this.setSession(data.token, data.email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  },

  async verifySession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return true; // allow optimistic access
    }
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    this.clearSession();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password update failed' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async fetchStoreContent(): Promise<any> {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        return await res.json();
      }
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

  async saveStoreContent(content: any): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        return { success: true };
      }
      const data = await res.json();
      return { success: false, error: data.error || 'Failed saving content' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed saving content' };
    }
  },

  async fetchAuditLogs(): Promise<AuditLogEntry[]> {
    const token = this.getToken();
    if (!token) return [];
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return [];
  },

  async uploadImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await fetch('/api/admin/upload', {
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
          const data = await res.json();
          if (res.ok && data.url) {
            resolve({ success: true, url: data.url });
          } else {
            resolve({ success: false, error: data.error || 'Failed to upload image' });
          }
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
    try {
      const res = await fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return [];
  },

  async deleteMedia(fileName: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`/api/admin/media/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return { success: true };
      const data = await res.json();
      return { success: false, error: data.error || 'Failed to delete file' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },
};
