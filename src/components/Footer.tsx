import React from 'react';
import { Truck, ShieldCheck, Phone, Mail, MapPin, Clock, Lock, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCategory } from '../types';
import { SocialLinks } from '../services/adminApi';
import { BrandLogo } from './BrandLogo';

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
    address: 'Mohanpur, Manirampur, Jashore, Bangladesh',
  };

  const bio = aboutText || 'Everyday essentials, picked with care. Quality checked products, honest prices, cash on delivery and fast shipping to all 64 districts in Bangladesh.';

  const facebookUrl = sanitizeUrl(socialLinks?.facebook, 'https://facebook.com');
  const instagramUrl = sanitizeUrl(socialLinks?.instagram, 'https://instagram.com');
  const whatsappUrl = `https://wa.me/88${contact.whatsapp.replace(/\D/g, '') || '01410556747'}`;

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-amber-50/30 border-t border-orange-100 pt-12 pb-8 text-slate-600 text-xs"
      data-purpose="site-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
          
          {/* Brand Logo & Socials */}
          <div className="lg:col-span-2">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block mb-3.5 group"
            >
              <BrandLogo size="md" variant="footer" badgeText="ORIGINAL" />
            </a>
            <p className="text-slate-500 text-xs mb-4 max-w-sm leading-relaxed">
              {bio}
            </p>

            <div className="flex items-center gap-2.5 text-slate-500">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:text-[#f36805] hover:border-[#f36805] transition-colors bg-white shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:text-[#f36805] hover:border-[#f36805] transition-colors bg-white shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:text-[#f36805] hover:border-[#f36805] transition-colors bg-white shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>

              <a
                href={`mailto:${contact.email}`}
                aria-label="Email"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:text-[#f36805] hover:border-[#f36805] transition-colors bg-white shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Shop Departments */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-3">
              SHOP DEPARTMENTS
            </h4>
            <ul className="space-y-2 text-slate-500">
              {[
                { id: 'fashion' as ProductCategory, label: "Women's Fashion" },
                { id: 'fashion' as ProductCategory, label: "Men's Fashion" },
                { id: 'gadgets' as ProductCategory, label: 'Electronics & Gadgets' },
                { id: 'home-kitchen' as ProductCategory, label: 'Home & Kitchen' },
                { id: 'beauty-care' as ProductCategory, label: 'Beauty & Personal Care' },
                { id: 'fashion' as ProductCategory, label: 'Bags & Accessories' },
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      onSelectCategory(item.id);
                      const el = document.getElementById('catalog-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-[#f36805] transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-3">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li>
                <button
                  onClick={onOpenTrackOrder}
                  className="hover:text-[#f36805] transition-colors cursor-pointer text-left"
                >
                  Track your consignment
                </button>
              </li>
              <li>
                <a
                  href="#contact-section"
                  className="hover:text-[#f36805] transition-colors"
                >
                  Delivery information
                </a>
              </li>
              <li>
                <a
                  href="#contact-section"
                  className="hover:text-[#f36805] transition-colors"
                >
                  7-Day Returns & refunds
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f36805] transition-colors"
                >
                  Contact WhatsApp support
                </a>
              </li>
              <li>
                <span className="text-slate-400">Cash on delivery available</span>
              </li>
            </ul>
          </div>

          {/* Reach Us */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-3">
              REACH US
            </h4>
            <ul className="space-y-2.5 text-slate-500 text-[11px]">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#f36805] mt-0.5 shrink-0" />
                <span>{contact.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#f36805] shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:underline truncate">
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#f36805] shrink-0" />
                <span>WhatsApp: {contact.whatsapp}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#f36805] shrink-0" />
                <span>Saturday - Thursday, 9am to 9pm</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Badges */}
        <div className="pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 Easy Mart. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[10px]" />
              Secure checkout
            </span>
            <span>•</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-[10px]" />
                Admin Console
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
