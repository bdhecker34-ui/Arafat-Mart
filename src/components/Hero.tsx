import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';
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
    kicker: 'Curated for Modern Living in Bangladesh',
    title: 'Everyday essentials, picked with genuine care.',
    subtitle: 'Authentic handloom fashion, precision gadgets, and non-toxic cookware. Strict quality checks, honest pricing in ৳ BDT, and cash on delivery across all 64 districts.',
    image: '/src/assets/images/hero_arafat_mart_lifestyle_1792405781284.jpg',
    tag: 'Dhaka 24-48h · Nationwide 2-3 Days',
    primaryCta: 'Explore Full Catalog',
    category: 'all',
  },
  {
    id: 2,
    kicker: 'Exclusive Heritage & Everyday Fashion',
    title: 'Handloom Kurtis & Silk Embroidered Panjabis.',
    subtitle: 'Pure combed breathable fabrics crafted for Bangladesh’s humid tropical climate. Hand-finished collar embroidery, wooden loop buttons, and contemporary tailored drape.',
    image: '/src/assets/images/hero_fashion_panjabi_kurti_banner_1792406340885.jpg',
    tag: '100% Pre-Shrunk Pure Cotton',
    primaryCta: 'Shop Fashion Collection',
    category: 'fashion',
  },
  {
    id: 3,
    kicker: 'Next-Generation Smart Living',
    title: 'Magnetic Power Banks & Crystal-Clear ANC Audio.',
    subtitle: 'Compact 22.5W Power Delivery wireless chargers with digital LED percentage screens, alongside quad-ENC noise cancelling earbuds engineered for busy city streets.',
    image: '/src/assets/images/hero_tech_gadgets_banner_1792406342275.jpg',
    tag: '1-Year Official Replacement Guarantee',
    primaryCta: 'Explore Smart Gadgets',
    category: 'gadgets',
  },
  {
    id: 4,
    kicker: 'Non-Toxic Culinary Living',
    title: 'German Granite Cookware & Thermal Flasks.',
    subtitle: 'Heavy-gauge 5-layer non-stick casserole pots with stay-cool beechwood handles, plus double-walled vacuum flasks retaining tea heat for 24 hours. 100% PFOA-free.',
    image: '/src/assets/images/hero_home_kitchen_banner_1792406342249.jpg',
    tag: 'Induction & Gas Stove Compatible',
    primaryCta: 'Discover Kitchen Essentials',
    category: 'home-kitchen',
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0.8,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 280, damping: 30 },
      opacity: { duration: 0.35 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0.8,
    transition: {
      x: { type: 'spring' as const, stiffness: 280, damping: 30 },
      opacity: { duration: 0.35 },
    },
  }),
};

