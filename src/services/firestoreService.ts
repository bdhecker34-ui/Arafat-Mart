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
 * COMMUNITY FEED & USER PROFILES (Facebook-like)
 * ==========================================
 */

/**
 * Real-time listener for Community Feed Posts
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
      const posts: FeedPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        posts.push({
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
      onPosts(posts);
    },
    (error) => {
      console.warn('Feed posts subscription note:', error);
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.GET, path);
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
    handleFirestoreError(error, OperationType.CREATE, path);
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
    handleFirestoreError(error, OperationType.UPDATE, path);
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
      const comments: FeedComment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        comments.push({
          id: docSnap.id,
          postId: data.postId,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatar: data.authorAvatar || '',
          content: data.content,
          createdAt: data.createdAt,
        });
      });
      onComments(comments);
    },
    (error) => {
      console.warn(`Comments subscription note for post ${postId}:`, error);
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.GET, path);
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
    handleFirestoreError(error, OperationType.CREATE, path);
    return { success: false, error: error?.message || 'Failed to add comment' };
  }
}

/**
 * Delete a post (by Author or Admin)
 */
export async function deleteFeedPostFromFirestore(postId: string): Promise<boolean> {
  const path = `feed_posts/${postId}`;
  try {
    const postRef = doc(db, 'feed_posts', postId);
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

/**
 * Delete a comment (by Author or Admin)
 */
export async function deleteFeedCommentFromFirestore(commentId: string, postId: string): Promise<boolean> {
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
    handleFirestoreError(error, OperationType.DELETE, path);
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
    handleFirestoreError(error, OperationType.GET, path);
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
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

