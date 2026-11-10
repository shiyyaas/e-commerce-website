import React from 'react';
import { Product } from '../../types/database';
import { Plus, Check, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onQuickAdd }) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const getBadgeColor = () => {
    switch (product.badge_color) {
      case 'lime':
        return 'bg-block-lime text-ink';
      case 'lilac':
        return 'bg-block-lilac text-ink';
      case 'mint':
        return 'bg-block-mint text-ink';
      case 'coral':
        return 'bg-block-coral text-ink';
      case 'pink':
        return 'bg-block-pink text-ink';
      case 'navy':
        return 'bg-block-navy text-inverse-ink';
      default:
        return 'bg-block-cream text-ink';
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-canvas border border-hairline hover:border-ink rounded-lg p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer relative"
    >
      {/* Top Media Tile */}
      <div>
        <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-surface-soft mb-4 flex items-center justify-center">
          <img
            src={product.image_urls[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
          />

          {/* Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className={`font-caption px-2 py-0.5 rounded-pill text-[11px] font-medium tracking-wider uppercase ${getBadgeColor()}`}
            >
              {product.category}
            </span>
          </div>

          {/* Quick Add Pill Icon on hover */}
          {!isOutOfStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product);
              }}
              title="Quick Add to Cart"
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-canvas/90 hover:bg-primary hover:text-on-primary text-ink border border-hairline flex items-center justify-center shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Title & Description */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-card-title text-base md:text-lg font-bold tracking-tight text-ink group-hover:text-ink/80 transition-colors line-clamp-1">
            {product.title}
          </h3>
          <span className="font-mono text-base font-semibold text-ink whitespace-nowrap">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <p className="font-body-sm text-sm text-ink/70 line-clamp-2 mb-4 leading-snug">
          {product.description}
        </p>
      </div>

      {/* Footer Meta: Stock status and Specs teaser */}
      <div className="pt-3 border-t border-hairline-soft flex items-center justify-between text-xs font-mono">
        {isOutOfStock ? (
          <span className="text-accent-magenta flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            OUT OF STOCK
          </span>
        ) : isLowStock ? (
          <span className="text-amber-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            ONLY {product.stock} LEFT
          </span>
        ) : (
          <span className="text-semantic-success flex items-center gap-1 font-medium">
            <Check className="w-3.5 h-3.5" />
            IN STOCK ({product.stock})
          </span>
        )}

        <span className="text-ink/50 group-hover:text-ink transition-colors font-sans text-xs font-medium">
          View Details →
        </span>
      </div>
    </div>
  );
};
