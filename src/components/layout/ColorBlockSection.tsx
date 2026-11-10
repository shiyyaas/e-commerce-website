import React from 'react';
import { ColorBlockVariant } from '../../types/database';
import { ArrowUpRight } from 'lucide-react';

interface ColorBlockSectionProps {
  variant: ColorBlockVariant;
  eyebrow: string;
  headline: string;
  body: string;
  ctaText?: string;
  ctaAction?: () => void;
  pillColor?: 'primary' | 'magenta' | 'secondary';
  illustrationContent?: React.ReactNode;
}

export const ColorBlockSection: React.FC<ColorBlockSectionProps> = ({
  variant,
  eyebrow,
  headline,
  body,
  ctaText,
  ctaAction,
  pillColor = 'primary',
  illustrationContent,
}) => {
  const getBgClass = () => {
    switch (variant) {
      case 'lime':
        return 'bg-block-lime text-ink';
      case 'lilac':
        return 'bg-block-lilac text-ink';
      case 'cream':
        return 'bg-block-cream text-ink';
      case 'mint':
        return 'bg-block-mint text-ink';
      case 'pink':
        return 'bg-block-pink text-ink';
      case 'coral':
        return 'bg-block-coral text-ink';
      case 'navy':
        return 'bg-block-navy text-inverse-ink';
      default:
        return 'bg-block-lime text-ink';
    }
  };

  const isDark = variant === 'navy';

  return (
    <div className="max-w-container mx-auto px-0 md:px-8 my-12 md:my-20">
      <div
        className={`${getBgClass()} rounded-none md:rounded-lg p-8 md:p-12 transition-all relative overflow-hidden`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <span
              className={`font-eyebrow text-xs md:text-sm tracking-widest mb-4 uppercase ${
                isDark ? 'text-inverse-ink/70' : 'text-ink/70'
              }`}
            >
              {eyebrow}
            </span>

            <h2 className="font-display-lg text-3xl md:text-5xl font-medium tracking-tight mb-6">
              {headline}
            </h2>

            <p
              className={`font-subhead text-base md:text-xl leading-relaxed mb-8 max-w-xl font-light ${
                isDark ? 'text-inverse-ink/90' : 'text-ink/80'
              }`}
            >
              {body}
            </p>

            {ctaText && (
              <button
                onClick={ctaAction}
                className={`cursor-pointer ${
                  pillColor === 'magenta'
                    ? 'btn-magenta-promo'
                    : isDark
                    ? 'bg-canvas text-ink hover:bg-surface-soft font-button rounded-pill py-2.5 px-6 inline-flex items-center gap-2 font-medium'
                    : 'btn-primary'
                }`}
              >
                <span>{ctaText}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Graphical/Illustration Slot */}
          <div className="lg:col-span-5 flex justify-center items-center">
            {illustrationContent || (
              <div
                className={`w-full max-w-sm rounded-md p-6 border ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-inverse-ink'
                    : 'bg-white/70 border-black/10 text-ink shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-current/10 mb-4">
                  <span className="font-caption text-xs">SYSTEMS ARCHITECTURE</span>
                  <span className="font-mono text-xs">RLS ENFORCED</span>
                </div>
                <div className="space-y-2 font-mono text-xs opacity-80">
                  <div className="flex justify-between">
                    <span>DATABASE:</span>
                    <span>PostgreSQL 15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SECURITY:</span>
                    <span>Row Level Security (RLS)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TRANSACTIONS:</span>
                    <span>Atomic RPC Procedures</span>
                  </div>
                  <div className="flex justify-between">
                    <span>INVENTORY:</span>
                    <span>Real-time Locked Stock</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
