'use client';
import React, { useRef, useEffect, useState } from 'react';
import { lifeSections } from '../../data/lifeSections';
import Image from 'next/image';

const LifePage = () => {
  const leftRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    const handleReady = () => {
      const left = leftRef.current;
      if (left) {
        left.scrollTo({ top: 0, behavior: 'smooth' });
        left.click();
        left.focus();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleReady);
      return () => document.removeEventListener('DOMContentLoaded', handleReady);
    } else {
      handleReady();
    }
  }, []);

  useEffect(() => {
    const left = leftRef.current;
    if (!left) return;

    const handleScroll = () => {
      const scrollTop = left.scrollTop;
      const sectionHeight = left.clientHeight;
      const progress = scrollTop / sectionHeight;
      const direction = scrollTop > lastScrollTopRef.current ? 'down' : 'up';
      lastScrollTopRef.current = scrollTop;

      setScrollProgress(progress);
      if (scrollTop > 30) setShowScrollIndicator(false);

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const thresholdDown = isMobile ? 0.08 : 0.3;
        const thresholdUp = isMobile ? 0.12 : 0.3;

        let idx = activeIndex;
        if (direction === 'down' && progress > activeIndex + thresholdDown) {
          idx = Math.min(lifeSections.length - 1, activeIndex + 1);
        } else if (direction === 'up' && progress < activeIndex - thresholdUp) {
          idx = Math.max(0, activeIndex - 1);
        } else if (!isMobile) {
          // Desktop: snap back to current section if threshold not met
          idx = activeIndex;
        }

        if (idx !== activeIndex) {
          setActiveIndex(idx);
          left.scrollTo({
            top: idx * sectionHeight,
            behavior: 'smooth',
          });
        } else if (!isMobile) {
          // Desktop: snap back to current section
          left.scrollTo({
            top: activeIndex * sectionHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
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
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-500">
          <div className="bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-3 text-white font-medium text-sm animate-bounce">
            <span>SCROLL TO EXPLORE</span>
            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        role="region"
        aria-label="Life sections scrollable area"
      >
        {lifeSections.map((s, i) => {
          const isEven = (i + 1) % 2 === 0;
          const cardColors = isEven ? 'bg-white text-black' : 'bg-black text-white';
          const subColor = isEven ? 'text-gray-700' : 'text-gray-300';
          const bodyColor = isEven ? 'text-gray-800' : 'text-gray-200';

          return (
            <section
              key={i}
              className={`h-screen flex flex-col justify-center px-12 transition-opacity duration-400 ease-out ${cardColors}`}
            >
              {/* Mobile polaroid layout */}
              <div className="lg:hidden mb-4 sm:mb-6 relative max-w-sm mx-auto">
                <div
                  className={`relative bg-white p-3 sm:p-4 pb-4 sm:pb-6 shadow-lg transition-transform duration-500 hover:scale-[1.02] ${
                    i === 0 ? 'rotate-[1deg]' :
                    i === 1 ? 'rotate-[-2deg]' :
                    i === 2 ? 'rotate-[3deg]' :
                    i === 3 ? 'rotate-[-1deg]' :
                    i === 4 ? 'rotate-[2deg]' :
                    'rotate-[-3deg]'
                  }`}
                  >
                  <Image
                    src={s.imageSource}
                    alt={s.header}
                    width={1000}
                    height={700}
                    className="w-full aspect-square object-cover rounded"
                    priority={i < 2}
                    quality={90}
                  />

                  <div className="mt-3 text-center text-xs sm:text-sm text-black font-medium leading-tight">
                    {s.header}
                  </div>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden lg:block">
                <h2 className="text-5xl font-light mb-4">{s.header}</h2>
                <h3 className={`text-2xl mb-6 ${subColor}`}>{s.subtitle}</h3>
                <p className={`text-lg leading-relaxed ${bodyColor}`}>{s.mainText}</p>
              </div>

              {/* Mobile journal block */}
              <div className="lg:hidden p-6 sm:p-8">
                <h2 className="text-3xl sm:text-4xl font-light mb-4">{s.header}</h2>
                <h3 className={`text-lg sm:text-xl mb-6 ${subColor}`}>{s.subtitle}</h3>
                <p className={`text-sm sm:text-base leading-relaxed ${bodyColor}`}>
                  {s.mainText}
                </p>
              </div>
            </section>
          );
        })}
      </div>

      {/* RIGHT SIDE (hidden on mobile) */}
      <div className="hidden lg:block relative w-1/2 h-screen overflow-hidden bg-black">
        {lifeSections.map((s, i) => {
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
