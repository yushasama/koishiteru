import React from 'react';
import GridSection from '../../components/GridSection';
import { GridCardData } from '../../components/GridCard';
import { getReadingTime } from '../../utils/readingTime';

export default function CompetitivePage() {
  const competitiveCards: GridCardData[] = [
    {
      id: 'main',
      title: 'Algorithmic Writeups',
      subtitle: '',
      link: 'https://scribble-ivory.vercel.app/',
      isMain: true,
    },
    {
      id: 'graph_connectivity_decomp',
      title: 'Graph Connectivity & Decomposition (CC, SCC, 2-SAT)',
      readingTime: getReadingTime('graph_connectivity_decomp'),
      backgroundImage: 'https://images.unsplash.com/photo-1542382257-80dedb725088?q=80&w=1228&auto=format&fit=crop',
    },
    {
      id: 'geometry_vi',
      title: 'Geometry VI - Advanced Rotations and Tricks',
      readingTime: getReadingTime('geometry_vi'),
      backgroundImage: "https://images.unsplash.com/photo-1607457632731-266db62789fa?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'geometry_v',
      title: 'Geometry V - Circles, Arcs and Tangents',
      readingTime: getReadingTime('geometry_v'),
      backgroundImage: "https://images.unsplash.com/photo-1605478264999-8d1cd66e9c78?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'geometry_iv',
      title: 'Geometry IV - Sweep Line and Closest Pair',
      readingTime: getReadingTime('geometry_iv'),
      backgroundImage: "https://images.unsplash.com/photo-1605478264999-8d1cd66e9c78?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'geometry_iii',
      title: 'Geometry III - Polygons and Convex Hull',
      readingTime: getReadingTime('geometry_iii'),
      backgroundImage: "https://images.unsplash.com/photo-1608501821300-4f99e58bba77?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'geometry_ii',
      title: 'Geometry II - Lines, Cuts, and Orientation',
      readingTime: getReadingTime('geometry_ii'),
      backgroundImage: "https://images.unsplash.com/photo-1606162490200-212b6bb8e371?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'geometry_i',
      title: 'Geometry I - Distance and Movement',
      readingTime: getReadingTime('geometry_i'),
      backgroundImage: "https://images.unsplash.com/photo-1629487015513-7075665af4b9?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'nim_grundy',
      title: 'Game Theory - Nim and Grundy Games',
      readingTime: getReadingTime('nim_grundy'),
      backgroundImage: "https://images.unsplash.com/photo-1721331762508-13fe0743499f?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'greedy_vi',
      title: 'Greedy VI - Advanced & Online',
      readingTime: getReadingTime('greedy_vi'),
      backgroundImage: "https://images.unsplash.com/photo-1626553684728-ac5f563eefe7?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'greedy_v',
      title: 'Greedy V - Game & Competitive',
      readingTime: getReadingTime('greedy_v'),
      backgroundImage: "https://images.unsplash.com/photo-1642196010468-f609122899d4?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'greedy_iv',
      title: 'Greedy IV - Threshold Feasibility',
      readingTime: getReadingTime('greedy_iv'),
      backgroundImage: "https://images.unsplash.com/photo-1668162456452-11e6ca7c8608?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'greedy_iii',
      title: 'Greedy III - Incremental',
      readingTime: getReadingTime('greedy_iii'),
      backgroundImage: "https://images.unsplash.com/photo-1751317104165-7b2bcc33a41d?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'greedy_ii',
      title: 'Greedy II - Interval',
      readingTime: getReadingTime('greedy_ii'),
      backgroundImage: "https://images.unsplash.com/photo-1751317109192-1e2e893d7837?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'greedy_i',
      title: 'Greedy I - Selection',
      readingTime: getReadingTime('greedy_i'),
      backgroundImage: "https://images.unsplash.com/photo-1751317080054-fe0961b3f2a6?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'segment_trees_ii',
      title: 'Segment Trees II - Lazy and Beats',
      readingTime: getReadingTime('segment_trees_ii'),
      backgroundImage: "https://images.unsplash.com/photo-1744708334926-9d27b0c8ca9e?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'bitmasks',
      title: 'Hardmogging with Bitmasks',
      readingTime: getReadingTime('bitmasks'),
      backgroundImage: "https://images.unsplash.com/photo-1658931419235-1b8aa5a44829?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'square_root_decomposition',
      title: 'Square Root Decomposition and Mo\'s Algorithm',
      readingTime: getReadingTime('square_root_decomposition'),
      backgroundImage: "https://images.unsplash.com/photo-1738463771395-4ca093b19e2c?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'binary_search',
      title: 'Binary Search: The Boundary Hunter',
      readingTime: getReadingTime('binary_search'),
      backgroundImage: "https://images.unsplash.com/photo-1541727687969-ce40493cd847?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 'max_flow',
      title: 'Max Flow',
      readingTime: getReadingTime('max_flow'),
      backgroundImage: 'https://images.unsplash.com/photo-1738463738098-63ec4af1cf89?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'matrix_exponentiation',
      title: 'Matrix Exponentiation',
      readingTime: getReadingTime('matrix_exponentiation'),
      backgroundImage: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'fenwick_segment_trees',
      title: 'Fenwick & Segment Trees',
      readingTime: getReadingTime('fenwick_segment_trees'),
      backgroundImage: 'https://images.unsplash.com/photo-1736063618602-85b664d957a4?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'dynamic_programming_subset_sums',
      title: 'Dynamic Programming Subset Sums',
      readingTime: getReadingTime('dynamic_programming_subset_sums'),
      backgroundImage: 'https://images.unsplash.com/photo-1738463734038-c533b2658a2a?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'prefix_sums',
      title: 'Prefix Sums',
      readingTime: getReadingTime('prefix_sums'),
      backgroundImage: 'https://images.unsplash.com/photo-1617140237060-d09a58ba8edd?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'interval_math',
      title: 'Interval Math',
      readingTime: getReadingTime('interval_math'),
      backgroundImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'constraints',
      title: 'Sniffing Out The Algo From Constraints',
      readingTime: getReadingTime('constraints'),
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
