import React from 'react';
import GridSection from '../../components/GridSection';
import { GridCardData } from '../../components/GridCard';
import { getAllReadingTimes } from '../../utils/readingTime';

export default function CompetitivePage() {
  const readingTimes = getAllReadingTimes();
  
  const competitiveCards: GridCardData[] = [
    {
      id: 'main',
      title: 'Algorithmic Writeups',
      subtitle: '',
      link: 'https://scribble-ivory.vercel.app/',
      isMain: true,
    },
    {
      id: 'max_flow',
      title: 'Max Flow',
      readingTime: readingTimes.max_flow,
      backgroundImage: 'https://images.unsplash.com/photo-1738463738098-63ec4af1cf89',
    },
    {
      id: 'matrix_exponentiation',
      title: 'Matrix Exponentiation',
      readingTime: readingTimes.matrix_exponentiation,
      backgroundImage: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2379&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 'fenwick_segment_trees',
      title: 'Fenwick & Segment Trees',
      readingTime: readingTimes.fenwick_segment_trees,
      backgroundImage: 'https://images.unsplash.com/photo-1736063618602-85b664d957a4',
    },
    {
      id: 'dynamic_programming_subset_sums',
      title: 'Dynamic Programming Subset Sums',
      readingTime: readingTimes.dynamic_programming_subset_sums,
      backgroundImage: 'https://images.unsplash.com/photo-1738463734038-c533b2658a2a',
    },
    {
      id: 'prefix_sums',
      title: 'Prefix Sums',
      readingTime: readingTimes.prefix_sums,
      backgroundImage: 'https://images.unsplash.com/photo-1617140237060-d09a58ba8edd?',
    },
    {
      id: 'interval_math',
      title: 'Interval Math',
      readingTime: readingTimes.interval_math,
      backgroundImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 'constraints',
      title: 'Sniffing Out The Algo From Constraints',
      readingTime: readingTimes.constraints,
      backgroundImage: 'https://images.unsplash.com/photo-1561835503-648c2f1169d2',
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-nyc bg-no-repeat bg-cover bg-center relative flex flex-col">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs"></div>
      <div className="relative z-10 flex-1">
        <GridSection cards={competitiveCards} title="Competitive Programming" />
      </div>
      <footer className="relative z-10 text-center text-sm text-gray-500 tracking-wide pb-8">
        © {new Date().getFullYear()} Leon Do ・ Competitive Programming
      </footer>
    </div>
  );
}
