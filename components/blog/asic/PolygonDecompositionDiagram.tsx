'use client';

import React from 'react';
import { DiagramFrame, DiagramSvg, type ScrollDiagramProps } from './DiagramPrimitives';
import { RTREE_CONSTRUCTION, type RTreeSnapshotNode } from './rTreeConstruction';
import styles from './asic.module.css';

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const mix = (start: number, end: number, amount: number): number => start + (end - start) * amount;
const LEAF_COLORS = ['#63d6ff', '#b879ff', '#7ce5a8', '#ff8e62'] as const;
const FINAL_RTREE = RTREE_CONSTRUCTION.steps[RTREE_CONSTRUCTION.steps.length - 1].snapshot;
const FINAL_LEAVES = FINAL_RTREE.children;

function entryRows(leaf: RTreeSnapshotNode): readonly [string, string] {
  const labels = leaf.entryIndexes.map((entryIndex) => String(entryIndex + 1).padStart(2, '0'));
  const split = Math.ceil(labels.length / 2);
  return [labels.slice(0, split).join(' · '), labels.slice(split).join(' · ')];
}

export function PolygonDecompositionDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const cut = clamp((progress - 0.1) / 0.18);
  const color = clamp((progress - 0.28) / 0.18);
  const clear = clamp((progress - 0.52) / 0.16);
  const tree = clamp((progress - 0.66) / 0.24);
  const geometryOpacity = 1 - clear;
  const status = tree > 0.6 ? 'Actual tree · root → 4 leaves → 22 rectangles' : clear > 0.3 ? 'Insert the rectangles into the R-tree' : color > 0.25 ? 'Color the three exact rectangles' : cut > 0.1 ? 'Draw two clean section lines' : 'Trace the I-shaped outline';

  return (
    <DiagramFrame label="Decomping A Weird Manhattan Polygon" status={status}>
      <DiagramSvg className={styles.polygonDesktop} width={760} height={570} ariaLabel="An I-shaped Manhattan polygon is divided into three exact rectangles, followed by the actual final R-tree built from 22 LI1 rectangles: one root with four leaf nodes." contentScale={0.92} progress={progress} progressLabel={status} showBoard={false}>
        <defs>
          <linearGradient id="decomp-cyan" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#63d6ff" stopOpacity="0.34" /><stop offset="0.48" stopColor="#2987ad" stopOpacity="0.16" /><stop offset="1" stopColor="#63d6ff" stopOpacity="0.05" /></linearGradient>
          <linearGradient id="decomp-gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffe29a" stopOpacity="0.34" /><stop offset="0.5" stopColor="#c38c22" stopOpacity="0.17" /><stop offset="1" stopColor="#f0c557" stopOpacity="0.06" /></linearGradient>
          <linearGradient id="decomp-green" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9af5c0" stopOpacity="0.33" /><stop offset="0.48" stopColor="#319b64" stopOpacity="0.16" /><stop offset="1" stopColor="#7ce5a8" stopOpacity="0.05" /></linearGradient>
        </defs>
        <g opacity={geometryOpacity}>
          <text x="44" y="54" fill="#aaa" fontFamily="monospace" fontSize="13">I-SHAPED POLYGON</text>
          <g transform="translate(380 258)">
            <path d="M-240-140H240V-60H50V60H240V140H-240V60H-50V-60H-240Z" fill="#d8d8d8" fillOpacity="0.1" />
            <path d="M-240-140H240V-60H50V60H240V140H-240V60H-50V-60H-240Z" fill="none" stroke="#e6e6e6" strokeWidth="2.5" />
            <path d="M-50-60H50M-50 60H50" fill="none" stroke="#fff" strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - cut} />
            <g opacity={color}><rect x="-240" y="-140" width="480" height="80" fill="url(#decomp-cyan)" stroke="#79ddff" strokeOpacity="0.9" strokeWidth="1.8" /><rect x="-50" y="-60" width="100" height="120" fill="url(#decomp-gold)" stroke="#f6cf68" strokeOpacity="0.92" strokeWidth="1.8" /><rect x="-240" y="60" width="480" height="80" fill="url(#decomp-green)" stroke="#87eab2" strokeOpacity="0.9" strokeWidth="1.8" /></g>
            <g opacity={color} fontFamily="monospace" fontSize="14" fontWeight="700"><text x="-214" y="-94" fill="#79ddff">R0</text><text y="6" textAnchor="middle" fill="#f6cf68">R1</text><text x="-214" y="108" fill="#87eab2">R2</text></g>
          </g>
        </g>

        <g opacity={tree} transform={`translate(0 ${mix(12, 0, tree)})`}>
          <text x="44" y="54" fill="#aaa" fontFamily="monospace" fontSize="13">ACTUAL R-TREE · FINAL LI1 INDEX</text>
          <rect x="300" y="82" width="160" height="62" rx="6" fill="#101010" stroke="#d8d8d8" strokeWidth="1.5" />
          <text x="380" y="108" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="15" fontWeight="800">ROOT</text>
          <text x="380" y="130" textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize="12.5">4 CHILD MBBs</text>
          <path d="M380 144V178M122 178H638" fill="none" stroke="#696969" strokeWidth="1.4" />
          {FINAL_LEAVES.map((leaf, index) => {
            const x = 52 + index * 172;
            const color = LEAF_COLORS[index];
            const rows = entryRows(leaf);
            return <g key={leaf.id} opacity={clamp((tree - index * 0.08) / 0.5)}><path d={`M${x + 70} 178V210`} stroke="#696969" strokeWidth="1.4" /><rect x={x} y="210" width="140" height="100" rx="5" fill="#101010" stroke={color} strokeWidth="1.6" /><text x={x + 14} y="237" fill="#fff" fontFamily="monospace" fontSize="13.5" fontWeight="800">LEAF {index + 1}</text><text x={x + 126} y="237" textAnchor="end" fill={color} fontFamily="monospace" fontSize="11.5">{leaf.entryIndexes.length}</text><text x={x + 14} y="267" fill="#bbb" fontFamily="monospace" fontSize="11.5">{rows[0]}</text><text x={x + 14} y="288" fill="#bbb" fontFamily="monospace" fontSize="11.5">{rows[1]}</text></g>;
          })}
          <text x="380" y="382" textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize="12.5">22 REAL LI1 RECTANGLES · GROUPED INTO 4 LEAVES</text>
        </g>
      </DiagramSvg>
      <DiagramSvg className={styles.polygonMobile} width={360} height={480} ariaLabel="The actual final R-tree for 22 LI1 rectangles has one root and four leaf nodes." contentScale={1} progress={1} progressLabel="Root · 4 leaves · 22 rectangles" showBoard={false}>
        <text x="18" y="30" fill="#bbb" fontFamily="monospace" fontSize="12.5" fontWeight="800">ACTUAL R-TREE · FINAL LI1 INDEX</text>
        <rect x="117" y="50" width="126" height="56" rx="5" fill="#101010" stroke="#d8d8d8" strokeWidth="1.4" />
        <text x="180" y="74" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13" fontWeight="800">ROOT</text>
        <text x="180" y="94" textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize="11.5">4 CHILD MBBs</text>
        {FINAL_LEAVES.map((leaf, index) => {
          const x = 20 + index % 2 * 164;
          const y = 154 + Math.floor(index / 2) * 106;
          const color = LEAF_COLORS[index];
          const rows = entryRows(leaf);
          return <g key={leaf.id}><path d={`M180 106V130H${x + 74}V${y}`} fill="none" stroke="#696969" strokeWidth="1.25" /><rect x={x} y={y} width="148" height="82" rx="5" fill="#101010" stroke={color} strokeWidth="1.5" /><text x={x + 12} y={y + 25} fill="#fff" fontFamily="monospace" fontSize="13.5" fontWeight="800">LEAF {index + 1}</text><text x={x + 136} y={y + 25} textAnchor="end" fill={color} fontFamily="monospace" fontSize="12">{leaf.entryIndexes.length}</text><text x={x + 12} y={y + 50} fill="#bbb" fontFamily="monospace" fontSize="11.5">{rows[0]}</text><text x={x + 12} y={y + 68} fill="#bbb" fontFamily="monospace" fontSize="11.5">{rows[1]}</text></g>;
        })}
        <text x="180" y="384" textAnchor="middle" fill="#bbb" fontFamily="monospace" fontSize="12">22 REAL LI1 RECTANGLES</text>
      </DiagramSvg>
    </DiagramFrame>
  );
}
