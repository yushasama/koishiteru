'use client';

import React, { useRef, useEffect, useState } from 'react';
import Panel from './Panel';

interface PanelData {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

interface CarouselProps {
  panels: PanelData[];
}

export default function Carousel({ panels }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();
      
      // Direct scroll for better responsiveness
      el.scrollLeft += e.deltaY * 0.8;
      
      // Hide scroll indicator after first scroll
      if (showScrollIndicator) {
        setShowScrollIndicator(false);
      }
    };

    const onScroll = () => {
      // Hide scroll indicator after any scroll
      if (showScrollIndicator) {
        setShowScrollIndicator(false);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', onScroll);
    
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', onScroll);
    };
  }, [showScrollIndicator]);

  return (
    <div
      ref={containerRef}
      className="
        h-screen w-screen
        overflow-x-scroll overflow-y-hidden
        select-none scrollbar-none
        bg-[#0f0f0f]
        relative
      "
      style={{ 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <div className="flex h-full space-x-[2px] w-max">
        {panels.map((panel, i) => (
          <Panel
            key={i}
            image={panel.image}
            title={panel.title}
            subtitle={panel.subtitle}
            delay={i * 0.8}
            href={panel.link}
          />
        ))}
      </div>
      
      {/* Scroll to Explore Indicator */}
      {showScrollIndicator && (
        <div className="
          absolute bottom-8 left-1/2 transform -translate-x-1/2
          bg-black/80 backdrop-blur-sm
          rounded-full px-6 py-3
          flex items-center space-x-3
          text-white font-medium text-sm
          transition-opacity duration-500
          z-10
        ">
          <span>SCROLL TO EXPLORE</span>
          <span className="text-white animate-pulse">→</span>
        </div>
      )}
    </div>
  );
}