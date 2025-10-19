'use client';

import React from 'react';
import GridCard, { GridCardData } from './GridCard';

interface GridSectionProps {
  cards: GridCardData[];
  title?: string;
}

const GridSection: React.FC<GridSectionProps> = ({ cards, title }) => {
  return (
    <div className="p-4 text-neutral-50 md:p-12">
      <div className="mx-auto max-w-5xl">
        {title && (
          <h1 className="text-4xl font-bold mb-8 text-center">{title}</h1>
        )}
        
        {/* Render cards in rows of 3 */}
        {cards.reduce((rows: GridCardData[][], card, index) => {
          const rowIndex = Math.floor(index / 3);
          if (!rows[rowIndex]) {
            rows[rowIndex] = [];
          }
          rows[rowIndex].push(card);
          return rows;
        }, []).map((row, rowIndex) => (
          <div 
            key={rowIndex}
            className={`grid grid-cols-1 divide-y divide-neutral-700 border border-neutral-700 md:grid-cols-3 md:divide-x md:divide-y-0 ${
              rowIndex > 0 ? 'border-t-0' : ''
            }`}
          >
            {row.map((card) => (
              <GridCard key={card.id} card={card} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridSection;
