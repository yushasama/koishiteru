'use client';

import React from 'react';
import GridSection from '../../components/GridSection';
import { GridCardData } from '../../components/GridCard';

const competitiveCards: GridCardData[] = [
  {
    id: 'newsletter',
    title: 'Algorithmic Writeups',
    subtitle: '',
    link: 'https://scribble-ivory.vercel.app/',
    isMain: true,
  },
  {
    id: 'framer-motion',
    title: 'The Framer Motion Crash Course',
    link: '#',
    backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2264&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'horizontal-scroll',
    title: 'Horizontal Scroll Animations',
    link: '#',
    backgroundImage: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2379&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'staggered-text',
    title: 'Staggered Text Animations',
    link: '#',
    backgroundImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'complex-sequence',
    title: 'Complex Sequence Animations',
    link: '#',
    backgroundImage: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'parallax-effects',
    title: 'Parallax Effects',
    link: '#',
    backgroundImage: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'scroll-reveal',
    title: 'On-Scroll Reveal Animation',
    link: '#',
    backgroundImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'drag-drop',
    title: 'Advanced Sortable Drag & Drop',
    link: '#',
    backgroundImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'advanced-tips',
    title: 'Advanced Framer Motion Tips',
    link: '#',
    backgroundImage: 'https://images.unsplash.com/photo-1506259091721-347e791bab0f?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
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
