import React from 'react';
import styles from './systems.module.css';

interface CacheLineDatum {
  address: string;
  occupancy: readonly ('hits' | 'data' | 'empty')[];
}

const cacheLines: readonly CacheLineDatum[] = [
  { address: 'SET 00', occupancy: ['hits', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'] },
  { address: 'SET 01', occupancy: ['data', 'data', 'data', 'empty', 'empty', 'empty', 'empty', 'empty'] },
  { address: 'SET 02', occupancy: ['data', 'data', 'empty', 'empty', 'data', 'data', 'empty', 'empty'] },
  { address: 'SET 03', occupancy: ['empty', 'data', 'data', 'data', 'data', 'empty', 'empty', 'empty'] },
];

export default function SystemsHeroScene(): JSX.Element {
  return (
    <div className={styles.systemsHeroScene} aria-hidden="true">
      <div className={styles.systemsHeroAtmosphere} />
      <div className={styles.systemsHeroCacheMap}>
        <header className={styles.systemsHeroMapHeader}>
          <span>CACHE OBSERVATION MAP</span>
          <small>64 B lines</small>
        </header>
        <div className={styles.systemsHeroCacheLines}>
          {cacheLines.map((line) => (
            <div className={styles.systemsHeroCacheLine} key={line.address}>
              <b>{line.address}</b>
              <small>L1D</small>
              <div className={styles.systemsHeroCacheCells}>
                {line.occupancy.map((cell, index) => <span data-cell={cell} key={index}>{cell === 'hits' ? 'hits' : cell === 'data' ? '·' : ''}</span>)}
              </div>
              <code>64 B</code>
            </div>
          ))}
        </div>
        <div className={styles.systemsHeroCacheFooter}>
          <div><small>POOL FOOTPRINT</small><span>one 4 B counter / worker</span></div>
          <div className={styles.systemsHeroHierarchy}><strong>L1D</strong><i /><span>L2 · N/A</span><i /><span>L3 · N/A</span></div>
        </div>
      </div>
      <div className={styles.systemsHeroCacheNote}>
        <small>COUNTER COVERAGE</small>
        <span>L1D measured</span>
        <strong>L2 / L3 not collected</strong>
      </div>
      <div className={styles.systemsHeroPipeline}><span>observe</span><i /><span>compare</span><i /><span>attribute</span><i /><span>verify</span></div>
    </div>
  );
}
