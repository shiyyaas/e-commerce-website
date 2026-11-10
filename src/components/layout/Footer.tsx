import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface PromoBannerProps {
  onCtaClick?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onCtaClick }) => {
  return (
    <div className="max-w-container mx-auto px-4 md:px-8 my-8">
      <div className="bg-block-lilac text-ink rounded-md p-4 md:px-6 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-hairline">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-accent-magenta" />
          </div>
          <div>
            <h4 className="font-card-title text-sm md:text-base font-bold">
              Release Notes 2026.04 · Modular Anodized Collection
            </h4>
            <p className="font-body-sm text-xs text-ink/75">
              Strict limit of 2 units per member. Every batch is stamped with its serial index.
            </p>
          </div>
        </div>

        <button
          onClick={onCtaClick}
          className="btn-magenta-promo !py-2 !px-4 text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <span>Claim Allocation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-canvas border-t border-hairline pt-16 pb-12 mt-24">
      <div className="max-w-container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary font-mono text-xs">
                ✦
              </div>
              <span className="font-card-title text-xl font-bold uppercase tracking-tight">
                ATELIER
              </span>
            </div>
            <p className="font-body-sm text-sm text-ink/70 max-w-sm mb-6 leading-relaxed">
              Architectural workspace objects and high-fidelity computing accessories designed for modern creators. Built with Supabase & Figma's design language.
            </p>
            <div className="flex items-center gap-2 font-mono text-xs text-ink/60">
              <ShieldCheck className="w-4 h-4 text-semantic-success" />
              <span>SOC2 Type II & Supabase RLS Protected</span>
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h5 className="font-caption text-xs text-ink/60 mb-4 tracking-wider">CATALOG</h5>
            <ul className="space-y-2.5 font-sans text-sm text-ink/80">
              <li><a href="#workspace" className="hover:text-ink transition-colors">Workspace Pads</a></li>
              <li><a href="#keyboards" className="hover:text-ink transition-colors">Mechanical Keyboards</a></li>
              <li><a href="#stationery" className="hover:text-ink transition-colors">Swiss Grid Paper</a></li>
              <li><a href="#lighting" className="hover:text-ink transition-colors">Angle Task Lamps</a></li>
              <li><a href="#carry" className="hover:text-ink transition-colors">Canvas Bags</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h5 className="font-caption text-xs text-ink/60 mb-4 tracking-wider">ARCHITECTURE</h5>
            <ul className="space-y-2.5 font-sans text-sm text-ink/80">
              <li><span className="text-ink/60">Supabase Auth</span></li>
              <li><span className="text-ink/60">PostgreSQL RLS</span></li>
              <li><span className="text-ink/60">Atomic RPC Pipeline</span></li>
              <li><span className="text-ink/60">Real-time Stock Lock</span></li>
              <li><span className="text-ink/60">DESIGN.md Specs</span></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h5 className="font-caption text-xs text-ink/60 mb-4 tracking-wider">STUDIO</h5>
            <ul className="space-y-2.5 font-sans text-sm text-ink/80">
              <li><span className="text-ink/60">Release Notes</span></li>
              <li><span className="text-ink/60">Material Index</span></li>
              <li><span className="text-ink/60">Sustainability</span></li>
              <li><span className="text-ink/60">Press Kit</span></li>
              <li><span className="text-ink/60">Contact Dispatch</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-hairline-soft flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-caption text-ink/60">
          <div className="flex items-center gap-2">
            <span>© 2026 ATELIER DESIGN INC. ALL RIGHTS RESERVED.</span>
          </div>
          <div className="flex items-center gap-6">
            <span>TERMS OF SALE</span>
            <span>PRIVACY NOTICE</span>
            <span>RLS VERIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
