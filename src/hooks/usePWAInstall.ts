/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY_INSTALLED = 'easymart_pwa_installed';
const STORAGE_KEY_DISMISSED_UNTIL = 'easymart_pwa_dismissed_until';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const storedInstalled = localStorage.getItem(STORAGE_KEY_INSTALLED) === 'true';
    return isStandalone || storedInstalled;
  });

  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isPromptReady, setIsPromptReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone display mode
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
        try {
          localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
        } catch {}
      }
    };

    checkStandalone();

    // Platform detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // BeforeInstallPrompt event handler (Chromium/Android Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsPromptReady(true);
    };

    // AppInstalled event handler
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsPromptReady(false);
      try {
        localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      } catch {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Check if the auto-popup is allowed to show based on smart logic
   */
  const canShowAutoPopup = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    if (isInstalled) return false;

    try {
      const dismissedUntil = localStorage.getItem(STORAGE_KEY_DISMISSED_UNTIL);
      if (dismissedUntil) {
        const time = parseInt(dismissedUntil, 10);
        if (!isNaN(time) && Date.now() < time) {
          return false;
        }
      }
    } catch {}

    return true;
  }, [isInstalled]);

  /**
   * Dismiss the popup and snooze it for specified hours (default 24h)
   */
  const dismissPopup = useCallback((hours = 24) => {
    try {
      const expireTime = Date.now() + hours * 3600 * 1000;
      localStorage.setItem(STORAGE_KEY_DISMISSED_UNTIL, expireTime.toString());
    } catch {}
  }, []);

  /**
   * Trigger native install prompt or guide
   */
  const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'guide_ios' | 'guide_android' | 'guide_desktop'> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          try {
            localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
          } catch {}
          setDeferredPrompt(null);
          setIsPromptReady(false);
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }

    if (isIOS) return 'guide_ios';
    if (isAndroid) return 'guide_android';
    return 'guide_desktop';
  }, [deferredPrompt, isIOS, isAndroid]);

  return {
    isInstalled,
    isPromptReady,
    isIOS,
    isAndroid,
    hasDeferredPrompt: !!deferredPrompt,
    canShowAutoPopup,
    dismissPopup,
    triggerInstall,
  };
}
