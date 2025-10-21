'use client';

import React from 'react';
import Image from 'next/image';
import { Radiation, Watch } from 'lucide-react';

export interface GridCardData {
  id: string;
  title: string;
  subtitle?: string;
  duration?: string;
  readingTime?: string;
  link?: string;
  backgroundImage?: string;
  isMain?: boolean;
}

interface GridCardProps {
  card: GridCardData;
}

const GridCard: React.FC<GridCardProps> = ({ card }) => {
  if (card.isMain) {
    return (
      <a
        rel='noreferrer' 
        href={card.link} 
        target="_blank" 
        className="group relative flex h-56 flex-col justify-between bg-neutral-950 p-6 md:h-80 md:p-9 overflow-hidden"
      >
        {/* Radioactive Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-green-900/20 to-cyan-900/20 opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-400/10 to-transparent opacity-20 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
        
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-radial from-green-400/30 via-green-300/20 to-transparent rounded-full blur-xl opacity-20 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <h2 className="relative z-10 text-4xl uppercase leading-tight">
          <span className="text-neutral-400 transition-colors duration-500 group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:via-cyan-400 group-hover:to-green-300 group-hover:bg-clip-text group-hover:text-transparent">
            {card.title}
          </span>
          <br />
        </h2>
        <div className="relative z-10 flex items-center gap-1.5 text-xs uppercase text-neutral-400 transition-colors duration-500 group-hover:text-green-300">
          <Radiation className="text-base" size={16} />
          <span>Powered by Scribble</span>
        </div>
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-4 text-2xl text-neutral-400 transition-colors duration-500 group-hover:text-green-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      </a>
    );
  }

  if (!card.link && card.id !== 'main') {
    card.link = '/competitive/' + card.id;
  }

  return (
    <a 
      rel='noreferrer' 
      href={card.link}
      target={card.link?.startsWith('/') ? '_self' : '_blank'}
      className="group relative flex h-56 flex-col justify-end overflow-hidden p-6 transition-colors bg-neutral-950 md:h-80 md:p-9"
    >
      <div className="absolute right-3 top-5 z-10 flex items-center gap-2 text-xs uppercase text-white transition-colors duration-500">
        <span className="font-medium">Reading Time</span>
        <Watch size={16} className="text-white transition-colors duration-500" />
        <span className="font-semibold">{card.readingTime || card.duration}</span>
      </div>
      <h2 className="relative z-10 text-3xl leading-tight transition-transform duration-500 group-hover:-translate-y-3">
        {card.title}
      </h2>
      {card.backgroundImage && (
        <div className="absolute bottom-0 left-0 right-0 top-0 opacity-100 bg-black/100 blur-sm grayscale transition-all group-hover:opacity-40 group-active:scale-105 group-active:opacity-70 group-active:blur-0 group-hover:grayscale-0">
          <Image
            src={card.backgroundImage}
            alt={`${card.title} background`}
            fill
            priority
            quality={100}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      
      {/* Corner borders */}
      <span className="absolute left-[1px] top-[1px] z-10 h-3 w-[1px] origin-top scale-0 bg-blue-400 transition-all duration-500 group-hover:scale-100"></span>
      <span className="absolute left-[1px] top-[1px] z-10 h-[1px] w-3 origin-left scale-0 bg-blue-400 transition-all duration-500 group-hover:scale-100"></span>
      <span className="absolute bottom-[1px] right-[1px] z-10 h-3 w-[1px] origin-bottom scale-0 bg-blue-400 transition-all duration-500 group-hover:scale-100"></span>
      <span className="absolute bottom-[1px] right-[1px] z-10 h-[1px] w-3 origin-right scale-0 bg-blue-400 transition-all duration-500 group-hover:scale-100"></span>
      <span className="absolute bottom-[1px] left-[1px] z-10 h-3 w-[1px] origin-bottom scale-0 bg-blue-400 transition-all duration-500 group-hover:scale-100"></span>
      <span className="absolute bottom-[1px] left-[1px] z-10 h-[1px] w-3 origin-left scale-0 bg-blue-400 transition-all duration-500 group-hover:scale-100"></span>
      <span className="absolute right-[1px] top-[1px] z-10 h-3 w-[1px] origin-top scale-0 bg-blue-400 transition-all duration-500 group-hover:scale-100"></span>
      <span className="absolute right-[1px] top-[1px] z-10 h-[1px] w-3 origin-right scale-0 bg-blue-400 transition-all duration-500 group-hover:scale-100"></span>
    </a>
  );
};

export default GridCard;
