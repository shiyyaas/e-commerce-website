import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Product, Order } from './types/database';
import { fetchProducts } from './lib/dataService';
import { TopNav } from './components/layout/TopNav';
import { MarqueeStrip } from './components/layout/MarqueeStrip';
import { HeroSection } from './components/layout/HeroSection';
import { ColorBlockSection } from './components/layout/ColorBlockSection';
import { PromoBanner, Footer } from './components/layout/Footer';
import { ProductCard } from './components/catalog/ProductCard';
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderConfirmationModal } from './components/checkout/OrderConfirmationModal';
import { ArrowUpDown, RefreshCw, Layers } from 'lucide-react';

function Storefront() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & sort states
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc'>('featured');

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const categories = ['All', 'Workspace', 'Hardware', 'Paper & Print', 'Lighting', 'Bags & Carry'];

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        category: activeCategory,
        sortBy,
        searchQuery,
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [activeCategory, sortBy, searchQuery]);

  const handleOrderSuccess = (order: Order) => {
    setCheckoutModalOpen(false);
    setConfirmedOrder(order);
    // Reload products so updated stocks reflect in real-time
    loadCatalog();
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-block-lime selection:text-ink">
      {/* Top Banner & Navigation */}
      <MarqueeStrip onPromoClick={() => setActiveCategory('Hardware')} />
      <TopNav
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenCart={() => {}}
      />

      {/* Hero Section */}
      <HeroSection
        onExploreClick={() => {
          const el = document.getElementById('catalog-anchor');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onFeaturedClick={() => {
          setActiveCategory('All');
          setSortBy('featured');
          const el = document.getElementById('catalog-anchor');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Promotional Lilac Banner from DESIGN.md */}
      <PromoBanner onCtaClick={() => setSelectedProduct(products[1] || products[0])} />

      {/* Main Catalog View */}
      <main id="catalog-anchor" className="max-w-container mx-auto px-4 md:px-8 py-10 w-full flex-1">
        {/* Section Header & Taxonomy */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-ink/60" />
              <span className="font-eyebrow text-xs text-ink/70">CATALOG INDEX</span>
            </div>
            <h2 className="font-display-lg text-3xl md:text-4xl font-normal tracking-tight">
              Curated Instruments
            </h2>
          </div>

          {/* Controls: Price Sort & Realtime Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-soft border border-hairline rounded-pill px-3 py-1.5 text-xs font-mono">
              <ArrowUpDown className="w-3.5 h-3.5 text-ink/60" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-none text-ink font-medium cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical: A-Z</option>
              </select>
            </div>

            <button
              onClick={loadCatalog}
              title="Sync with Supabase"
              className="w-8 h-8 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer transition-colors border border-hairline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Pill Filters (matching pricing-tab-default & pricing-tab-selected from DESIGN.md) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`cursor-pointer whitespace-nowrap text-sm font-medium transition-all ${
                activeCategory === category
                  ? 'pricing-tab-selected'
                  : 'pricing-tab-default'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-80 rounded-lg bg-surface-soft animate-pulse border border-hairline"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="font-card-title text-xl font-bold mb-2">No instruments found</h3>
            <p className="font-body-sm text-ink/60 mb-6">
              Try adjusting your category filters or search query.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="btn-primary !text-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(prod) => setSelectedProduct(prod)}
                onQuickAdd={(prod) => addToCart(prod, 1)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Signature Color Block Sections from DESIGN.md */}
      {/* 1. Lime ground for systems & architecture */}
      <ColorBlockSection
        variant="lime"
        eyebrow="ENGINEERED COHESION"
        headline="A design system grounded in physical reality."
        body="Every object in the Atelier collection shares our strict dimensional grid, tactile switch acoustics, and honest metal finishes. Designed for uninterrupted flow."
        ctaText="Explore Systems"
        ctaAction={() => {
          setActiveCategory('Workspace');
          const el = document.getElementById('catalog-anchor');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Navy ground for Ship Products & Production-ready reliability */}
      <ColorBlockSection
        variant="navy"
        eyebrow="SUPABASE POSTGRESQL ECOSYSTEM"
        headline="Atomic inventory management & hardened RLS."
        body="Order creation uses PostgreSQL atomic transactions to prevent race conditions during peak drop spikes. Row Level Security policies guarantee complete privacy of member data."
        ctaText="View Security Specs"
        ctaAction={() => setAuthModalOpen(true)}
      />

      {/* 3. Coral ground for Studio Hardware */}
      <ColorBlockSection
        variant="coral"
        eyebrow="ANODIZED METALLURGY"
        headline="Solid aluminum chassis. Tactile actuation."
        body="Our monolith hardware series features custom lubricated mechanical switches and high-CRI diffused task lights. Built to outlive standard obsolescence."
        ctaText="Hardware Series"
        ctaAction={() => {
          setActiveCategory('Hardware');
          const el = document.getElementById('catalog-anchor');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Footer */}
      <Footer />

      {/* Modals & Slide-overs */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        onProceedToCheckout={() => setCheckoutModalOpen(true)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onSuccess={handleOrderSuccess}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </AuthProvider>
  );
}
