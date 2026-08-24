'use client';

import React, { useState } from 'react';
import styles from './systems.module.css';

export type SystemsVisualKey = 'arena-allocator' | 'cache-lines' | 'simd-mask';

type CacheMode = 'packed' | 'overaligned';

const poolBytes = 64 * 1024;
const hitCounterBytes = 4;
const laneValues = [0.42, 1.24, 0.81, 0.67] as const;

function DiagramFrame({ eyebrow, title, note, children }: { eyebrow: string; title: string; note: string; children: React.ReactNode }): JSX.Element {
  return <figure className={styles.diagramFrame} data-contained><figcaption><div><span>{eyebrow}</span><strong>{title}</strong></div><small>{note}</small></figcaption>{children}</figure>;
}

function ArenaAllocatorDiagram(): JSX.Element {
  const [hasHitCounter, setHasHitCounter] = useState(true);
  const usedBytes = hasHitCounter ? hitCounterBytes : 0;

  return (
    <DiagramFrame eyebrow="Memory lab 01" title="The result pointer outlives its worker pool" note="4 workers · 256 KiB reserved · 16 B used">
      <div className={styles.arenaLab} data-allocated={hasHitCounter}>
        <div className={styles.labToolbar}><div><b>{usedBytes.toLocaleString()} B</b><span>used / {poolBytes.toLocaleString()} B</span></div><div className={styles.labActions}><button type="button" onClick={() => setHasHitCounter(true)} disabled={hasHitCounter}>Allocate int hits</button><button type="button" onClick={() => setHasHitCounter(false)} disabled={!hasHitCounter}>Reset pool</button></div></div>
        <div className={styles.threadMemoryMap}>
          <section className={styles.poolRegion} aria-label={`${usedBytes} of ${poolBytes} pool bytes allocated`}>
            <header><div><span>THREAD n</span><strong>PoolAllocator</strong></div><small>64 KiB · base aligned 64 B</small></header>
            <div className={styles.arenaTrack}>
              <div className={styles.hitsAllocation} data-active={hasHitCounter}><span>{hasHitCounter ? 'int hits' : 'first slot'}</span><small>{hasHitCounter ? '4 B · allocate<int>()' : 'offset = 0'}</small>{hasHitCounter && <i className={styles.arenaCursor}><span>offset +4</span></i>}</div>
              <div className={styles.poolUnused}><span>{hasHitCounter ? '65,532 B unused' : '65,536 B available'}</span><small>allocation enlarged for legibility</small></div>
            </div>
            <div className={styles.capacityMeter}><span style={{ width: `${usedBytes / poolBytes * 100}%` }} /><small>Actual capacity use · {usedBytes} / {poolBytes.toLocaleString()} bytes</small></div>
          </section>
          <section className={styles.stackRegion}>
            <header><span>OUTSIDE THE POOL</span><strong>SIMD working data</strong></header>
            <div><code>std::mt19937_64 engine</code><small>thread-local RNG state</small></div>
            <div><code>randX[4] + randY[4]</code><small>stack · alignas(32) on AVX2</small></div>
            <div><code>randX[2] + randY[2]</code><small>stack · alignas(16) on NEON</small></div>
          </section>
        </div>
        <div className={styles.arenaReceipt} aria-live="polite"><span><i /> worker allocates 4 B → hits*</span><span data-invalid><i /> thread exits → pool frees buffer</span><span data-invalid><i /> main joins → *hits is dangling</span></div>
      </div>
    </DiagramFrame>
  );
}

function CacheLine({ valueCount, active, currentSlot, lineIndex }: { valueCount: number; active: boolean; currentSlot: number; lineIndex: number }): JSX.Element {
  return <div className={styles.cacheLine} data-active={active}><b>line {lineIndex.toString().padStart(2, '0')}</b><div>{Array.from({ length: 8 }, (_, slot) => <span key={slot} data-filled={slot < valueCount} data-current={active && slot === currentSlot}>{slot < valueCount ? (lineIndex * valueCount + slot).toString() : '·'}</span>)}</div></div>;
}

