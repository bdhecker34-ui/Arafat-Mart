import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'afm-panjabi-01',
    title: 'Heritage Cotton-Silk Semi-Fitted Panjabi',
    titleBn: 'হেরিটেজ কটন-সিল্ক সেমি-ফিটেড পাঞ্জাবি',
    category: 'fashion',
    price: 2450,
    originalPrice: 2950,
    rating: 4.9,
    reviewsCount: 142,
    inStock: true,
    stockCount: 18,
    image: '/src/assets/images/product_silk_embroidered_panjabi_1792405780182.jpg',
    gallery: [
      '/src/assets/images/product_silk_embroidered_panjabi_1792405780182.jpg'
    ],
    description: 'Masterfully woven cotton-silk blend with intricate geometric cord neckline embroidery. Tailored semi-fitted silhouette suited for festive gatherings, Jummah prayers, and formal evenings.',
    features: [
      'Breathable 65% Combed Cotton + 35% Silk Weave',
      'Hand-finished mandarin collar with hidden button placket',
      'Dual deep side pockets with reinforced bartack stitching',
      'Pre-shrunk fabric to prevent post-wash shrinkage',
      'Wrinkle-resistant luxury drape'
    ],
    specs: {
      'Fabric Composition': 'Cotton-Silk Blend (65/35)',
      'Weave Type': 'Textured Slub Weave',
      'Collar Style': 'Mandarin Band Collar',
      'Fit': 'Contemporary Semi-Fitted',
      'Care Instructions': 'Gentle Hand Wash or Dry Clean Recommended'
    },
    sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)', '46 (XXL)'],
    colors: ['Pearl Cream', 'Navy Indigo', 'Charcoal Slate'],
    isFeatured: true,
    badge: 'Best Seller'
  },
  {
    id: 'afm-kurti-02',
    title: 'Artisan Handloom Cotton Kurti - Sage Edition',
    titleBn: 'আর্টিসান তাঁত কটন কুর্তি - সেইজ এডিশন',
    category: 'fashion',
    price: 1850,
    originalPrice: 2200,
    rating: 4.85,
    reviewsCount: 98,
    inStock: true,
    stockCount: 12,
    image: '/src/assets/images/product_handloom_cotton_kurti_1792405781350.jpg',
    gallery: [
      '/src/assets/images/product_handloom_cotton_kurti_1792405781350.jpg'
    ],
    description: 'Pure handloom breathable cotton tailored with delicate contrast neckline needlework and button-tab sleeves. Specially curated for comfort in Bangladesh’s humid tropical climate.',
    features: [
      '100% Tangail handloom combed breathable cotton',
      'Minimalist split neckline with wooden loop buttons',
      'Three-quarter folded cuffs with anchor stitching',
      'Comfort side slits for effortless everyday mobility',
      'Eco-friendly AZO-free botanical dye'
    ],
    specs: {
      'Fabric': '100% Handloom Combed Cotton',
      'Sleeve Length': 'Three-Quarter (3/4)',
      'Pattern': 'Organic Solid with Neck Motifs',
      'Length': 'Calf Length (42 inches)',
      'Origin': 'Tangail Weaver Cooperative, Bangladesh'
    },
    sizes: ['36 (S)', '38 (M)', '40 (L)', '42 (XL)'],
    colors: ['Sage Green', 'Dusty Rose', 'Chalk Ivory'],
    isFeatured: true,
    badge: 'Staff Pick'
  },
  {
    id: 'afm-powerbank-03',
    title: 'MagCharge 10,000mAh Ultra-Slim Wireless Power Bank',
    titleBn: 'ম্যাগচার্জ ১০,০০০ mAh ওয়্যারলেস পাওয়ার ব্যাংক',
    category: 'gadgets',
    price: 2150,
    originalPrice: 2750,
    rating: 4.92,
    reviewsCount: 230,
    inStock: true,
    stockCount: 34,
    image: '/src/assets/images/product_magnetic_power_bank_1792405781634.jpg',
    gallery: [
      '/src/assets/images/product_magnetic_power_bank_1792405781634.jpg'
    ],
    description: 'Next-gen magnetic snap-on wireless power bank with 22.5W PD bi-directional fast charging and a precision LED percentage display. Ultra-compact matte unibody that slides effortlessly into your pocket.',
    features: [
      'Snap-on magnetic alignment for iPhone 12-16 & Qi-enabled Android devices',
      '22.5W Power Delivery (PD 3.0) & Quick Charge 4+ wired output',
      'High-contrast real-time digital numeric battery screen',
      'Grade-A Lithium Polymer cells with 9-layer circuit protection',
      'Includes premium 1m braided Type-C fast charging cable'
    ],
    specs: {
      'Battery Capacity': '10,000mAh / 38.5Wh',
      'Wireless Output': '15W / 10W / 7.5W / 5W',
      'USB-C Input/Output': '5V-3A, 9V-2.22A, 12V-1.67A (Max 22.5W)',
      'Weight': '182 grams',
      'Warranty': '1 Year Official Replacement Guarantee'
    },
    colors: ['Slate Titanium', 'Matte Obsidian'],
    isFeatured: true,
    badge: 'Top Tech'
  },
  {
    id: 'afm-cookware-04',
    title: 'GraniteStone Induction Casserole Pot with Wooden Grips',
    titleBn: 'গ্রানাইটস্টোন নন-স্টিক ক্যাসেরোল পট (কাঠের হাতল)',
    category: 'home-kitchen',
    price: 2650,
    originalPrice: 3300,
    rating: 4.9,
    reviewsCount: 115,
    inStock: true,
    stockCount: 9,
    image: '/src/assets/images/product_granite_cookware_set_1792405782342.jpg',
    gallery: [
      '/src/assets/images/product_granite_cookware_set_1792405782342.jpg'
    ],
    description: 'Commercial 5-layer German granite coating heavy-gauge die-cast casserole pot with natural stay-cool beechwood handles and tempered glass steam lid. Non-toxic, 100% PFOA-free cooking for rich biryanis, curries, and stews.',
    features: [
      '5-Layer German mineral non-stick coating (100% PFOA, Lead & Cadmium free)',
      'Thick induction base for rapid, even heat distribution across gas & electric stoves',
      'Ergonomic heat-insulated natural European beechwood handles',
      'Tempered glass shatter-resistant lid with stainless steel steam vent',
      'Effortless wipe-clean surface with minimal oil requirement'
    ],
    specs: {
      'Diameter': '24 cm (4.2 Liters)',
      'Body Material': 'Heavy-Gauge Die-Cast Aluminum',
      'Base Compatibility': 'Induction, Gas, Ceramic, Halogen & Hot Plate',
      'Handle Material': 'Thermal-Insulated Natural Beechwood',
      'Dishwasher Safe': 'Yes (Hand wash recommended for extended coating life)'
    },
    colors: ['Granite Charcoal'],
    isFeatured: true,
    badge: 'Kitchen Essential'
  },
  {
    id: 'afm-earbuds-05',
    title: 'SoundAura Pro Hybrid Active Noise Cancelling Earbuds',
    titleBn: 'সাউন্ডঅরা প্রো অ্যাক্টিভ নয়েজ ক্যানসেলিং ইয়ারবাডস',
    category: 'gadgets',
    price: 3200,
    originalPrice: 3950,
    rating: 4.88,
    reviewsCount: 167,
    inStock: true,
    stockCount: 22,
    image: '/src/assets/images/product_magnetic_power_bank_1792405781634.jpg',
    gallery: [
      '/src/assets/images/product_magnetic_power_bank_1792405781634.jpg'
    ],
    description: 'Up to 35dB active noise cancellation with 4-mic quad ENC for crystal clear phone calls even on busy Dhaka streets. 40ms low-latency mode and 36 hours total battery endurance.',
    features: [
      '35dB Hybrid ANC with Transparency pass-through mode',
      'Quad-microphone ENC with AI ambient wind suppression',
      '10mm composite titanium dynamic drivers for deep bass',
      'Bluetooth 5.3 with instant auto-pairing and dual device switch',
      'IPX5 water & sweat resistance for workouts and monsoon rains'
    ],
    specs: {
      'Bluetooth Version': 'v5.3 + EDR',
      'Playtime': '8 hrs single charge, 36 hrs with charging case',
      'Charging Time': '10 mins fast charge gives 2 hours playback',
      'Driver Size': '10mm Dynamic Titanium Diaphragm',
      'Waterproof Rating': 'IPX5'
    },
    colors: ['Phantom Black', 'Glacier White'],
    isFeatured: false
  },
  {
    id: 'afm-flask-06',
    title: 'Thermolux 1000ml Double-Walled Vacuum Steel Flask',
    titleBn: 'থার্মোলাক্স ১ লিটার ডাবল-ওয়ালড ভ্যাকিউম ফ্লাস্ক',
    category: 'home-kitchen',
    price: 1350,
    originalPrice: 1750,
    rating: 4.82,
    reviewsCount: 84,
    inStock: true,
    stockCount: 27,
    image: '/src/assets/images/product_granite_cookware_set_1792405782342.jpg',
    gallery: [
      '/src/assets/images/product_granite_cookware_set_1792405782342.jpg'
    ],
    description: 'Food-grade 304 stainless steel vacuum insulated water bottle. Keeps cha, coffee, or soups piping hot for 24 hours, or chilled fruit drinks ice-cold for 36 hours without outer condensation.',
    features: [
      'Double-wall copper vacuum insulation technology',
      '100% leak-proof airtight cap with integrated silicone ring',
      'Powder-coated scratch-resistant matte exterior finish',
      'BPA-free, rust-proof, zero metallic aftertaste',
      'Includes detachable tea leaf infuser basket'
    ],
    specs: {
      'Capacity': '1000 ml (1 Liter)',
      'Material': 'SUS 304 Food-Grade Stainless Steel',
      'Thermal Performance': '24 Hours Hot / 36 Hours Cold',
      'Weight': '390 grams',
      'Mouth Width': 'Wide neck for easy ice cube insertion'
    },
    colors: ['Matte Black', 'Olive Drab', 'Brushed Steel'],
    isFeatured: false
  },
  {
    id: 'afm-skincare-07',
    title: 'NourishBotanica Cold-Pressed Organic Hair & Scalp Elixir',
    titleBn: 'নারিশ বোটানিকা অর্গানিক হেয়ার অ্যান্ড স্ক্যাল্প অয়েল',
    category: 'beauty-care',
    price: 850,
    originalPrice: 1100,
    rating: 4.95,
    reviewsCount: 211,
    inStock: true,
    stockCount: 45,
    image: '/src/assets/images/product_handloom_cotton_kurti_1792405781350.jpg',
    gallery: [
      '/src/assets/images/product_handloom_cotton_kurti_1792405781350.jpg'
    ],
    description: 'Traditional wood-pressed cold extraction combining extra virgin coconut oil, black seed (kalonji), rosemary, and castor oil. Strengthens roots, prevents seasonal hair fall, and restores deep shine.',
    features: [
      '100% Unrefined cold-pressed botanical oils (No mineral oils or parabens)',
      'Enriched with virgin Kalonji (Black Seed) and Rosemary extracts',
      'Non-greasy fast-absorbing formula with subtle herbal aroma',
      'Soothes dry, flaky scalp and eliminates winter dandruff',
      'Suitable for all hair types and beard grooming'
    ],
    specs: {
      'Volume': '200 ml Glass Dispenser Bottle',
      'Extraction': 'Wood-Pressed Cold Extracted',
      'Key Ingredients': 'Virgin Coconut, Kalonji, Castor, Rosemary, Fenugreek',
      'Shelf Life': '24 Months from manufacturing date',
      'Certification': 'BSTI Verified & Dermatologically Tested'
    },
    isFeatured: true,
    badge: 'Organic'
  },
  {
    id: 'afm-polo-08',
    title: 'SuperCombed Pique Cotton Classic Collar Polo',
    titleBn: 'সুপারকৌম্ড পিকে কটন ক্লাসিক কলার পোলো শার্ট',
    category: 'fashion',
    price: 1190,
    originalPrice: 1450,
    rating: 4.78,
    reviewsCount: 76,
    inStock: true,
    stockCount: 19,
    image: '/src/assets/images/product_silk_embroidered_panjabi_1792405780182.jpg',
    gallery: [
      '/src/assets/images/product_silk_embroidered_panjabi_1792405780182.jpg'
    ],
    description: 'Heavyweight 220 GSM combed compact cotton with a structured ribbed collar that refuses to curl. Designed for relaxed smart-casual wear, office meetings, and weekend outings.',
    features: [
      '220 GSM 100% long-staple combed pique cotton',
      'Anti-curl heat-set flat knit ribbed collar and cuffs',
      'Mother of pearl style dyed-to-match buttons',
      'Reinforced side vents with contrast herringbone tape',
      'Colorfast enzyme washed to prevent fading'
    ],
    specs: {
      'GSM': '220 GSM Heavyweight',
      'Fabric': '100% Ring Spun Combed Cotton',
      'Collar': 'Ribbed Flat Knit Collar',
      'Fit': 'Regular Fit',
      'Care': 'Machine wash cold with like colors'
    },
    sizes: ['M (Chest 38)', 'L (Chest 40)', 'XL (Chest 42)', 'XXL (Chest 44)'],
    colors: ['Deep Navy', 'Heather Charcoal', 'Forest Olive'],
    isFeatured: false
  },
  {
    id: 'afm-attar-09',
    title: 'Royal Oudh & White Amber Concentrated Attar (12ml)',
    titleBn: 'রয়্যাল উদ ও হোয়াইট আম্বার খাঁটি আতর (১২ মি.লি.)',
    category: 'beauty-care',
    price: 1450,
    originalPrice: 1850,
    rating: 4.96,
    reviewsCount: 189,
    inStock: true,
    stockCount: 30,
    image: '/src/assets/images/hero_arafat_mart_lifestyle_1792405781284.jpg',
    gallery: [
      '/src/assets/images/hero_arafat_mart_lifestyle_1792405781284.jpg'
    ],
    description: '100% pure alcohol-free concentrated perfume oil distilled from vintage Cambodian Agarwood, rich amber resin, and velvety Taif rose. Endures over 24 hours on fabric and skin with an opulent oriental sillage.',
    features: [
      '100% Non-alcoholic concentrated oil extract (Halal certified)',
      'Rich mature Agarwood (Oudh) with warm golden amber notes',
      'Long-lasting projection enduring 24+ hours',
      'Artisanal octagonal crystal bottle with precision glass applicator',
      'Safe for sensitive skin and Jummah / Eid prayers'
    ],
    specs: {
      'Volume': '12 ml (1 Tola)',
      'Concentration': 'Pure Perfume Oil (Attar)',
      'Origin': 'Distilled from Sylhet & Cambodian Agarwood',
      'Packaging': 'Velvet Gift Box with Gold Foil Embossing'
    },
    isFeatured: true,
    badge: 'Premium Oudh'
  }
];