export const Hero: React.FC<HeroProps> = ({
  onShopClick,
  onTrackOrderClick,
  onSelectCategory,
  slides,
}) => {
  const effectiveSlides = (slides && slides.length > 0) ? slides : HERO_SLIDES;
  const [[currentSlide, direction], setSlideState] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = effectiveSlides.length;

  const paginate = (newDirection: number) => {
    setSlideState(([prev]) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = totalSlides - 1;
      if (nextIndex >= totalSlides) nextIndex = 0;
      return [nextIndex, newDirection];
    });
  };

  const jumpToSlide = (targetIndex: number) => {
    const dir = targetIndex > currentSlide ? 1 : -1;
    setSlideState([targetIndex, dir]);
  };

  // Auto-play interval (5.5 seconds)
  useEffect(() => {
    if (isPaused) return;

    slideTimerRef.current = setInterval(() => {
      paginate(1);
    }, 5500);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [currentSlide, isPaused, totalSlides]);

  const activeSlide = effectiveSlides[currentSlide] || effectiveSlides[0];

  const handleSlideAction = (category: ProductCategory) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    onShopClick();
  };

  return (
    <section
      className="relative overflow-hidden pt-4 pb-12 sm:pt-6 sm:pb-14 border-b border-stone-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Slide Stage Container */}
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 shadow-md">
          
          {/* Slide Visual Background Layer with Animated Sliding Motion */}
          <div className="relative aspect-[16/10] sm:aspect-[16/8] lg:aspect-[21/9] min-h-[440px] sm:min-h-[480px] w-full overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  className="w-full h-full object-cover object-center filter brightness-[0.85]"
                  loading={currentSlide === 0 ? 'eager' : 'lazy'}
                />
                
                {/* Measured Scrim Gradient for WCAG AA High-Contrast Legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/92 via-stone-950/70 to-black/35" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/20" />
              </motion.div>
            </AnimatePresence>

            {/* Slide Foreground Content Overlay with Spring Reveal */}
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-3xl pointer-events-none">
              
              {/* Slide Meta Kicker & Tag */}
              <motion.div
                key={`meta-${currentSlide}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-1 pointer-events-auto"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>{activeSlide.kicker}</span>
                </div>
                <div className="text-[11px] text-stone-300 font-medium">
                  {activeSlide.tag}
                </div>
              </motion.div>

              {/* Headline & Subtitle */}
              <motion.div
                key={`text-${currentSlide}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="my-auto py-4 pointer-events-auto"
              >
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.18] text-balance drop-shadow-xs">
                  {activeSlide.title}
                </h1>
                <p className="mt-3 text-xs sm:text-base text-stone-300 leading-relaxed max-w-xl line-clamp-3 sm:line-clamp-none">
                  {activeSlide.subtitle}
                </p>
              </motion.div>

              {/* CTAs Stacked Vertically on Left with Tap Animation */}
              <motion.div
                key={`ctas-${currentSlide}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-col items-start gap-2.5 sm:gap-3 pt-2 pointer-events-auto"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleSlideAction(activeSlide.category)}
                  className="px-5 sm:px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm group min-w-[200px]"
                >
                  <span>{activeSlide.primaryCta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={onTrackOrderClick}
                  className="px-5 sm:px-6 py-2.5 bg-stone-900/80 hover:bg-stone-800 text-stone-200 font-semibold text-xs sm:text-sm rounded-xl border border-stone-700 backdrop-blur-xs transition-colors flex items-center justify-center gap-2 min-w-[200px]"
                >
                  <span>Track Existing Order</span>
                </motion.button>
              </motion.div>

            </div>

            {/* Slider Arrow Controls with Tap Animation */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(-1)}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white border border-stone-700/80 backdrop-blur-xs transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(1)}
              aria-label="Next slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white border border-stone-700/80 backdrop-blur-xs transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            {/* 4 Interactive Slide Indicator Dots (No numbers or lists) */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-30 flex items-center gap-2.5 bg-stone-950/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-stone-700/60">
              {effectiveSlides.map((slide, idx) => (
                <motion.button
                  key={slide.id || idx}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => jumpToSlide(idx)}
                  aria-label={`Jump to slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-7 bg-amber-400'
                      : 'w-2.5 bg-stone-500 hover:bg-stone-300'
                  }`}
                />
              ))}
            </div>

          </div>

        </div>

        {/* 4-Column Trust Marker Strip with Subtle Scroll Entrance */}
        <div className="mt-8 pt-6 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-amber-100/70 text-amber-900 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">All 64 Districts</h3>
              <p className="text-xs text-stone-500 mt-0.5 leading-snug">Doorstep delivery to all 495+ upazilas</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-emerald-100/70 text-emerald-900 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Quality Checked</h3>
              <p className="text-xs text-stone-500 mt-0.5 leading-snug">Every product inspected prior to sealing</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-stone-200/80 text-stone-800 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">7-Day Replacement</h3>
              <p className="text-xs text-stone-500 mt-0.5 leading-snug">Hassle-free exchange policy</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-sky-100/70 text-sky-900 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Dedicated Helpline</h3>
              <p className="text-xs text-stone-500 mt-0.5 leading-snug">WhatsApp & Call: 01410556747</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
