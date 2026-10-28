import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, RefreshCw, Sparkles, LayoutGrid, Banknote } from 'lucide-react';
import { ProductCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  onShopClick: () => void;
  onTrackOrderClick: () => void;
  onSelectCategory?: (category: ProductCategory) => void;
  slides?: SlideItem[];
}

export interface SlideItem {
  id: number | string;
  kicker: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  primaryCta: string;
  category: ProductCategory;
}

const HERO_SLIDES: SlideItem[] = [
  {
    id: 1,
    kicker: 'FRESH STOCK',
    title: 'New arrivals just landed.',
    subtitle: 'Fresh colourways, updated gadgets and kitchen upgrades straight from the warehouse — ready to ship today.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOTFqvDSt4SaLNzqgla7zRZlv_eGu9W2KKxKA8uVyC6UQiSmnYFNr-LbrkV7JTq_3sQhQfny_NQA7JrQ1JsHaXqx1vtDoUmyuAgEf-lVWKZZWmi-lz2ZGSWdVbDu3RKkhKEA6uLERV-lerQiOPfRRTOanoIHSBjjdJdu_mgzbNDS5WiRpNj233phIxwKrw8CNY_Gf2u-sOPjYoSX_qK_yJFGQdhn5qZqSjYkgXwt8',
    tag: 'Ready to ship today',
    primaryCta: 'Shop new in',
    category: 'all',
  },
  {
    id: 2,
    kicker: 'HANDLOOM & EVERYDAY',
    title: 'Heritage Kurtis & Embroidered Panjabis.',
    subtitle: 'Crafted from 100% pre-shrunk cotton for comfort and breathability in any season across Bangladesh.',
    image: '/src/assets/images/hero_fashion_panjabi_kurti_banner_1792406340885.jpg',
    tag: 'Premium Stitching & Finish',
    primaryCta: 'Shop Fashion',
    category: 'fashion',
  },
  {
    id: 3,
    kicker: 'FAST CHARGING & AUDIO',
    title: 'Power Banks & Crystal-Clear ANC Earbuds.',
    subtitle: 'High-speed digital display charging stations and noise-isolating audio, verified for reliability.',
    image: '/src/assets/images/hero_tech_gadgets_banner_1792406342275.jpg',
    tag: '1-Year Warranty Checked',
    primaryCta: 'Shop Gadgets',
    category: 'gadgets',
  },
  {
    id: 4,
    kicker: 'NON-STICK & DINING',
    title: 'German Granite Cookware & Sets.',
    subtitle: '5-layer heavy non-stick cookware and thermal vacuum flasks engineered for daily home cooking.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyg47fYNc_P3KRSjqhu4uBL5dMhCPvYpUU77I3RTXDW83eDxelB-P4I6zbdaJHVdO8JjF9Bw-wg8T8c9puemFYW61rYm0p3xeJyPhSZoT9SFWd1UmztqQDVj4y39d5h6McrdSSYKtdRuQnR_Hml24XLYi9znELgT9XED-U8kvx22nJHgRqm9s0o_4FnmebszzoBJmHkqJsnyM1mxnMZx5rqP3YtbDEJpWV9BNDdDE',
    tag: '100% PFOA Free',
    primaryCta: 'Shop Cookware',
    category: 'home-kitchen',
  },
];

