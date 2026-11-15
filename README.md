# Atelier E-Commerce Platform

A production-grade, full-stack e-commerce storefront engineered to bridge high-end editorial design (inspired by Figma's design system) with robust backend architecture (Supabase PostgreSQL, Row Level Security, atomic RPC transactions, and full-stack Stripe Test Mode checkout).

## Environment Variables

Copy `.env.example` to `.env` and configure your keys:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Scripts

- `npm run dev` — Start Vite development server
- `npm run build` — Type check and build for production
- `npm run preview` — Preview production build

## Stripe & Supabase Edge Functions

To deploy the payment intent Edge Function:
```bash
supabase functions deploy create-payment-intent
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```
