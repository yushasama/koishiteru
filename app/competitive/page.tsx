'use client';

import React from 'react';
import GridSection from '../../components/GridSection';
import { GridCardData } from '../../components/GridCard';

const competitiveCards: GridCardData[] = [
  {
    id: 'main',
    title: 'Algorithmic Writeups',
    subtitle: '',
    link: 'https://scribble-ivory.vercel.app/',
    isMain: true,
  },
  {
    id: 'flow',
    title: 'Max Flow',
    link: 'https://hackmd.io/@tQjg8NggTS6f_6mc5wITHA/By2Yols2le',
    backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2264&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'matrix',
    title: 'Matrix Exponentials',
    link: 'https://hackmd.io/@tQjg8NggTS6f_6mc5wITHA/rJK02_w3ge',
    backgroundImage: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2379&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'fenwick-seg',
    title: 'Fenwick & Segment Trees',
    link: 'https://hackmd.io/@tQjg8NggTS6f_6mc5wITHA/rJ9Hxahsel',
    backgroundImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'dp-subset',
    title: 'Dynamic Programming Subset Sums',
    link: 'https://hackmd.io/@tQjg8NggTS6f_6mc5wITHA/rkvDj32jgl',
    backgroundImage: 'https://images.unsplash.com/photo-1738463734038-c533b2658a2a',
  },
  {
    id: 'prefix',
    title: 'Prefix Sums',
    link: 'https://hackmd.io/@tQjg8NggTS6f_6mc5wITHA/ryYP933ilx',
    backgroundImage: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'interval',
    title: 'Interval Math',
    link: 'https://hackmd.io/@tQjg8NggTS6f_6mc5wITHA/S19ZrA3ilx',
    backgroundImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'constraints',
    title: 'Sniffing Out The Algo by Reading Problem Constraints',
    link: 'https://hackmd.io/@tQjg8NggTS6f_6mc5wITHA/SkP40U13xe',
    backgroundImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  }
];

export default function CompetitivePage() {
  return (
    <div className="pt-20 min-h-screen bg-nyc bg-no-repeat bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xs"></div>
      <div className="relative z-10">
        <GridSection cards={competitiveCards} title="Competitive Programming" />
      </div>
    </div>
  );
}