export const Hero: React.FC<HeroProps> = ({
  onShopClick,
  onTrackOrderClick,
  onSelectCategory,
  slides,
}) => {
  const effectiveSlides = (slides && slides.length > 0) ? slides : HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = effectiveSlides.length;

  const paginate = (newDirection: number) => {
    setCurrentSlide((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = totalSlides - 1;
      if (nextIndex >= totalSlides) nextIndex = 0;
      return nextIndex;
    });
  };

  const jumpToSlide = (targetIndex: number) => {
    setCurrentSlide(targetIndex);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentSlide, isPaused, totalSlides]);

  const activeSlide = effectiveSlides[currentSlide] || effectiveSlides[0];

  const handleSlideAction = (category: ProductCategory) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    onShopClick();
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-6"
        data-purpose="hero-carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative rounded-3xl overflow-hidden min-h-[460px] md:min-h-[500px] flex items-center bg-stone-900 text-white shadow-xl">
          {/* Hero Background Image with Ken Burns Zoom & AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.image}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 0.68, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                alt={activeSlide.title}
                src={activeSlide.image}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/70 to-transparent pointer-events-none" />

          {/* Hero Content Overlay with Smooth Staggered Reveal */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative z-10 max-w-2xl px-6 sm:px-12 md:px-14 py-12"
            >
              {/* Fresh Stock Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-stone-800/80 backdrop-blur-md border border-stone-600/60 px-3.5 py-1.5 rounded-full text-xs font-medium text-orange-300 mb-6 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>{activeSlide.kicker || 'FRESH STOCK'}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white mb-4"
              >
                {activeSlide.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-sm sm:text-base text-stone-300 font-normal leading-relaxed mb-8 max-w-xl"
              >
                {activeSlide.subtitle}
              </motion.p>

              {/* Call to Actions with Tap Feedback */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSlideAction(activeSlide.category)}
                  className="inline-flex items-center gap-2 bg-[#f36805] hover:bg-[#db5c00] text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-orange-600/30 transition-colors cursor-pointer btn-press"
                >
                  <span>{activeSlide.primaryCta || 'Shop new in'}</span>
                  <ArrowRight className="w-4 h-4 text-xs" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    const el = document.getElementById('departments-section') || document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 bg-stone-800/70 hover:bg-stone-800 text-white font-medium text-sm px-5 py-3.5 rounded-xl border border-stone-600/50 backdrop-blur-sm transition-colors cursor-pointer btn-press"
                >
                  <LayoutGrid className="w-4 h-4 text-stone-400" />
                  <span>View collections</span>
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Navigation Controls */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(-1)}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-colors z-20 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(1)}
            aria-label="Next slide"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-colors z-20 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          {/* Carousel Pagination & Indicator with Smooth Active Width */}
          <div className="absolute bottom-6 left-6 sm:left-14 right-6 sm:right-14 flex items-center justify-between text-xs text-stone-400 z-20">
            <div className="flex items-center gap-2">
              {effectiveSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => jumpToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide ? 'w-7 bg-[#f36805] shadow-sm' : 'w-2.5 bg-stone-500/70 hover:bg-stone-400'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-stone-300 font-semibold tracking-wider">
              0{currentSlide + 1} / 0{totalSlides}
            </span>
          </div>
        </div>
      </section>

      {/* Value Propositions / Trust Badges with Staggered Scroll Reveal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4" data-purpose="trust-badges">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-amber-50/40 border border-orange-100/70">
          {[
            {
              icon: <Truck className="w-5 h-5 text-[#f36805]" />,
              title: 'Fast nationwide delivery',
              desc: 'Inside Dhaka in 24 hours, 2-4 days elsewhere.',
            },
            {
              icon: <ShieldCheck className="w-5 h-5 text-[#f36805]" />,
              title: 'Quality checked',
              desc: 'Every listing is inspected before it ships.',
            },
            {
              icon: <RefreshCw className="w-5 h-5 text-[#f36805]" />,
              title: '7-day easy returns',
              desc: 'Changed your mind? Send it back, no drama.',
            },
            {
              icon: <Banknote className="w-5 h-5 text-[#f36805]" />,
              title: 'Cash on delivery',
              desc: 'Pay when the parcel reaches your door.',
            },
          ].map((feature, fIdx) => (
            <motion.div
              key={fIdx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.35, delay: fIdx * 0.08 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="flex items-start gap-3.5 p-2 rounded-xl transition-colors hover:bg-white/60"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100/80 text-[#f36805] flex items-center justify-center shrink-0 shadow-2xs">
                {feature.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">{feature.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
