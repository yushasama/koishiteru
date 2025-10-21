'use client';
import React, { useRef, useEffect, useState } from 'react';
import { lifeSections } from '../../data/lifeSections';
import Image from 'next/image';


const LifePage = () => {
  const leftRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // prevent transition flicker on initial mount
    const timer = setTimeout(() => setMounted(true), 100);
    
     // Auto-scroll to first section on mount and focus
     const left = leftRef.current;
     if (left) {
       left.scrollTo({ top: 0, behavior: 'smooth' });
       left.focus();
     }
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const left = leftRef.current;
    if (!left) return;

    const handleScroll = () => {
      const scrollTop = left.scrollTop;
      const sectionHeight = left.clientHeight;
      const fullProgress = scrollTop / sectionHeight;
      setScrollProgress(fullProgress);

      // Hide scroll indicator after first scroll
      if (scrollTop > 50) {
        setShowScrollIndicator(false);
      }

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        const idx = Math.round(fullProgress);
        const clamped = Math.max(0, Math.min(lifeSections.length - 1, idx));
        if (clamped !== activeIndex) setActiveIndex(clamped);

        left.scrollTo({
          top: clamped * sectionHeight,
          behavior: 'smooth',
        });
      }, 150);
    };

    left.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      left.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [activeIndex]);

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      {/* Scroll indicator */}
      {showScrollIndicator && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 lg:hidden transition-opacity duration-500">
          <div className="flex flex-col items-center text-white/60 animate-bounce">
            <div className="text-xs mb-1">Scroll</div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}

      {/* LEFT SIDE */}
       <div
         ref={leftRef}
         className="w-full lg:w-1/2 h-screen overflow-y-scroll scrollbar-hide focus:outline-none"
         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
         tabIndex={0}
       >

      {lifeSections.map((s, i) => {
        const isEven = (i + 1) % 2 === 0;

        const fade = mounted
          ? i === activeIndex
            ? 'opacity-100'
            : 'opacity-0'
          : i === 0
          ? 'opacity-100'
          : 'opacity-0';

        const cardColors = isEven ? 'bg-white text-black' : 'bg-black text-white';
        const subColor = isEven ? 'text-gray-700' : 'text-gray-300';
        const bodyColor = isEven ? 'text-gray-800' : 'text-gray-200';

        return (
          <section
            key={i}
            className={`h-screen flex flex-col justify-center px-12 transition-opacity duration-400 ease-out ${fade} ${cardColors}`}
          >
            {/* Mobile polaroid layout */}
            <div className="lg:hidden mb-4 sm:mb-6 relative max-w-lg sm:max-w-xl mx-auto">
              {/* Polaroid with alternating rotations */}
              <div className={`relative bg-white p-3 sm:p-4 pb-10 sm:pb-12 shadow-lg transition-transform duration-500 hover:scale-[1.02] ${
                i === 0 ? 'rotate-[1deg]' :
                i === 1 ? 'rotate-[-2deg]' :
                i === 2 ? 'rotate-[3deg]' :
                i === 3 ? 'rotate-[-1deg]' :
                i === 4 ? 'rotate-[2deg]' :
                'rotate-[-3deg]'
              }`}>
                <Image
                  src={s.imageSource}
                  alt={s.header}
                  width={1000}
                  height={700}
                  className="w-full aspect-square object-cover"
                  priority={i < 2}
                  quality={90}
                />
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-center text-xs sm:text-sm text-black font-medium leading-tight px-1">
                  {s.header}
                </div>
              </div>
            </div>

            {/* Desktop layout - original */}
            <div className="hidden lg:block">
              <h2 className="text-5xl font-light mb-4">{s.header}</h2>
              <h3 className={`text-2xl mb-6 ${subColor}`}>{s.subtitle}</h3>
              <p className={`text-lg leading-relaxed ${bodyColor}`}>{s.mainText}</p>
            </div>

            {/* Mobile journal card block */}
            <div className="lg:hidden p-6 sm:p-8">
              <h2 className="text-4xl sm:text-5xl font-light mb-4">{s.header}</h2>
              <h3 className={`text-xl sm:text-2xl mb-6 ${subColor}`}>{s.subtitle}</h3>
              <p className={`text-base sm:text-lg leading-relaxed ${bodyColor}`}>
                {s.mainText}
              </p>
            </div>
          </section>
        );
      })}

      </div>

      {/* RIGHT SIDE — vertical image scroll (hidden on mobile) */}
      <div className="hidden lg:block relative w-1/2 h-screen overflow-hidden bg-black">
        {lifeSections.map((s, i) => {
          // Inverted translation - scrolls opposite direction
          const translateY = (scrollProgress - i) * 100;
          return (
            <div
              key={i}
              className="absolute inset-0 will-change-transform"
              style={{
                transform: `translateY(${translateY}%)`,
                zIndex: i === activeIndex ? 10 : 0,
                transition: 'none',
              }}
            >
            <Image
              src={s.imageSource}
              alt={s.header}
              fill
              sizes="50vw"
              priority={i === activeIndex}
              className="object-cover"
            />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LifePage;