function CacheHitMissDiagram(): JSX.Element {
  const [mode, setMode] = useState<CacheMode>('packed');
  const [step, setStep] = useState(-1);
  const access = step < 0 ? -1 : step % 8;
  const isHit = mode === 'packed' && step > 0;
  const misses = step < 0 ? 0 : mode === 'packed' ? 1 : step + 1;
  const hits = step < 0 ? 0 : step + 1 - misses;
  const setCacheMode = (nextMode: CacheMode): void => { setMode(nextMode); setStep(-1); };
  const advance = (): void => setStep((current) => Math.min(current + 1, 7));

  return (
    <DiagramFrame eyebrow="Cache lab 02" title="How layout changes a cold sequential pass" note="Model only · MCBE pool stores no doubles">
      <div className={styles.cacheLab}>
        <div className={styles.modeSwitch} aria-label="Cache-line layout"><button type="button" aria-pressed={mode === 'packed'} onClick={() => setCacheMode('packed')}>Adjacent values</button><button type="button" aria-pressed={mode === 'overaligned'} onClick={() => setCacheMode('overaligned')}>Hypothetical split</button></div>
        <div className={styles.cacheSummary}><div><span>access</span><strong>{access < 0 ? '—' : `value[${access}]`}</strong></div><div><span>L1 hits</span><strong>{hits}</strong></div><div><span>cold misses</span><strong>{misses}</strong></div><div data-result={step < 0 ? 'idle' : isHit ? 'hit' : 'miss'}><span>last probe</span><strong>{step < 0 ? 'READY' : isHit ? 'HIT' : 'MISS'}</strong></div></div>
        <div className={styles.cacheStage} data-mode={mode}>{mode === 'packed' ? <CacheLine valueCount={8} active={access >= 0} currentSlot={access} lineIndex={0} /> : <div className={styles.overalignedLines}>{Array.from({ length: 8 }, (_, line) => <CacheLine key={line} valueCount={1} active={access === line} currentSlot={0} lineIndex={line} />)}</div>}</div>
        <div className={styles.cacheHierarchy} data-result={step < 0 ? 'idle' : isHit ? 'hit' : 'miss'}><span>L1 probe</span><i>→</i><span>L2 / L3</span><i>→</i><span>memory</span></div>
        <div className={styles.cacheControls}><button type="button" onClick={advance} disabled={step === 7}>Step access</button><button type="button" onClick={() => setStep(-1)} disabled={step < 0}>Restart pass</button><p aria-live="polite">{mode === 'packed' ? 'Eight adjacent doubles share one 64-byte cache line.' : 'Counterfactual only: the current allocator does not place doubles this way.'}</p></div>
      </div>
    </DiagramFrame>
  );
}

function SimdMaskDiagram(): JSX.Element {
  const [stage, setStage] = useState(0);
  const hitCount = laneValues.filter((value) => value <= 1).length;
  return (
    <DiagramFrame eyebrow="Compute lab 03" title="Four dart tests collapse into one mask" note="AVX2 · 4 × float64 lanes">
      <div className={styles.simdLab} data-stage={stage}>
        <div className={styles.simdStages}><span data-active={stage >= 0}>x² + y²</span><i>→</i><span data-active={stage >= 1}>≤ 1.0</span><i>→</i><span data-active={stage >= 2}>movemask</span><i>→</i><span data-active={stage >= 3}>popcount</span></div>
        <div className={styles.simdLanes}>{laneValues.map((value, index) => { const hit = value <= 1; return <div key={value} className={styles.simdLane} data-hit={hit}><small>lane {index}</small><b>{value.toFixed(2)}</b><span>{stage >= 1 ? (hit ? 'true' : 'false') : 'pending'}</span><em>{stage >= 2 ? (hit ? '1' : '0') : '·'}</em></div>; })}</div>
        <div className={styles.maskReceipt}><code>{stage >= 2 ? '0b1011' : '0b····'}</code><strong>{stage >= 3 ? `${hitCount} hits` : 'popcount waiting'}</strong><button type="button" onClick={() => setStage((current) => current === 3 ? 0 : current + 1)}>{stage === 3 ? 'Run again' : 'Advance pipeline'}</button></div>
      </div>
    </DiagramFrame>
  );
}

export function SystemsInlineVisual({ visualKey }: { visualKey: SystemsVisualKey }): JSX.Element {
  if (visualKey === 'arena-allocator') return <ArenaAllocatorDiagram />;
  if (visualKey === 'cache-lines') return <CacheHitMissDiagram />;
  return <SimdMaskDiagram />;
}
