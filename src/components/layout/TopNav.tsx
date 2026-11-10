import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Menu, X, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface TopNavProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenCart: () => void;
  onSelectCategory: (category: string) => void;
  activeCategory: string;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenAuth,
  onOpenProfile,
  onOpenCart,
  onSelectCategory,
  activeCategory,
  onSearchChange,
  searchQuery,
}) => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const categories = ['All', 'Workspace', 'Hardware', 'Paper & Print', 'Lighting', 'Bags & Carry'];

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-hairline h-14 flex items-center transition-all">
      <div className="max-w-container w-full mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onSelectCategory('All')}
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-mono text-sm group-hover:scale-105 transition-transform">
              ✦
            </div>
            <span className="font-card-title tracking-tight text-xl font-bold uppercase">
              ATELIER
            </span>
          </button>

          {/* Desktop Categories */}
          <nav className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-pill text-sm font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary'
                    : 'text-ink/80 hover:text-ink hover:bg-surface-soft'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        {/* Center/Right: Search, Actions, CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Toggle / Input */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <div className="flex items-center bg-surface-soft rounded-pill px-3 py-1 border border-hairline w-40 sm:w-64 transition-all">
                <Search className="w-4 h-4 text-ink/50 mr-2" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full font-sans placeholder:text-ink/40"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    onSearchChange('');
                  }}
                  className="text-ink/50 hover:text-ink ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="w-10 h-10 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cart Pill */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping Cart"
            className="btn-secondary !py-2 !px-3.5 sm:!px-4 !text-sm flex items-center gap-2 cursor-pointer relative"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline font-mono font-medium">Cart</span>
            {totalItems > 0 && (
              <span className="bg-primary text-on-primary text-xs font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center ml-0.5 animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Auth State Button */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="btn-primary !py-2 !px-3.5 sm:!px-4 !text-sm flex items-center gap-2 cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-block-lime" />
              <span className="hidden sm:inline font-mono text-xs">
                {user.user_metadata?.full_name?.split(' ')[0] || 'Studio'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-primary !py-2 !px-4 !text-sm cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden w-10 h-10 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer ml-1"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 bg-canvas border-b border-hairline p-6 shadow-xl z-50 flex flex-col gap-4">
          <div className="font-eyebrow text-xs text-ink/50 pb-2 border-b border-hairline">
            Filter by Department
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-pill text-sm font-medium ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-soft text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-hairline flex items-center justify-between">
            <span className="font-caption text-ink/60 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-semantic-success" />
              Supabase Authenticated Store
            </span>
            {user ? (
              <button
                onClick={() => {
                  onOpenProfile();
                  setMobileMenuOpen(false);
                }}
                className="btn-secondary !py-1.5 !px-3 text-xs"
              >
                View Account
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="btn-primary !py-1.5 !px-3 text-xs"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