export const MOCK_REVIEWS = [
  {
    id: 'rev-01',
    author: 'Tanvir Hossain',
    location: 'Gulshan, Dhaka',
    rating: 5,
    date: '3 days ago',
    comment: 'The panjabi fabric is extraordinarily comfortable. The subtle neck embroidery looks even better in person than photos. Got delivered to Gulshan in just 26 hours. Truly impressed with Arafat Mart!',
    verified: true
  },
  {
    id: 'rev-02',
    author: 'Nusrat Jahan',
    location: 'Agrabad, Chattogram',
    rating: 5,
    date: '1 week ago',
    comment: 'Kurti fits true to size and the sage shade is serene. The cotton is genuinely handloom, soft on skin. Cash on delivery was seamless in Chattogram.',
    verified: true
  },
  {
    id: 'rev-03',
    author: 'Kazi Mahbubur Rahman',
    location: 'Zindabazar, Sylhet',
    rating: 5,
    date: '2 weeks ago',
    comment: 'The 10,000mAh magnetic power bank is a beast. Snaps firmly onto my phone and the digital percentage display is accurate. Packaging had double bubble wrap for courier safety.',
    verified: true
  },
  {
    id: 'rev-04',
    author: 'Sharmin Akter',
    location: 'Shaheb Bazar, Rajshahi',
    rating: 5,
    date: '3 weeks ago',
    comment: 'Cookware pot is heavy gauge and the wooden handles stay completely cool while cooking bhuna khichuri. Highly recommended home brand.',
    verified: true
  }
];
