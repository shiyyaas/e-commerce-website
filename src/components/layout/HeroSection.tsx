import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onFeaturedClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onFeaturedClick }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-hairline bg-canvas">
      <div className="max-w-container mx-auto px-4 md:px-8">
        <div className="max-w-4xl">
          {/* Eyebrow marker */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-magenta animate-pulse" />
            <span className="font-eyebrow text-xs md:text-sm text-ink/70">
              ATELIER ARCHITECTURAL OBJECTS · SPRING 2026
            </span>
          </div>

          {/* Display-XL Hero Headline */}
          <h1 className="font-display-xl font-normal text-ink tracking-tight mb-8">
            Honest materials.<br />
            Disciplined tools.<br />
            Pure execution.
          </h1>

          {/* Subhead narrative */}
          <p className="font-subhead text-ink/80 text-lg md:text-2xl max-w-2xl mb-10 leading-relaxed font-light">
            An e-commerce atelier engineered for modern creators. Built on atomic Supabase transactions, real-time inventory synchronization, and Figma's editorial visual discipline.
          </p>

          {/* Pill CTA Pair */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreClick}
              className="btn-primary group cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={onFeaturedClick}
              className="btn-secondary group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-accent-magenta" />
              <span>Studio Picks</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
