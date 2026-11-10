import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MarqueeStripProps {
  onPromoClick?: () => void;
}

export const MarqueeStrip: React.FC<MarqueeStripProps> = ({ onPromoClick }) => {
  const announcements = [
    '✦ EDITION 04 IS LIVE — ARCHITECTURAL DESK OBJECTS IN STOCK',
    '· FREE GLOBAL EXPEDITED DISPATCH OVER $150',
    '✦ CRAFTED WITH HONEST MATERIALS: SOLID ANODIZED ALUMINUM & MERINO WOOL',
    '· ATELIER MEMBERS GET REAL-TIME INVENTORY RESERVATION',
  ];

  return (
    <div className="bg-inverse-canvas text-inverse-ink h-9 flex items-center overflow-hidden border-b border-hairline font-caption select-none">
      <div className="flex whitespace-nowrap animate-marquee items-center text-xs tracking-wider">
        {[...announcements, ...announcements, ...announcements].map((text, idx) => (
          <span key={idx} className="mx-6 flex items-center gap-2">
            <span>{text}</span>
          </span>
        ))}
      </div>
      {onPromoClick && (
        <button
          onClick={onPromoClick}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-[11px] font-mono mr-4 tracking-normal transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-block-lime" />
          <span>Release Notes</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
};
