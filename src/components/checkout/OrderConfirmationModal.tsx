import React from 'react';
import { Check, ArrowRight, Package } from 'lucide-react';
import { Order } from '../../types/database';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative bg-canvas w-full max-w-lg rounded-lg border border-hairline overflow-hidden shadow-2xl p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-block-lime flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-semantic-success stroke-[2.5]" />
        </div>

        <div className="text-center mb-6">
          <span className="font-caption text-xs text-semantic-success tracking-widest font-semibold uppercase">
            ATOMIC TRANSACTION CONFIRMED
          </span>
          <h2 className="font-card-title text-2xl font-bold text-ink mt-1">
            Order Successfully Placed
          </h2>
          <p className="font-body-sm text-sm text-ink/70 mt-1">
            Thank you for ordering with Atelier. Your inventory allocation has been locked in Supabase.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="p-4 rounded-md bg-surface-soft border border-hairline font-mono text-xs space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-ink/60">ORDER ID:</span>
            <span className="font-bold text-ink">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">STATUS:</span>
            <span className="uppercase text-semantic-success font-semibold">{order.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">PAYMENT REF:</span>
            <span className="text-ink">{order.payment_intent_id || 'pi_confirmed'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">RECIPIENT:</span>
            <span className="text-ink">{order.shipping_address.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">DISPATCH TO:</span>
            <span className="text-ink truncate max-w-[200px]">
              {order.shipping_address.addressLine1}, {order.shipping_address.city}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-hairline font-bold text-sm text-ink">
            <span>TOTAL CHARGED:</span>
            <span>${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="mb-6">
            <span className="font-caption text-xs text-ink/60 mb-2 block">PURCHASED OBJECTS</span>
            <div className="divide-y divide-hairline">
              {order.items.map((item) => (
                <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-ink/40" />
                    <span className="font-medium text-ink">
                      {item.product?.title || 'Product Item'}
                    </span>
                  </div>
                  <span className="font-mono text-ink/70">
                    {item.quantity} × ${item.unit_price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="btn-primary w-full !py-3 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
