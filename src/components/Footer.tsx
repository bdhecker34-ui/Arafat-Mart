import React from 'react';
import { Truck, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { ProductCategory } from '../types';

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
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenTrackOrder,
  onOpenAdmin,
  contactInfo,
  aboutText,
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

  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-stone-800">
          
          {/* Column 1: Brand Wordmark & Story (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="https://storage.helloreaddy.io/project_files/bac25af4-e5d9-4960-9929-b3c63df9616f/e5c539c0-4b1e-4ba7-a9a2-900df953d086_compressed_file_000000008294821182132f227ab6dbdb.webp"
                alt="Arafat Mart Logo"
                className="w-8 h-8 object-contain rounded-md bg-white p-0.5"
              />
              <span className="text-xl font-bold tracking-tight text-white">
                Arafat Mart
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              {bio}
            </p>

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

        {/* Bottom Bar: Copyright, Terms & Admin Console */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © 2026 Arafat Mart. All rights reserved across Bangladesh.
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
