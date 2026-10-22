import React from 'react';
import { Truck, ShieldCheck, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { ProductCategory } from '../types';
import { SocialLinks } from '../services/adminApi';

interface FooterProps {
  onSelectCategory: (category: ProductCategory) => void;
  onOpenTrackOrder: () => void;
  onOpenAdmin?: () => void;
  contactInfo?: {
    whatsapp: string;
    bkash: string;
    nagad: string;
    rocket: string;
    email: string;
    address: string;
  };
  aboutText?: string;
  socialLinks?: SocialLinks;
}

// Helpers to format URL safely
const sanitizeUrl = (url?: string, fallback = '#') => {
  if (!url || !url.trim()) return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenTrackOrder,
  onOpenAdmin,
  contactInfo,
  aboutText,
  socialLinks,
}) => {
  const contact = contactInfo || {
    whatsapp: '01410556747',
    bkash: '01350292697',
    nagad: '01350292697',
    rocket: '01410556740',
    email: 'arafathossain.main@gmail.com',
    address: 'Central Hub: Tejgaon I/A, Dhaka-1208, Bangladesh',
  };

  const bio = aboutText || 'Everyday fashion, gadgets, and home essentials curated specifically for Bangladeshi homes. Handloom craftsmanship, reliable electronics, genuine prices in ৳ BDT, and hassle-free Cash on Delivery across all 64 districts.';

  // Social Links with defaults
  const facebookUrl = sanitizeUrl(socialLinks?.facebook, 'https://facebook.com');
  const youtubeUrl = sanitizeUrl(socialLinks?.youtube, 'https://youtube.com');
  const instagramUrl = sanitizeUrl(socialLinks?.instagram, 'https://instagram.com');
  const tiktokUrl = sanitizeUrl(socialLinks?.tiktok, 'https://tiktok.com');

  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      nameBn: 'ফেসবুক',
      tagline: 'অফিসিয়াল পেজ ও অফার',
      url: facebookUrl,
      bgHover: 'hover:bg-[#1877F2] hover:border-[#1877F2]',
      color: '#1877F2',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      id: 'youtube',
      name: 'YouTube',
      nameBn: 'ইউটিউব',
      tagline: 'প্রোডাক্ট রিভিউ ও ভিডিও',
      url: youtubeUrl,
      bgHover: 'hover:bg-[#FF0000] hover:border-[#FF0000]',
      color: '#FF0000',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      nameBn: 'ইনস্টাগ্রাম',
      tagline: 'লাইফস্টাইল ও ট্রেন্ডস',
      url: instagramUrl,
      bgHover: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-pink-500',
      color: '#E4405F',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      nameBn: 'টিকটক',
      tagline: 'ভাইরাল ভিডিও ও আনবক্সিং',
      url: tiktokUrl,
      bgHover: 'hover:bg-black hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.4)]',
      color: '#00F2FE',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.77 1.52V6.82a4.85 4.85 0 0 1-1-.13z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-stone-800">
          
          {/* Column 1: Brand Wordmark & Story & Social Media */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="./assets/images/easy_mart_logo.png"
                alt="Easy Mart Logo"
                className="w-10 h-10 object-contain rounded-xl bg-black p-1 border border-stone-700 shadow-md"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white">
                  Easy Mart
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  সবকিছু, এক ঠিকানায়।
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              {bio}
            </p>

            {/* Direct Contact Info */}
            <div className="pt-2 text-xs text-stone-400 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{contact.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  WhatsApp & Call:{' '}
                  <a
                    href={`https://wa.me/88${contact.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-mono font-bold"
                  >
                    {contact.whatsapp}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Email:{' '}
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-stone-300 hover:text-white underline font-mono"
                  >
                    {contact.email}
                  </a>
                </span>
              </div>
            </div>

            {/* Social Media Quick Connect Bar */}
            <div className="pt-3 border-t border-stone-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-2.5">
                সোশ্যাল মিডিয়ায় যুক্ত থাকুন:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {socialPlatforms.map((platform) => (
                  <a
                    key={platform.id}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${platform.name} — ${platform.tagline}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 ${platform.bgHover} hover:text-white transition-all text-xs font-semibold group shadow-sm`}
                  >
                    <span className="transition-transform group-hover:scale-110">
                      {platform.icon}
                    </span>
                    <span>{platform.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onSelectCategory('fashion')}
                  className="hover:text-white transition-colors"
                >
                  Men & Women Fashion
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('gadgets')}
                  className="hover:text-white transition-colors"
                >
                  Tech & Gadgets
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('home-kitchen')}
                  className="hover:text-white transition-colors"
                >
                  Home & Cookware
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('beauty-care')}
                  className="hover:text-white transition-colors"
                >
                  Beauty & Organics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('all')}
                  className="hover:text-white transition-colors"
                >
                  Full Store Catalog
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={onOpenTrackOrder}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Track Courier Shipment</span>
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Cash on Delivery Verification
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  7-Day Replacement Guarantee
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  All 64 Districts Delivery Schedule
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Wholesale & Bulk Inquiries
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Payment Partners & Guarantee (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">
              Secure Payment Methods
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              We accept Cash on Delivery with parcel inspection, plus instant mobile financial services:
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between p-2 bg-stone-800/80 rounded-lg border border-stone-700 text-xs">
                <span className="text-pink-400 font-bold">bKash</span>
                <span className="font-mono text-stone-200">{contact.bkash}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-stone-800/80 rounded-lg border border-stone-700 text-xs">
                <span className="text-orange-400 font-bold">Nagad</span>
                <span className="font-mono text-stone-200">{contact.nagad}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-stone-800/80 rounded-lg border border-stone-700 text-xs">
                <span className="text-purple-400 font-bold">Rocket</span>
                <span className="font-mono text-stone-200">{contact.rocket}</span>
              </div>
              <div className="p-2 bg-amber-950/40 rounded-lg border border-amber-800/50 text-xs text-amber-200 text-center font-medium">
                Cash on Delivery (Available in 64 Districts)
              </div>
            </div>

            <div className="pt-2 text-[11px] text-stone-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>BSTI & 100% Quality Assurance Tested</span>
            </div>
          </div>

        </div>

        {/* Dedicated Social Media Interactive Community Hub */}
        <div className="py-8 border-b border-stone-800">
          <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-1">
                <span>Easy Mart সোশ্যাল মিডিয়া কমিউনিটি</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                নতুন অফার, ডিসকাউন্ট ও রিয়েল আনবক্সিং ভিডিও দেখতে ফলো করুন
              </h3>
              <p className="text-xs sm:text-sm text-stone-400">
                ফেসবুক, ইউটিউব, ইনস্টাগ্রাম ও টিকটকে আমাদের সাথে যুক্ত থাকুন এবং বিশেষ ভাউচার কোড পান!
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto shrink-0">
              {socialPlatforms.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-3 sm:px-4 sm:py-3.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 ${p.bgHover} hover:text-white transition-all group shadow-md text-center min-w-[110px]`}
                >
                  <div className="mb-2 p-2 rounded-full bg-stone-800 group-hover:bg-white/10 transition-colors">
                    {p.icon}
                  </div>
                  <span className="font-bold text-xs">{p.name}</span>
                  <span className="text-[10px] text-stone-400 group-hover:text-white/80 line-clamp-1 mt-0.5">
                    {p.nameBn}
                  </span>
                  <span className="text-[10px] text-emerald-400 group-hover:text-white font-semibold mt-1 flex items-center gap-1">
                    ভিজিট করুন <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Terms & Admin Console */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © 2026 Easy Mart. All rights reserved across Bangladesh.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Return Guidelines</a>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-stone-300 transition-colors text-xs cursor-pointer"
              >
                Admin
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
