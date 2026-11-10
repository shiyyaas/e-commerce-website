import React, { useState } from 'react';
import { X, Lock, ArrowLeft, ShieldCheck, CreditCard, MapPin, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../lib/dataService';
import { ShippingAddress, Order } from '../../types/database';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cart, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [step, setStep] = useState<'shipping' | 'payment' | 'submitting'>('shipping');
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: profile?.shipping_address?.fullName || profile?.full_name || '',
    addressLine1: profile?.shipping_address?.addressLine1 || '',
    addressLine2: profile?.shipping_address?.addressLine2 || '',
    city: profile?.shipping_address?.city || '',
    state: profile?.shipping_address?.state || '',
    postalCode: profile?.shipping_address?.postalCode || '',
    country: profile?.shipping_address?.country || 'United States',
  });

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipping.fullName || !shipping.addressLine1 || !shipping.city || !shipping.postalCode) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }
    setErrorMsg('');
    setStep('payment');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStep('submitting');

    try {
      const itemsPayload = cart
        .filter((item) => item.product !== undefined)
        .map((item) => ({
          product: item.product!,
          quantity: item.quantity,
        }));

      if (itemsPayload.length === 0) {
        throw new Error('Your cart contains no items.');
      }

      const paymentIntentId = 'pi_mock_' + Math.random().toString(36).substring(2, 10);

      // Execute atomic transaction
      const createdOrder = await createOrder({
        userId: user ? user.id : 'guest-order-user',
        items: itemsPayload,
        shippingAddress: shipping,
        paymentIntentId,
      });

      clearCart();
      onSuccess(createdOrder);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order.');
      setStep('payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative bg-canvas w-full max-w-2xl rounded-lg border border-hairline overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-hairline flex items-center justify-between bg-surface-soft/40">
          <div className="flex items-center gap-3">
            {step === 'payment' && (
              <button
                onClick={() => setStep('shipping')}
                className="w-8 h-8 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="font-caption text-xs text-ink/60">ATELIER CHECKOUT PIPELINE</span>
              <h2 className="font-card-title text-xl font-bold text-ink">
                {step === 'shipping' ? '1. Shipping & Delivery' : '2. Payment & Confirmation'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="w-8 h-8 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="grid grid-cols-2 bg-surface-soft/80 border-b border-hairline text-xs font-mono">
          <div
            className={`py-2 px-6 flex items-center gap-2 border-r border-hairline ${
              step === 'shipping' ? 'bg-canvas text-ink font-bold' : 'text-ink/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">
              1
            </span>
            <span>SHIPPING</span>
          </div>
          <div
            className={`py-2 px-6 flex items-center gap-2 ${
              step === 'payment' || step === 'submitting'
                ? 'bg-canvas text-ink font-bold'
                : 'text-ink/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">
              2
            </span>
            <span>PAYMENT</span>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-md bg-block-pink border border-red-200 text-xs text-ink font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent-magenta" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 md:p-8">
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-caption text-ink/70 mb-1">RECIPIENT FULL NAME *</label>
                <input
                  type="text"
                  required
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  placeholder="Elena Rostova"
                  className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2.5 text-sm outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-caption text-ink/70 mb-1">STREET ADDRESS *</label>
                <input
                  type="text"
                  required
                  value={shipping.addressLine1}
                  onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })}
                  placeholder="740 Broadway, Floor 4"
                  className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2.5 text-sm outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-caption text-ink/50 mb-1">SUITE / APARTMENT (OPTIONAL)</label>
                <input
                  type="text"
                  value={shipping.addressLine2}
                  onChange={(e) => setShipping({ ...shipping, addressLine2: e.target.value })}
                  placeholder="Studio 402"
                  className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2.5 text-sm outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-caption text-ink/70 mb-1">CITY *</label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="New York"
                    className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2.5 text-sm outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-caption text-ink/70 mb-1">STATE / PROVINCE</label>
                  <input
                    type="text"
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    placeholder="NY"
                    className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2.5 text-sm outline-none font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-caption text-ink/70 mb-1">POSTAL CODE *</label>
                  <input
                    type="text"
                    required
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                    placeholder="10003"
                    className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2.5 text-sm outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-caption text-ink/70 mb-1">COUNTRY</label>
                  <input
                    type="text"
                    value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                    className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2.5 text-sm outline-none font-sans"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-hairline">
                <span className="font-mono text-sm text-ink/70">
                  Total: <strong className="text-ink">${subtotal.toFixed(2)}</strong>
                </span>
                <button
                  type="submit"
                  className="btn-primary !py-2.5 !px-6 text-sm cursor-pointer"
                >
                  Continue to Payment →
                </button>
              </div>
            </form>
          )}

          {(step === 'payment' || step === 'submitting') && (
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Order summary box */}
              <div className="p-4 rounded-md bg-surface-soft border border-hairline">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-caption text-xs text-ink/60">ORDER SUMMARY</span>
                  <span className="font-mono text-xs text-ink/60">{cart.length} unique items</span>
                </div>
                <div className="font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-semantic-success">
                    <span>Shipping</span>
                    <span>$0.00 (Standard Dispatch)</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-ink pt-2 border-t border-hairline">
                    <span>Final Amount</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery recipient preview */}
              <div className="flex items-center gap-2 text-xs font-mono text-ink/70">
                <MapPin className="w-4 h-4 text-ink/40" />
                <span>
                  Delivering to: {shipping.fullName}, {shipping.addressLine1}, {shipping.city}
                </span>
              </div>

              {/* Mock Payment Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-caption text-ink/70 mb-1">CARD NUMBER</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-3 text-ink/40" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md pl-9 pr-3.5 py-2.5 text-sm font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-caption text-ink/70 mb-1">EXPIRES</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2.5 text-sm font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-caption text-ink/70 mb-1">CVC</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2.5 text-sm font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={step === 'submitting'}
                className="btn-primary w-full !py-3.5 text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                {step === 'submitting' ? (
                  <span>Executing Atomic Transaction...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Place Order · ${subtotal.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="text-center font-caption text-xs text-ink/60 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
                <span>256-Bit Encrypted Payment & Atomic Inventory Lock</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
