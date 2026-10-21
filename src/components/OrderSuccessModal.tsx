import React from 'react';
import { CheckCircle2, Truck, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto p-6 sm:p-8 text-center">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          Order Confirmed!
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Thank you, <strong>{order.customer.fullName}</strong>. Your order has been placed successfully.
        </p>

        {/* Order ID Pill */}
        <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs font-mono">
          <div className="text-left">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Order Reference</span>
            <span className="font-bold text-stone-900 text-sm">{order.id}</span>
          </div>
          <button
            onClick={copyOrderId}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-sans font-medium text-stone-600 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Delivery Details Brief */}
        <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <Truck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Shipping to {order.customer.district}, {order.customer.division}</span>
          </div>
          <p className="text-stone-600 text-[11px] leading-relaxed">
            {order.customer.fullAddress} · Contact: <strong>{order.customer.phone}</strong>
          </p>
          <div className="pt-2 border-t border-amber-200/50 flex justify-between font-medium">
            <span>Payment: <strong>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}</strong></span>
            <span className="font-mono tabular-nums text-stone-900 font-bold">Total: ৳{order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Quality Check Promise */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Our team will conduct physical inspection before courier handover.</span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onTrackOrder(order.id)}
            className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Track Courier Timeline</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
