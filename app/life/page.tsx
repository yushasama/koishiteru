'use client';

import React, { useEffect, useRef, useState } from 'react';
import { lifeSections } from '../../data/lifeSections';

const LifePage = () => {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const imageContainer = imageContainerRef.current;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      
      // Calculate the opposite scroll position for images
      if (imageContainer) {
        const scrollProgress = scrollTop / (document.documentElement.scrollHeight - window.innerHeight);
        const imageScrollDistance = scrollProgress * (window.innerHeight * lifeSections.length * 3);
        imageContainer.style.transform = `translateY(-${imageScrollDistance}px)`;
      }
      
      // Hide scroll hint after first scroll
      if (scrollTop > 10) {
        setShowScrollHint(false);
      }
    };

    // Handle wheel events for snap scrolling
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return;
      
      // Only handle vertical scrolling
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      
      e.preventDefault();
      
      const sectionHeight = window.innerHeight;
      const currentScroll = window.scrollY;
      const currentSectionIndex = Math.round(currentScroll / sectionHeight);
      
      let targetSection = currentSectionIndex;
      
      if (e.deltaY > 0 && currentSectionIndex < lifeSections.length - 1) {
        targetSection = currentSectionIndex + 1;
      } else if (e.deltaY < 0 && currentSectionIndex > 0) {
        targetSection = currentSectionIndex - 1;
      } else {
        return; // Don't scroll if already at the boundary
      }
      
      const targetScroll = targetSection * sectionHeight;
      
      setIsScrolling(true);
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
      
      // Reset scrolling state after animation
      setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [isScrolling]);



  return (
    <div className="">
      {/* Scroll to Explore Indicator */}
      {showScrollHint && (
        <div className="
          fixed bottom-8 left-1/2 transform -translate-x-1/2
          bg-black/80 backdrop-blur-sm
          rounded-full px-6 py-3
          flex items-center space-x-3
          text-white font-medium text-sm
          transition-opacity duration-500
          z-10
        ">
          <span>SCROLL TO EXPLORE</span>
          <span className="text-white animate-pulse">↓</span>
        </div>
      )}

      <section className="flex bg-black text-white">
        <div className="w-full">
          {lifeSections.map((section, index) => {
            const isEven = index % 2 === 0;
            const bgColor = isEven ? "bg-black text-white" : "bg-white text-black";
            
            return (
              <div 
                key={index}
                className={`p-8 h-screen flex flex-col justify-center items-start ${bgColor}`}
              >
                <div className="max-w-2xl">
                  <h3 className="text-5xl md:text-6xl font-light tracking-wide mb-4">{section.header}</h3>
                  <h4 className="text-xl md:text-2xl font-light text-gray-400 mb-6">{section.subtitle}</h4>
                  <p className="font-light text-xl md:text-2xl leading-relaxed">{section.mainText}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Sticky Image Container */}
        <div className="h-screen overflow-hidden sticky top-0 w-24 md:w-full">
          <div 
            ref={imageContainerRef}
            className="absolute left-0 right-0"
            style={{ top: '-300vh' }}
          >
            {lifeSections.map((section, index) => (
              <img
                key={index}
                alt={section.header}
                className="h-screen w-full object-cover"
                src={section.imageSource}
                loading="eager"
                onError={(e) => {
                  console.error(`Failed to load image: ${section.imageSource}`);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log(`Successfully loaded image: ${section.imageSource}`);
                }}
                style={{ display: 'block' }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LifePage;
