'use client';

import React from 'react';
import Panel from './Panel';

interface PanelData {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

interface MobileCarouselProps {
  panels: PanelData[];
}

export default function MobileCarousel({ panels }: MobileCarouselProps) {
  return (
    <div
      className="
        h-screen w-screen
        overflow-y-scroll overflow-x-hidden
        select-none scrollbar-none
        bg-[#0f0f0f]
        relative
      "
      style={{ 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <div className="flex flex-col">
        {panels.map((panel, i) => (
          <div key={i} className="mb-0.5 last:mb-0">
            <Panel
              image={panel.image}
              title={panel.title}
              subtitle={panel.subtitle}
              delay={i * 0.8}
              href={panel.link}
              isMobile={true}
            />
          </div>
        ))}
        {/* Extra space to create cut-off effect - shows there's more content */}
        <div className="h-[25vh] bg-[#0f0f0f]" />
      </div>
    </div>
  );
}
