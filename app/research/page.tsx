'use client';

import React from 'react';
import Image from 'next/image';
import ResearchSection from '../../components/ResearchSection';
import ReadingSection from '../../components/ReadingSection';
import researchBackground from '../../public/wallpapers/research.jpg';

export default function ReadingList(): React.JSX.Element | null {
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
    }
  ];

  const distrBooks = [
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann' },
  ];

  const systemBooks = [
    { title: 'Systems Performance', author: 'Brendan Gregg' },
    { title: 'Computer Systems: A Programmer’s Perspective', author: 'Randal E. Bryant & David R. O’Hallaron' },
  ];

  return (
    <div className="pt-20 min-h-screen relative overflow-hidden">
      {/* Keep the original image sharp and independent of content height. */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <Image src={researchBackground} alt="" fill priority unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 sm:px-8 py-20 sm:py-24 text-gray-200 font-[Inter] tracking-tight">
        <header className="mb-20 border-l-[5px] border-violet-600/70 pl-6">
          <h1 className="text-5xl sm:text-6xl font-medium text-gray-100 tracking-tight leading-snug">
            Rabbitholes
          </h1>
          <p className="mt-4 text-sm sm:text-base uppercase tracking-[0.25em] text-violet-200/90">
            Things I’m exploring & reading
          </p>
        </header>

        <div className="space-y-8">
          <ResearchSection items={researchItems} />
          <section aria-labelledby="readings-heading" className="space-y-8 pt-8">
            <h2 id="readings-heading" className="text-2xl font-medium text-gray-100">Readings</h2>
            <ReadingSection sectionTitle="Systems & Infrastructure" books={systemBooks} />
            <ReadingSection sectionTitle="Distributed Systems" books={distrBooks} />
          </section>
        </div>
        <footer className="mt-24 text-center text-sm text-gray-500 tracking-wide">
          © {new Date().getFullYear()} Leon Do ・ Rabbitholes
        </footer>
      </div>
    </div>
  );
}
