import React, { useState } from 'react';
import { X, Lock, ArrowLeft, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder, createPaymentIntent } from '../../lib/dataService';
import { ShippingAddress, Order } from '../../types/database';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_publishable_key';
const stripePromise = loadStripe(publishableKey);

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

// Inner Stripe payment form component
function StripePaymentForm({
  paymentIntentId,
  isMock,
  shipping,
  onBack,
  onOrderSuccess,
  setErrorMsg,
}: {
  clientSecret: string;
  paymentIntentId: string;
  isMock: boolean;
  shipping: ShippingAddress;
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
  setErrorMsg: (msg: string) => void;
}) {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [mockCardType, setMockCardType] = useState<'success' | '3ds' | 'decline'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setProcessing(true);

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

      if (!isMock && stripe && elements) {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin,
            payment_method_data: {
              billing_details: {
                name: shipping.fullName,
                address: {
                  line1: shipping.addressLine1,
                  city: shipping.city,
                  state: shipping.state,
                  postal_code: shipping.postalCode,
                  country: shipping.country,
                },
              },
            },
          },
          redirect: 'if_required',
        });

        if (error) {
          throw new Error(error.message || 'Payment authentication failed.');
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          const createdOrder = await createOrder({
            userId: user ? user.id : 'guest-order-user',
            items: itemsPayload,
            shippingAddress: shipping,
            paymentIntentId: paymentIntent.id,
          });

          clearCart();
          onOrderSuccess(createdOrder);
        } else {
          throw new Error(`Payment status: ${paymentIntent?.status || 'unknown'}`);
        }
      } else {
        // Mock test card processing logic
        if (mockCardType === 'decline') {
          throw new Error('Your card was declined. (Test mode card 4000 0000 0000 0002)');
        }
        if (mockCardType === '3ds') {
          // Simulate 3DS authentication success delay
          await new Promise((res) => setTimeout(res, 1200));
        }

        const createdOrder = await createOrder({
          userId: user ? user.id : 'guest-order-user',
          items: itemsPayload,
          shippingAddress: shipping,
          paymentIntentId,
        });

        clearCart();
        onOrderSuccess(createdOrder);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process payment and place order.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary box */}
      <div className="p-4 rounded-lg bg-surface-soft border border-hairline">
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
      <div className="flex items-center gap-2 text-xs font-mono text-ink/70 bg-surface-soft/60 p-3 rounded-md border border-hairline">
        <MapPin className="w-4 h-4 text-ink/40 flex-shrink-0" />
        <span className="truncate">
          Delivering to: {shipping.fullName}, {shipping.addressLine1}, {shipping.city} {shipping.postalCode}
        </span>
      </div>

      {/* Stripe Payment Element or Mock Card Selector */}
      {isMock ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-surface-soft border border-hairline space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-caption text-xs text-ink/70">TEST MODE PAYMENT SIMULATOR</span>
              <span className="font-mono text-[10px] bg-block-lime text-ink px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="font-body-sm text-xs text-ink/60">
              Select a Stripe test card simulation scenario:
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setMockCardType('success')}
                className={`p-2 rounded-md border text-center cursor-pointer transition-all ${
                  mockCardType === 'success'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-canvas text-ink border-hairline hover:bg-surface-soft'
                }`}
              >
                <div>Success</div>
                <div className="text-[10px] opacity-75">4242...</div>
              </button>
              <button
                type="button"
                onClick={() => setMockCardType('3ds')}
                className={`p-2 rounded-md border text-center cursor-pointer transition-all ${
                  mockCardType === '3ds'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-canvas text-ink border-hairline hover:bg-surface-soft'
                }`}
              >
                <div>3D Secure</div>
                <div className="text-[10px] opacity-75">4000...3184</div>
              </button>
              <button
                type="button"
                onClick={() => setMockCardType('decline')}
                className={`p-2 rounded-md border text-center cursor-pointer transition-all ${
                  mockCardType === 'decline'
                    ? 'bg-accent-magenta text-on-primary border-accent-magenta'
                    : 'bg-canvas text-ink border-hairline hover:bg-surface-soft'
                }`}
              >
                <div>Decline</div>
                <div className="text-[10px] opacity-75">4000...0002</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-canvas border border-hairline">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="w-12 h-12 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer border border-hairline flex-shrink-0"
          title="Back to Shipping"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          type="submit"
          disabled={processing}
          className="btn-primary flex-1 !py-3.5 text-base flex items-center justify-center gap-2 cursor-pointer rounded-full"
        >
          {processing ? (
            <span>Executing Atomic Transaction & Payment...</span>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Pay & Place Order · ${subtotal.toFixed(2)}</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center font-caption text-xs text-ink/60 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
        <span>Stripe 256-Bit SSL Encrypted · Atomic PostgreSQL Stock Lock</span>
      </div>
    </form>
  );
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cart, subtotal } = useCart();
  const { profile } = useAuth();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: profile?.shipping_address?.fullName || profile?.full_name || '',
    addressLine1: profile?.shipping_address?.addressLine1 || '',
    addressLine2: profile?.shipping_address?.addressLine2 || '',
    city: profile?.shipping_address?.city || '',
    state: profile?.shipping_address?.state || '',
    postalCode: profile?.shipping_address?.postalCode || '',
    country: profile?.shipping_address?.country || 'United States',
  });

  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isMock, setIsMock] = useState(true);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipping.fullName || !shipping.addressLine1 || !shipping.city || !shipping.postalCode) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }
    setErrorMsg('');
    setLoadingIntent(true);

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

      const res = await createPaymentIntent({
        items: itemsPayload,
        shippingAddress: shipping,
      });

      setClientSecret(res.clientSecret);
      setPaymentIntentId(res.paymentIntentId);
      setIsMock(Boolean(res.isMock));
      setStep('payment');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize secure payment session.');
    } finally {
      setLoadingIntent(false);
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
                className="w-8 h-8 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer border border-hairline"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="font-caption text-xs text-ink/60">ATELIER CHECKOUT PIPELINE</span>
              <h2 className="font-card-title text-xl font-bold text-ink">
                {step === 'shipping' ? '1. Shipping & Delivery' : '2. Stripe Secure Payment'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="w-8 h-8 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer border border-hairline"
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
              step === 'payment' ? 'bg-canvas text-ink font-bold' : 'text-ink/60'
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
          <div className="mx-6 mt-4 p-3 rounded-lg bg-block-pink border border-red-200 text-xs text-ink font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent-magenta flex-shrink-0" />
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
                  disabled={loadingIntent}
                  className="btn-primary !py-2.5 !px-6 text-sm cursor-pointer rounded-full"
                >
                  {loadingIntent ? 'Initializing Stripe...' : 'Continue to Payment →'}
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            isMock ? (
              <StripePaymentForm
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                isMock={true}
                shipping={shipping}
                onBack={() => setStep('shipping')}
                onOrderSuccess={onSuccess}
                setErrorMsg={setErrorMsg}
              />
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'flat',
                    variables: {
                      colorPrimary: '#000000',
                      colorBackground: '#ffffff',
                      colorText: '#000000',
                      borderRadius: '12px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    },
                  },
                }}
              >
                <StripePaymentForm
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId}
                  isMock={false}
                  shipping={shipping}
                  onBack={() => setStep('shipping')}
                  onOrderSuccess={onSuccess}
                  setErrorMsg={setErrorMsg}
                />
              </Elements>
            )
          )}
        </div>
      </div>
    </div>
  );
};
