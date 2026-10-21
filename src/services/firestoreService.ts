/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AdminContentState, AuditLogEntry } from './adminApi';

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
  const path = 'audit_logs';
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
