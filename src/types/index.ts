export type ProductCategory = 'all' | 'fashion' | 'gadgets' | 'home-kitchen' | 'beauty-care';

export interface Product {
  id: string;
  title: string;
  titleBn?: string;
  category: ProductCategory;
  price: number; // in BDT (৳)
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  sizes?: string[];
  colors?: string[];
  isFeatured?: boolean;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket';

export interface CustomerDetails {
  fullName: string;
  phone: string;
  division: string;
  district: string;
  thana: string;
  fullAddress: string;
  orderNote?: string;
}

export type OrderStatus = 'confirmed' | 'quality_check' | 'dispatched' | 'out_for_delivery' | 'delivered';

export interface TrackingEvent {
  status: OrderStatus;
  label: string;
  time: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  trackingNumber: string;
  createdAt: string;
  userId?: string;
  userEmail?: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'cod_verified';
  orderStatus: OrderStatus;
  trxId?: string;
  timeline: TrackingEvent[];
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  division?: string;
  district?: string;
  thana?: string;
  fullAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WishStatus = 'pending' | 'reviewing' | 'fulfilled' | 'cancelled';

export interface CustomerWish {
  id: string;
  title: string;
  category?: string;
  expectedPrice?: string;
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  referenceUrl?: string;
  status: WishStatus;
  adminNotes?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  caption: string;
  imageUrl?: string;
  likes: string[]; // array of user UIDs
  likesCount: number;
  commentsCount: number;
  status: 'active' | 'deleted';
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  joinedAt?: string;
  updatedAt?: string;
}
