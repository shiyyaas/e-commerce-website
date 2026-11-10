import React, { useState } from 'react';
import { Product } from '../../types/database';
import { X, Check, ShoppingBag, ShieldCheck, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedQty);
    setIsAdded(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative bg-canvas w-full max-w-4xl rounded-lg border border-hairline overflow-hidden shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with close */}
        <div className="flex items-center justify-between p-4 md:px-8 border-b border-hairline bg-surface-soft/40">
          <div className="flex items-center gap-2 font-mono text-xs text-ink/70">
            <span>COLLECTION</span>
            <span>/</span>
            <span className="uppercase text-ink font-semibold">{product.category}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close product details"
            className="w-8 h-8 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-8 gap-8">
          {/* Gallery View */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/3] rounded-md bg-surface-soft overflow-hidden border border-hairline flex items-center justify-center">
              <img
                src={product.image_urls[activeImageIndex] || product.image_urls[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.image_urls.length > 1 && (
              <div className="flex gap-2">
                {product.image_urls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden border cursor-pointer ${
                      activeImageIndex === idx ? 'border-primary ring-1 ring-primary' : 'border-hairline'
                    }`}
                  >
                    <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Purchase Controls */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2 className="font-card-title text-2xl font-bold tracking-tight text-ink">
                  {product.title}
                </h2>
                <span className="font-mono text-2xl font-semibold text-ink">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Real-time stock status badge */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-block-pink text-ink text-xs font-mono font-medium">
                    <span className="w-2 h-2 rounded-full bg-accent-magenta" />
                    Currently Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-block-lime text-ink text-xs font-mono font-medium">
                    <span className="w-2 h-2 rounded-full bg-semantic-success" />
                    Supabase Live Stock: {product.stock} available
                  </span>
                )}
              </div>

              <p className="font-body text-base text-ink/80 leading-relaxed mb-6 font-light">
                {product.description}
              </p>

              {/* Technical Specifications */}
              <div className="border-t border-b border-hairline py-4 mb-6">
                <span className="font-caption text-xs text-ink/60 mb-2 block tracking-wider">
                  SPECIFICATIONS & ATTRIBUTES
                </span>
                <div className="grid grid-cols-2 gap-y-2 text-xs font-mono">
                  {Object.entries(product.attributes).map(([key, val]) => (
                    <div key={key} className="flex flex-col">
                      <span className="uppercase text-ink/50">{key}:</span>
                      <span className="text-ink font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-hairline rounded-pill px-2 py-1 bg-surface-soft">
                  <button
                    disabled={selectedQty <= 1 || isOutOfStock}
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-canvas disabled:opacity-30 cursor-pointer text-ink"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-sm px-4 min-w-[32px] text-center font-bold">
                    {selectedQty}
                  </span>
                  <button
                    disabled={selectedQty >= product.stock || isOutOfStock}
                    onClick={() => setSelectedQty((q) => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-canvas disabled:opacity-30 cursor-pointer text-ink"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 !py-3 !text-base cursor-pointer disabled:opacity-40"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-block-lime" />
                      <span>Added to Studio Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart · ${(product.price * selectedQty).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-caption text-ink/60">
                <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
                <span>Protected by Supabase Row Level Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
