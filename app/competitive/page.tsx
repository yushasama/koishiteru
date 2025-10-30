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
      id: 'segment_trees_ii',
      title: 'The Return of Segment Trees: Lazy and Beats',
      readingTime: readingTimes.segment_trees_ii,
      backgroundImage: "https://images.unsplash.com/photo-1744708334926-9d27b0c8ca9e"
    },
        {
      id: 'bitmasks',
      title: 'Hardmogging with Bitmasks',
      readingTime: readingTimes.bitmasks,
      backgroundImage: "https://images.unsplash.com/photo-1658931419235-1b8aa5a44829"
    },
    {
      id: 'square_root_decomposition',
      title: 'Square Root Decomposition and Mo\'s Algorithm',
      readingTime: readingTimes.square_root_decomposition,
      backgroundImage: "https://images.unsplash.com/photo-1738463771395-4ca093b19e2c"
    },
    {
      id: 'binary_search',
      title: 'Binary Search: The Boundary Hunter',
      readingTime: readingTimes.binary_search,
      backgroundImage: "https://images.unsplash.com/photo-1541727687969-ce40493cd847"
    },
    {
      id: 'max_flow',
      title: 'Max Flow',
      readingTime: readingTimes.max_flow,
      backgroundImage: 'https://images.unsplash.com/photo-1738463738098-63ec4af1cf89?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'matrix_exponentiation',
      title: 'Matrix Exponentiation',
      readingTime: readingTimes.matrix_exponentiation,
      backgroundImage: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'fenwick_segment_trees',
      title: 'Fenwick & Segment Trees',
      readingTime: readingTimes.fenwick_segment_trees,
      backgroundImage: 'https://images.unsplash.com/photo-1736063618602-85b664d957a4?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'dynamic_programming_subset_sums',
      title: 'Dynamic Programming Subset Sums',
      readingTime: readingTimes.dynamic_programming_subset_sums,
      backgroundImage: 'https://images.unsplash.com/photo-1738463734038-c533b2658a2a?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'prefix_sums',
      title: 'Prefix Sums',
      readingTime: readingTimes.prefix_sums,
      backgroundImage: 'https://images.unsplash.com/photo-1617140237060-d09a58ba8edd?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'interval_math',
      title: 'Interval Math',
      readingTime: readingTimes.interval_math,
      backgroundImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'constraints',
      title: 'Sniffing Out The Algo From Constraints',
      readingTime: readingTimes.constraints,
      backgroundImage: 'https://images.unsplash.com/photo-1561835503-648c2f1169d2?q=80&w=800&auto=format&fit=crop',
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
