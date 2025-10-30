'use client';

import React from 'react';
import Image from 'next/image';
import ResearchSection from '../../components/ResearchSection';
import ReadingSection from '../../components/ReadingSection';

export default function ReadingList() {
  // Force re-render to fix hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  const researchItems = [
    {
      title: 'Replicating Emotionally Reactive AI Waifus / Husbandos with Linear Algebra',
      subtitle:
        'Using linear algebra to explore how emotionally reactive AI companions might form biases, hold grudges, and recall events through mood-colored memory. For realism, memory recall has a chance to be done at the worst times '
    },
    {
      title: 'Market Making on Prediction Markets',
      subtitle:
        'Exploring how liquidity and crowd behavior influence pricing structure in markets where people bet on what happens next.'
    }
  ];

  const distrBooks = [
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann' },
  ];

  const systemBooks = [
    { title: 'Systems Performance', author: 'Brendan Gregg' },
    { title: 'Effective Modern C++', author: 'Scott Meyers' },
    { title: 'High Performance C++', author: 'Björn Andrist' },
  ];

  return (
    <div className="pt-20 min-h-screen relative overflow-hidden">
      {/* Optimized Next.js background image */}
      <Image
        src="/wallpapers/research.jpg"
        alt="Research background"
        fill
        priority
        quality={100}
        className="object-cover object-center"
        sizes="100vw"
      />
      
      {/* Dim overlay for readability */} 
      <div className="absolute inset-0 bg-black/90 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 sm:px-8 py-20 sm:py-24 text-gray-200 font-[Inter] tracking-tight">
        <header className="mb-20 border-l-[5px] border-violet-600/70 pl-6">
          <h1 className="text-5xl sm:text-6xl font-medium text-gray-100 tracking-tight leading-snug">
            Applied Thought
          </h1>
          <p className="mt-4 text-sm sm:text-base uppercase tracking-[0.25em] text-violet-200/90">
            Ongoing Research & Readings
          </p>
        </header>

        <div className="space-y-20">
          <ResearchSection items={researchItems} />
          <ReadingSection
            sectionTitle="Systems & Infrastructure"
            books={systemBooks}
          />
          <ReadingSection
            sectionTitle="Distributed Systems"
            books={distrBooks}
          />
        </div>
        <footer className="mt-24 text-center text-sm text-gray-500 tracking-wide">
          © {new Date().getFullYear()} Leon Do ・ Applied Thought
        </footer>
      </div>
    </div>
  );
}