import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Plus, Minus, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-fadeIn flex justify-end">
      <div
        data-testid="cart-drawer-panel"
        className="w-full max-w-md bg-canvas h-full flex flex-col border-l border-hairline shadow-2xl relative pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-ink" />
            <h2 className="font-card-title text-xl font-bold tracking-tight">Studio Bag</h2>
            <span className="font-mono text-xs bg-surface-soft px-2 py-0.5 rounded-full border border-hairline">
              {totalItems} items
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
            className="w-8 h-8 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-hairline">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-ink/60 p-8">
              <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center mb-4 text-ink/40">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-card-title text-lg font-bold text-ink mb-1">Your cart is empty</h3>
              <p className="font-body-sm text-sm text-ink/70 mb-6">
                Explore the atelier catalog to curate your creative space.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-secondary !text-sm cursor-pointer"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-surface-soft border border-hairline shrink-0">
                    <img
                      src={product.image_urls[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-card-title text-sm font-bold text-ink truncate pr-2">
                        {product.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-ink/40 hover:text-accent-magenta transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="font-mono text-xs text-ink/60 mt-0.5">
                      ${product.price.toFixed(2)} each
                    </div>

                    {/* Stepper & Line Total */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-hairline rounded-pill bg-surface-soft px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-canvas cursor-pointer text-ink"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs px-2.5 font-bold">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= product.stock}
                          onClick={() => updateQuantity(product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-canvas disabled:opacity-30 cursor-pointer text-ink"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono text-sm font-semibold text-ink">
                        ${(product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {item.quantity >= product.stock && (
                      <span className="text-[11px] font-mono text-amber-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> Max available stock reached
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Checkout Button */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-hairline bg-surface-soft/40 flex flex-col gap-4">
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-ink/70">
                <span>SUBTOTAL</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>ESTIMATED SHIPPING</span>
                <span className="text-semantic-success">FREE (SPRING PROMO)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t border-hairline">
                <span>TOTAL DUE</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onProceedToCheckout();
              }}
              className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
