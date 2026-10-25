/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AdminContentState, AuditLogEntry } from './adminApi';
import { UserProfile, CustomerWish, WishStatus, FeedPost, FeedComment, CommunityProfile } from '../types';

const STORE_CONTENT_DOC = 'main_config';

/**
 * Real-time listener for store content (catalog, banners, contact, settings)
 */
export function subscribeStoreContent(
  onData: (content: AdminContentState | null) => void,
  onError?: (err: Error) => void
) {
  const path = `store_content/${STORE_CONTENT_DOC}`;
  const docRef = doc(db, 'store_content', STORE_CONTENT_DOC);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as AdminContentState);
      } else {
        onData(null);
      }
    },
    (error) => {
      console.warn('Firestore store_content subscription error:', error);
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
  );
}

/**
 * Fetch store content one-off from Firestore
 */
export async function getStoreContentFromFirestore(): Promise<AdminContentState | null> {
  const path = `store_content/${STORE_CONTENT_DOC}`;
  try {
    const docRef = doc(db, 'store_content', STORE_CONTENT_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AdminContentState;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Save store content to Firestore
 */
export async function saveStoreContentToFirestore(
  content: AdminContentState
): Promise<{ success: boolean; error?: string }> {
  const path = `store_content/${STORE_CONTENT_DOC}`;
  try {
    const docRef = doc(db, 'store_content', STORE_CONTENT_DOC);
    await setDoc(docRef, {
      ...content,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // caught error
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save to Firestore',
    };
  }
}

/**
 * Save new customer order into Firestore
 */
export async function saveOrderToFirestore(order: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryDistrict: string;
  deliveryAddress: string;
  paymentMethod: string;
  trxId?: string;
  totalAmount: number;
  status: string;
  items: any[];
  notes?: string;
  userId?: string;
  userEmail?: string;
}): Promise<{ success: boolean; id: string }> {
  const path = `orders/${order.orderId}`;
  try {
    const orderDoc = doc(db, 'orders', order.orderId);
    await setDoc(orderDoc, {
      ...order,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: order.orderId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return { success: false, id: order.orderId };
  }
}

/**
 * Save / Update Customer User Profile
 */
export async function saveUserProfileToFirestore(
  userId: string,
  profile: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  const path = `users/${userId}`;
  try {
    const userDoc = doc(db, 'users', userId);
    await setDoc(
      userDoc,
      {
        ...profile,
        uid: userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save profile' };
  }
}

/**
 * Fetch Customer User Profile
 */
export async function getUserProfileFromFirestore(
  userId: string
): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const userDoc = doc(db, 'users', userId);
    const snap = await getDoc(userDoc);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Subscribe to Orders placed by a specific signed-in user
 */
export function subscribeUserOrders(
  userId: string,
  onOrders: (orders: any[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'orders';
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const ordersList: any[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort in-memory by createdAt descending
      ordersList.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      onOrders(ordersList);
    },
    (error) => {
      console.warn('Customer orders subscription note:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Subscribe to orders for Admin Dashboard
 */
export function subscribeOrders(
  onOrders: (orders: any[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'orders';
  const q = query(collection(db, 'orders'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const ordersList: any[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push({ id: docSnap.id, ...docSnap.data() });
      });
      onOrders(ordersList);
    },
    (error) => {
      console.warn('Orders subscription note:', error);
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
  );
}

/**
 * Update order status
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: string
): Promise<boolean> {
  const path = `orders/${orderId}`;
  try {
    const orderRef = doc(db, 'orders', orderId);
    await setDoc(
      orderRef,
      {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

/**
 * Add Audit Log
 */
export async function addAuditLogToFirestore(
  action: string,
  module: string,
  detail: string,
  adminEmail: string
): Promise<void> {
  const logId = `log_${Date.now()}`;
  const path = `audit_logs/${logId}`;
  try {
    const logDoc = doc(db, 'audit_logs', logId);
    await setDoc(logDoc, {
      id: logId,
      action,
      module,
      detail,
      adminEmail,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
    });
  } catch (error) {
    console.warn('Audit log write note:', error);
  }
}

/**
 * Subscribe to Audit Logs
 */
export function subscribeAuditLogs(
  onLogs: (logs: AuditLogEntry[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: AuditLogEntry[] = [];
      snapshot.forEach((docSnap) => {
        logs.push(docSnap.data() as AuditLogEntry);
      });
      onLogs(logs);
    },
    (error) => {
      console.warn('Audit logs subscription note:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save Customer Wish / Product Request to Firestore
 */
export async function saveCustomerWishToFirestore(wish: CustomerWish): Promise<boolean> {
  const path = `customer_wishes/${wish.id}`;
  try {
    const wishRef = doc(db, 'customer_wishes', wish.id);
    await setDoc(wishRef, {
      ...wish,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}

/**
 * Real-time listener for Customer Wishes (Admin panel & user)
 */
export function subscribeCustomerWishes(
  onWishes: (wishes: CustomerWish[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'customer_wishes';
  const q = query(collection(db, 'customer_wishes'), orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const wishes: CustomerWish[] = [];
      snapshot.forEach((docSnap) => {
        wishes.push(docSnap.data() as CustomerWish);
      });
      onWishes(wishes);
    },
    (error) => {
      console.warn('Customer wishes subscription note:', error);
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Update Customer Wish Status or Admin Notes
 */
export async function updateCustomerWishStatusInFirestore(
  wishId: string,
  newStatus: WishStatus,
  adminNotes?: string
): Promise<boolean> {
  const path = `customer_wishes/${wishId}`;
  try {
    const wishRef = doc(db, 'customer_wishes', wishId);
    const payload: any = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      payload.adminNotes = adminNotes;
    }
    await setDoc(wishRef, payload, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

/**
 * Delete a Customer Wish from Firestore
 */
export async function deleteCustomerWishFromFirestore(wishId: string): Promise<boolean> {
  const path = `customer_wishes/${wishId}`;
  try {
    const wishRef = doc(db, 'customer_wishes', wishId);
    await deleteDoc(wishRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

/**
 * ==========================================
 * EASY MART NEWS FEED & USER PROFILES
 * ==========================================
 */

/**
 * Rich realistic demo posts for Easy Mart News Feed
 */
export const DEFAULT_DEMO_FEED_POSTS: FeedPost[] = [
  {
    id: 'demo_post_1',
    authorId: 'official_easymart',
    authorName: 'Easy Mart Official',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    caption: '🌟 Easy Mart News Feed-এ সবাইকে স্বাগতম! সারা বাংলাদেশে ৬৪ জেলায় দ্রুততম হোম ডেলিভারি ও ক্যাশ অন ডেলিভারিতে আসল পণ্য পৌঁছে দিতে আমরা প্রতিশ্রুতিবদ্ধ। আপনাদের কেনাকাটার অভিজ্ঞতা, আনবক্সিং ফটো এবং পণ্যের মতামত এখানে শেয়ার করতে পারেন।\n\n📌 ছবি আপলোড করার নিয়ম: https://postimages.org/ থেকে ডিরেক্ট লিংক দিয়ে পোস্ট করুন।',
    imageUrl: 'https://i.postimg.cc/85kZ905d/banner-lifestyle.jpg',
    likes: ['user_sample_1', 'user_sample_2', 'user_sample_3', 'user_sample_4'],
    likesCount: 38,
    commentsCount: 2,
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'demo_post_2',
    authorId: 'user_tanvir_dhaka',
    authorName: 'তানভীর আহমেদ',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    caption: 'Easy Mart থেকে প্রিমিয়াম কটন পাঞ্জাবিটা অর্ডার করেছিলাম। মাত্র ৪৮ ঘণ্টার মাথায় ধানমন্ডিতে ডেলিভারি পেয়েছি। কাপড়ের মান ও প্রিমিয়াম ফিনিশিং সত্যিই প্রশংসনীয়! সাইজও নিখুঁত হয়েছে। যারা অর্ডার করার কথা ভাবছেন নিঃসন্দেহে নিতে পারেন। 👌✨',
    imageUrl: 'https://i.postimg.cc/7hpF7K3v/panjabi-unboxing.jpg',
    likes: ['user_sample_1', 'user_sample_5', 'user_sample_6'],
    likesCount: 24,
    commentsCount: 2,
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'demo_post_3',
    authorId: 'user_nusrat_ctg',
    authorName: 'নুসরাত জাহান',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    caption: '20000mAh 22.5W ফাস্ট চার্জিং পাওয়ার ব্যাংকটা নিয়েছিলাম। অসাধারণ বিল্ড কোয়ালিটি ও সুপারফাস্ট চার্জিং সাপোর্ট। এক চার্জেই আমার ফোন টানা ৩ দিন চার্জ দেওয়া যায়। অরজিনাল গ্যাজেট দেওয়ার জন্য Easy Mart-কে ধন্যবাদ! 🔋⚡',
    imageUrl: 'https://i.postimg.cc/KzT5fM8T/powerbank-real.jpg',
    likes: ['user_sample_2', 'user_sample_7'],
    likesCount: 19,
    commentsCount: 2,
    status: 'active',
    createdAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
  },
  {
    id: 'demo_post_4',
    authorId: 'user_sadia_syl',
    authorName: 'সাদিয়া ইসলাম',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    caption: 'Easy Mart-এর কাস্টমার কেয়ার সার্ভিস সত্যিই দারুণ। ডেলিভারি ট্র্যাক করা অনেক সহজ এবং ডেলিভারিম্যানের ব্যবহারও খুব ভদ্র ছিল। আশা করি আপনারা অর্গানিক স্কিন কেয়ারের কিছু প্রোডাক্টও শীঘ্রই যোগ করবেন! ❤️🛍️',
    imageUrl: '',
    likes: ['user_sample_3', 'user_sample_8', 'user_sample_9'],
    likesCount: 31,
    commentsCount: 0,
    status: 'active',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
  {
    id: 'demo_post_5',
    authorId: 'user_rafiq_raj',
    authorName: 'মোঃ রফিকুল ইসলাম',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    caption: 'স্মার্ট স্পোর্টস ওয়াটারপ্রুফ ওয়াচটা হাতে পেয়ে বেশ খুশি। ব্যাটারি ব্যাকআপ দারুণ আর ওয়াটারপ্রুফ টেস্টেও শতভাগ পাস। দাম অনুযায়ী এই সেগমেন্টে সেরা চয়েস।',
    imageUrl: 'https://i.postimg.cc/W34k1s4m/watch-review.jpg',
    likes: ['user_sample_1', 'user_sample_4'],
    likesCount: 16,
    commentsCount: 0,
    status: 'active',
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  },
];

/**
 * Realistic demo comments for demo posts
 */
export const DEFAULT_DEMO_COMMENTS: Record<string, FeedComment[]> = {
  demo_post_1: [
    {
      id: 'demo_comm_1_1',
      postId: 'demo_post_1',
      authorId: 'user_kamrul',
      authorName: 'কামরুল হাসান',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      content: 'মাশাআল্লাহ অনেক সুন্দর উদ্যোগ! চট্টগ্রাম শহরে হোম ডেলিভারি পেতে কতদিন সময় লাগে?',
      createdAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    },
    {
      id: 'demo_comm_1_2',
      postId: 'demo_post_1',
      authorId: 'official_easymart',
      authorName: 'Easy Mart Official',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      content: 'ধন্যবাদ কামরুল ভাই! চট্টগ্রামে সাধারণত ৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি পৌঁছে দেওয়া হয়। ক্যাশ অন ডেলিভারিতে চেক করে মূল্য পরিশোধ করতে পারবেন।',
      createdAt: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString(),
    },
  ],
  demo_post_2: [
    {
      id: 'demo_comm_2_1',
      postId: 'demo_post_2',
      authorId: 'user_sajid',
      authorName: 'সাজিদ মাহমুদ',
      authorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop&q=80',
      content: 'পাঞ্জাবির ফেব্রিক কি ১০০% প্রিমিয়াম সুতি? গরমে পরে স্বস্তি পাওয়া যায়?',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'demo_comm_2_2',
      postId: 'demo_post_2',
      authorId: 'user_tanvir_dhaka',
      authorName: 'তানভীর আহমেদ',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      content: 'হ্যাঁ ভাই, একদম পিওর প্রিমিয়াম কটন। গরমে পরার জন্য খুবই আরামদায়ক ও ব্রেথেবল।',
      createdAt: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
    },
  ],
  demo_post_3: [
    {
      id: 'demo_comm_3_1',
      postId: 'demo_post_3',
      authorId: 'user_imran',
      authorName: 'ইমরান হোসেন',
      authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      content: 'আইফোন কি ফাস্ট চার্জ হয় এটা দিয়ে?',
      createdAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    },
    {
      id: 'demo_comm_3_2',
      postId: 'demo_post_3',
      authorId: 'user_nusrat_ctg',
      authorName: 'নুসরাত জাহান',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      content: 'হ্যাঁ, টাইপ-সি পিডি আউটপুট দিয়ে ৫০% চার্জ মাত্র ৩০ মিনিটে হয়ে যায়। বক্সের সাথে ওয়ারেন্টি কার্ডও পেয়েছি।',
      createdAt: new Date(Date.now() - 8.5 * 3600 * 1000).toISOString(),
    },
  ],
};

/**
 * Real-time listener for Easy Mart News Feed Posts
 */
export function subscribeFeedPosts(
  onPosts: (posts: FeedPost[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'feed_posts';
  const q = query(
    collection(db, 'feed_posts'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(150)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const livePosts: FeedPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        livePosts.push({
          id: docSnap.id,
          authorId: data.authorId || '',
          authorName: data.authorName || 'Community Member',
          authorAvatar: data.authorAvatar || '',
          caption: data.caption || '',
          imageUrl: data.imageUrl || '',
          likes: Array.isArray(data.likes) ? data.likes : [],
          likesCount: typeof data.likesCount === 'number' ? data.likesCount : (data.likes?.length || 0),
          commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : 0,
          status: data.status || 'active',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
        });
      });

      // Filter out any demo posts that might already exist in Firestore
      const liveIds = new Set(livePosts.map((p) => p.id));
      let remainingDemos = DEFAULT_DEMO_FEED_POSTS.filter((demo) => !liveIds.has(demo.id));
      try {
        const deletedSaved = localStorage.getItem('arafat_mart_deleted_demo_posts');
        if (deletedSaved) {
          const deletedIds = new Set(JSON.parse(deletedSaved));
          remainingDemos = remainingDemos.filter((d) => !deletedIds.has(d.id));
        }
        const demoLikesSaved = localStorage.getItem('arafat_mart_demo_likes');
        if (demoLikesSaved) {
          const demoLikesMap = JSON.parse(demoLikesSaved);
          remainingDemos = remainingDemos.map((d) => {
            if (demoLikesMap[d.id]) {
              const updatedLikes = demoLikesMap[d.id];
              return {
                ...d,
                likes: updatedLikes,
                likesCount: updatedLikes.length,
              };
            }
            return d;
          });
        }
      } catch {}

      // Combine live user posts on top, followed by rich demo posts
      const combined = [...livePosts, ...remainingDemos];
      onPosts(combined);
    },
    (error) => {
      console.warn('Feed posts subscription note:', error);
      // Fallback to rich demo posts on network/permission note
      onPosts(DEFAULT_DEMO_FEED_POSTS);
      if (onError) {
        onError(error);
      } else {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch {}
      }
    }
  );
}

/**
 * Create a new Community Feed Post
 * Note: Only signed up users can post. Photo link must be from postimages.org
 */
export async function createFeedPostInFirestore(params: {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  caption: string;
  imageUrl?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `feed_posts/${postId}`;
  try {
    const postRef = doc(db, 'feed_posts', postId);
    const postPayload: FeedPost = {
      id: postId,
      authorId: params.authorId,
      authorName: params.authorName,
      authorAvatar: params.authorAvatar || '',
      caption: params.caption.trim(),
      imageUrl: params.imageUrl ? params.imageUrl.trim() : '',
      likes: [],
      likesCount: 0,
      commentsCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await setDoc(postRef, postPayload);
    return { success: true, id: postId };
  } catch (error: any) {
    try {
      handleFirestoreError(error, OperationType.CREATE, path);
    } catch {}
    return { success: false, error: error?.message || 'Failed to publish post' };
  }
}

/**
 * Toggle like reaction on a post (signed in user only)
 */
export async function toggleLikeFeedPostInFirestore(
  postId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  if (postId.startsWith('demo_')) {
    try {
      const saved = localStorage.getItem('arafat_mart_demo_likes');
      const likesMap: Record<string, string[]> = saved ? JSON.parse(saved) : {};
      const original = DEFAULT_DEMO_FEED_POSTS.find((p) => p.id === postId)?.likes || [];
      const currentList = likesMap[postId] !== undefined ? likesMap[postId] : original;
      const updatedList = currentlyLiked ? currentList.filter((id) => id !== userId) : [...currentList, userId];
      likesMap[postId] = updatedList;
      localStorage.setItem('arafat_mart_demo_likes', JSON.stringify(likesMap));
    } catch {}
    return true;
  }

  const path = `feed_posts/${postId}`;
  try {
    const postRef = doc(db, 'feed_posts', postId);
    await setDoc(
      postRef,
      {
        likes: currentlyLiked ? arrayRemove(userId) : arrayUnion(userId),
        likesCount: increment(currentlyLiked ? -1 : 1),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } catch {}
    return false;
  }
}

/**
 * Real-time listener for comments on a specific post
 */
export function subscribePostComments(
  postId: string,
  onComments: (comments: FeedComment[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'feed_comments';
  const q = query(
    collection(db, 'feed_comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const liveComments: FeedComment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        liveComments.push({
          id: docSnap.id,
          postId: data.postId,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatar: data.authorAvatar || '',
          content: data.content,
          createdAt: data.createdAt,
        });
      });

      const demoCommentsForPost = (() => {
        try {
          const saved = localStorage.getItem('arafat_mart_demo_comments');
          if (saved) {
            const commentsMap = JSON.parse(saved);
            if (commentsMap[postId]) return commentsMap[postId] as FeedComment[];
          }
        } catch {}
        return DEFAULT_DEMO_COMMENTS[postId] || [];
      })();

      const liveIds = new Set(liveComments.map((c) => c.id));
      const remainingDemoComments = demoCommentsForPost.filter((c) => !liveIds.has(c.id));

      onComments([...remainingDemoComments, ...liveComments]);
    },
    (error) => {
      console.warn(`Comments subscription note for post ${postId}:`, error);
      const demoComments = (() => {
        try {
          const saved = localStorage.getItem('arafat_mart_demo_comments');
          if (saved) {
            const commentsMap = JSON.parse(saved);
            if (commentsMap[postId]) return commentsMap[postId] as FeedComment[];
          }
        } catch {}
        return DEFAULT_DEMO_COMMENTS[postId] || [];
      })();
      onComments(demoComments);
      if (onError) {
        onError(error);
      } else {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch {}
      }
    }
  );
}

/**
 * Add a comment to a feed post
 */
export async function addFeedCommentInFirestore(params: {
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (params.postId.startsWith('demo_')) {
    try {
      const saved = localStorage.getItem('arafat_mart_demo_comments');
      const commentsMap: Record<string, FeedComment[]> = saved ? JSON.parse(saved) : {};
      const existing = commentsMap[params.postId] || DEFAULT_DEMO_COMMENTS[params.postId] || [];
      const newComment: FeedComment = {
        id: `demo_user_comm_${Date.now()}`,
        postId: params.postId,
        authorId: params.authorId,
        authorName: params.authorName,
        authorAvatar: params.authorAvatar || '',
        content: params.content.trim(),
        createdAt: new Date().toISOString(),
      };
      commentsMap[params.postId] = [...existing, newComment];
      localStorage.setItem('arafat_mart_demo_comments', JSON.stringify(commentsMap));
      return { success: true, id: newComment.id };
    } catch {
      return { success: true };
    }
  }

  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `feed_comments/${commentId}`;
  try {
    const commentRef = doc(db, 'feed_comments', commentId);
    const commentPayload: FeedComment = {
      id: commentId,
      postId: params.postId,
      authorId: params.authorId,
      authorName: params.authorName,
      authorAvatar: params.authorAvatar || '',
      content: params.content.trim(),
      createdAt: new Date().toISOString(),
    };

    await setDoc(commentRef, commentPayload);

    // Increment post's commentsCount
    try {
      const postRef = doc(db, 'feed_posts', params.postId);
      await setDoc(postRef, { commentsCount: increment(1) }, { merge: true });
    } catch (e) {
      console.warn('Could not increment commentsCount:', e);
    }

    return { success: true, id: commentId };
  } catch (error: any) {
    try {
      handleFirestoreError(error, OperationType.CREATE, path);
    } catch {}
    return { success: false, error: error?.message || 'Failed to add comment' };
  }
}

/**
 * Delete a post (by Author or Admin)
 */
export async function deleteFeedPostFromFirestore(postId: string): Promise<boolean> {
  if (postId.startsWith('demo_')) {
    try {
      const saved = localStorage.getItem('arafat_mart_deleted_demo_posts');
      const deleted: string[] = saved ? JSON.parse(saved) : [];
      if (!deleted.includes(postId)) {
        deleted.push(postId);
        localStorage.setItem('arafat_mart_deleted_demo_posts', JSON.stringify(deleted));
      }
    } catch {}
    return true;
  }

  const path = `feed_posts/${postId}`;
  try {
    const postRef = doc(db, 'feed_posts', postId);
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, path);
    } catch {}
    return false;
  }
}

/**
 * Delete a comment (by Author or Admin)
 */
export async function deleteFeedCommentFromFirestore(commentId: string, postId: string): Promise<boolean> {
  if (postId.startsWith('demo_')) {
    try {
      const saved = localStorage.getItem('arafat_mart_demo_comments');
      if (saved) {
        const commentsMap: Record<string, FeedComment[]> = JSON.parse(saved);
        if (commentsMap[postId]) {
          commentsMap[postId] = commentsMap[postId].filter((c) => c.id !== commentId);
          localStorage.setItem('arafat_mart_demo_comments', JSON.stringify(commentsMap));
        }
      }
    } catch {}
    return true;
  }

  const path = `feed_comments/${commentId}`;
  try {
    const commentRef = doc(db, 'feed_comments', commentId);
    await deleteDoc(commentRef);

    // Decrement post's commentsCount
    try {
      const postRef = doc(db, 'feed_posts', postId);
      await setDoc(postRef, { commentsCount: increment(-1) }, { merge: true });
    } catch (e) {
      console.warn('Could not decrement commentsCount:', e);
    }

    return true;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, path);
    } catch {}
    return false;
  }
}

/**
 * Fetch a Public User Profile
 */
export async function getCommunityProfileFromFirestore(userId: string): Promise<CommunityProfile | null> {
  const path = `user_profiles/${userId}`;
  try {
    const docRef = doc(db, 'user_profiles', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CommunityProfile;
    }
    return null;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch {}
    return null;
  }
}

/**
 * Save/Update Community Profile (Avatar via postimages.org, bio, location)
 */
export async function saveCommunityProfileToFirestore(
  profile: Partial<CommunityProfile> & { userId: string }
): Promise<boolean> {
  const path = `user_profiles/${profile.userId}`;
  try {
    const docRef = doc(db, 'user_profiles', profile.userId);
    const payload = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } catch {}
    return false;
  }
}

