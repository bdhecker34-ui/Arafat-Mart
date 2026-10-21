import React, { useState } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, MapPin, Package } from 'lucide-react';
import { Order } from '../types';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  defaultOrderId?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  orders,
  defaultOrderId,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState(defaultOrderId || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(
    defaultOrderId ? orders.find((o) => o.id === defaultOrderId) || null : (orders[0] || null)
  );
  const [hasSearched, setHasSearched] = useState(Boolean(defaultOrderId || orders.length > 0));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchedOrder(null);
      return;
    }

    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === q ||
        o.customer.phone.replace(/[\s-]/g, '').includes(q.replace(/[\s-]/g, '')) ||
        o.trackingNumber.toLowerCase() === q
    );

    setSearchedOrder(found || null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-800" />
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Courier Delivery Tracking
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close tracker"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-6 border-b border-stone-100 bg-stone-50/30">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. AFM-2026-...) or Phone Number"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
            >
              Track Status
            </button>
          </form>
        </div>

        {/* Order Details Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {searchedOrder ? (
            <div className="space-y-6">
              
              {/* Order Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-900">{searchedOrder.id}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded">
                      {searchedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid Online'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Recipient: <strong>{searchedOrder.customer.fullName}</strong> · {searchedOrder.customer.district}, {searchedOrder.customer.division}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Total Amount</span>
                  <span className="text-sm font-extrabold text-stone-900 font-mono tabular-nums">
                    ৳{searchedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Delivery Timeline */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
                  Dispatch & Courier Milestones
                </h4>

                <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {searchedOrder.timeline.map((event, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      
                      {/* Timeline Dot Icon */}
                      <div
                        className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          event.completed
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                            : event.current
                            ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                            : 'bg-stone-200 text-stone-400'
                        }`}
                      >
                        {event.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-bold ${event.completed || event.current ? 'text-stone-900' : 'text-stone-400'}`}>
                            {event.label}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">{event.time}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courier Partner Badge */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-[#f7f3ea] flex items-center justify-between text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-800" />
                  <span>Assigned Courier: <strong>Steadfast Courier / Pathao Logistics</strong></span>
                </div>
                <span className="font-mono text-stone-500 text-[11px]">Consignment: {searchedOrder.trackingNumber}</span>
              </div>

            </div>
          ) : hasSearched ? (
            <div className="text-center py-12 text-stone-500 space-y-2">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <h4 className="text-sm font-semibold text-stone-800">No matching order found</h4>
              <p className="text-xs max-w-sm mx-auto text-stone-500">
                Please double-check your Order Reference ID (e.g. AFM-2026-...) or the 11-digit mobile number provided during checkout.
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-stone-500 text-xs">
              Enter your Order Reference number or contact phone above to trace courier consignment.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
