import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_publishable_key';

export const stripePromise = loadStripe(publishableKey);
