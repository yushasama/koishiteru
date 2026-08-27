'use client';

import React from 'react';
import { DEMO_ASIC_SCENE, type SceneBox } from './demoAsicScene';
import { DiagramFrame, DiagramSvg, type ScrollDiagramProps } from './DiagramPrimitives';
import { RTREE_CONSTRUCTION, type RTreeConstructionStep, type RTreeDecisionCandidate, type RTreeSnapshotNode } from './rTreeConstruction';
import styles from './RTreeInsertionDiagram.module.css';

interface PlotFrame { x: number; y: number; width: number; height: number; }
interface SvgBox { x: number; y: number; width: number; height: number; }
interface VisibleConstructionState { step: RTreeConstructionStep; stepIndex: number; localProgress: number; snapshot: RTreeSnapshotNode; insertedCount: number; }

const DESKTOP_CHIP: PlotFrame = { x: 38, y: 70, width: 540, height: 226 };
const MOBILE_CHIP: PlotFrame = { x: 20, y: 52, width: 320, height: 136 };
const LEAF_COLORS = ['#5ed8ff', '#b879ff', '#68e09c', '#ff8e62'] as const;
const ACTIVE_COLOR = '#f0c557';
const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const leafColor = (index: number): string => LEAF_COLORS[index % LEAF_COLORS.length];

function toSvgBox(box: SceneBox, frame: PlotFrame): SvgBox {
  const bounds = DEMO_ASIC_SCENE.bounds;
  const scaleX = frame.width / (bounds.xMax - bounds.xMin);
  const scaleY = frame.height / (bounds.yMax - bounds.yMin);
  return { x: frame.x + (box.xMin - bounds.xMin) * scaleX, y: frame.y + (bounds.yMax - box.yMax) * scaleY, width: (box.xMax - box.xMin) * scaleX, height: (box.yMax - box.yMin) * scaleY };
}

function leaves(node: RTreeSnapshotNode): readonly RTreeSnapshotNode[] {
  return node.leaf ? [node] : node.children.flatMap(leaves);
}

function ownerColors(snapshot: RTreeSnapshotNode): ReadonlyMap<number, string> {
  return new Map(leaves(snapshot).flatMap((leaf, leafIndex) => leaf.entryIndexes.map((entryIndex) => [entryIndex, leafColor(leafIndex)] as const)));
}

function visibleState(progress: number): VisibleConstructionState {
  const scaled = clamp(progress) * RTREE_CONSTRUCTION.steps.length;
  const stepIndex = Math.min(RTREE_CONSTRUCTION.steps.length - 1, Math.floor(scaled));
  const localProgress = progress >= 0.999 ? 1 : scaled - stepIndex;
  const step = RTREE_CONSTRUCTION.steps[stepIndex];
  const committed = localProgress >= 0.58;
  const previous = stepIndex ? RTREE_CONSTRUCTION.steps[stepIndex - 1].snapshot : RTREE_CONSTRUCTION.initial;
  return { step, stepIndex, localProgress, snapshot: committed ? step.snapshot : previous, insertedCount: committed ? stepIndex + 1 : stepIndex };
}

function progressLabel(progress: number): string {
  const state = visibleState(progress);
  if (progress >= 0.999) return '22 / 22 · complete · 4 leaves';
  if (state.localProgress < 0.24) return `${state.step.number} / 22 · scan ${state.step.entry.label}`;
  if (state.localProgress < 0.58) return state.step.decisionPath.length ? `${state.step.number} / 22 · choose minimum-enlargement subtree` : `${state.step.number} / 22 · append to root leaf`;
  if (state.step.event === 'root-split') return `${state.step.number} / 22 · overflow 9 / 8 · create root`;
  if (state.step.event === 'leaf-split') return `${state.step.number} / 22 · overflow 9 / 8 · split leaf`;
  return `${state.step.number} / 22 · inserted ${state.step.entry.label}`;
}

function PlotRect({ box, frame, fill, fillOpacity, stroke, strokeWidth = 1.25 }: { box: SceneBox; frame: PlotFrame; fill: string; fillOpacity: number; stroke: string; strokeWidth?: number }): JSX.Element {
  const rect = toSvgBox(box, frame);
  return <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />;
}

function MbbCorners({ box, frame, color, label }: { box: SceneBox; frame: PlotFrame; color: string; label?: string }): JSX.Element {
  const rect = toSvgBox(box, frame);
  const corner = Math.min(14, rect.width / 4, rect.height / 4);
  const path = `M${rect.x + corner} ${rect.y}H${rect.x}V${rect.y + corner}M${rect.x + rect.width - corner} ${rect.y}H${rect.x + rect.width}V${rect.y + corner}M${rect.x + rect.width} ${rect.y + rect.height - corner}V${rect.y + rect.height}H${rect.x + rect.width - corner}M${rect.x + corner} ${rect.y + rect.height}H${rect.x}V${rect.y + rect.height - corner}`;
  return <g><rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={color} fillOpacity="0.035" /><path d={path} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />{label && <text x={rect.x + 5} y={rect.y + 12} fill={color} fontFamily="monospace" fontSize="8" fontWeight="800">{label}</text>}</g>;
}

function Chip({ frame, state, mobile = false }: { frame: PlotFrame; state: VisibleConstructionState; mobile?: boolean }): JSX.Element {
  const colors = ownerColors(state.snapshot);
  const active = state.step.entry;
  const activeOpacity = state.localProgress < 0.58 ? 1 : Math.max(0.28, 1 - (state.localProgress - 0.58) * 1.6);
  return <g>
    <rect x={frame.x} y={frame.y} width={frame.width} height={frame.height} fill="#080808" stroke="#363636" strokeWidth="1.3" />
    {DEMO_ASIC_SCENE.cells.map((cell) => {
      const box = toSvgBox({ xMin: cell.x, yMin: cell.y, xMax: cell.x + cell.width, yMax: cell.y + cell.height }, frame);
      return <rect key={cell.id} x={box.x} y={box.y} width={box.width} height={box.height} fill="#111" fillOpacity="0.45" stroke="#242424" strokeWidth="0.8" />;
    })}
    {RTREE_CONSTRUCTION.entries.map((entry) => {
      const color = colors.get(entry.index);
      return <PlotRect key={entry.id} box={entry.shape.box} frame={frame} fill={color ?? '#555'} fillOpacity={color ? 0.3 : 0.08} stroke={color ?? '#383838'} strokeWidth={color ? 1.45 : 0.8} />;
    })}
    {leaves(state.snapshot).map((leaf, index) => leaf.bbox && <MbbCorners key={leaf.id} box={leaf.bbox} frame={frame} color={leafColor(index)} label={mobile ? undefined : `LEAF ${index + 1} · ${leaf.entryIndexes.length}`} />)}
    <g opacity={activeOpacity}><PlotRect box={active.shape.box} frame={frame} fill={ACTIVE_COLOR} fillOpacity={0.44} stroke={ACTIVE_COLOR} strokeWidth={2.2} /></g>
  </g>;
}

function Tree({ snapshot }: { snapshot: RTreeSnapshotNode }): JSX.Element {
  const leafNodes = leaves(snapshot);
  if (snapshot.leaf) return <g><rect x="658" y="112" width="194" height="72" rx="5" fill="#111" stroke={leafColor(0)} strokeWidth="1.6" /><text x="755" y="138" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="12" fontWeight="800">ROOT · LEAF</text><text x="755" y="160" textAnchor="middle" fill={leafColor(0)} fontFamily="monospace" fontSize="10">{snapshot.entryIndexes.length} / {RTREE_CONSTRUCTION.maxEntries} ENTRIES</text></g>;
  return <g>
    <rect x="690" y="66" width="130" height="48" rx="5" fill="#111" stroke="#ddd" strokeWidth="1.4" /><text x="755" y="86" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="11" fontWeight="800">ROOT</text><text x="755" y="102" textAnchor="middle" fill="#777" fontFamily="monospace" fontSize="8">{snapshot.children.length} CHILD MBBs</text>
    {leafNodes.map((leaf, index) => {
      const y = 148 + index * 64;
      const color = leafColor(index);
      const entries = leaf.entryIndexes.map((entryIndex) => String(entryIndex + 1).padStart(2, '0')).join(' · ');
      return <g key={leaf.id}><path d={`M755 114V126L642 ${y + 25}`} fill="none" stroke="#555" strokeWidth="1.2" /><rect x="620" y={y} width="270" height="50" rx="5" fill="#101010" stroke={color} strokeWidth="1.45" /><text x="634" y={y + 19} fill="#fff" fontFamily="monospace" fontSize="10" fontWeight="800">LEAF {index + 1}</text><text x="876" y={y + 19} textAnchor="end" fill={color} fontFamily="monospace" fontSize="9">{leaf.entryIndexes.length} / 8</text><text x="634" y={y + 37} fill="#777" fontFamily="monospace" fontSize="7.5">{entries}</text></g>;
    })}
  </g>;
}

function DecisionCandidates({ candidates }: { candidates: readonly RTreeDecisionCandidate[] }): JSX.Element {
  return <g>{candidates.map((candidate, index) => {
    const x = 54 + index * 128;
    const color = candidate.selected ? ACTIVE_COLOR : '#555';
    return <g key={candidate.childIndex}><rect x={x} y="398" width="116" height="48" rx="4" fill={candidate.selected ? '#17140b' : '#101010'} stroke={color} /><text x={x + 10} y="416" fill={color} fontFamily="monospace" fontSize="8" fontWeight="800">LEAF {candidate.childIndex + 1}{candidate.selected ? ' · MIN' : ''}</text><text x={x + 10} y="435" fill="#ddd" fontFamily="monospace" fontSize="10">Δ {(candidate.enlargement / 1_000_000).toFixed(2)} µm²</text></g>;
  })}</g>;
}

function DecisionLedger({ state }: { state: VisibleConstructionState }): JSX.Element {
  const decision = state.step.decisionPath[0];
  const split = state.step.splits[0];
  const committed = state.localProgress >= 0.58;
  let status = decision ? `CHOOSE LEAF ${decision.selectedChildIndex + 1} · MINIMUM MBB ENLARGEMENT` : `ROOT IS A LEAF · APPEND UNTIL CAPACITY ${RTREE_CONSTRUCTION.maxEntries}`;
  if (committed && split) status = `${state.step.event === 'root-split' ? 'ROOT OVERFLOW' : 'LEAF OVERFLOW'} · SPLIT ON ${split.axis.toUpperCase()} CENTER SPREAD · ${split.leftCount} | ${split.rightCount}`;
  else if (committed) status = `INSERTED ${state.step.entry.label} · ${state.insertedCount} / 22 INDEXED`;
  return <g>
    <rect x="38" y="338" width="540" height="126" rx="5" fill="#0d0d0d" stroke="#303030" />
    <text x="54" y="362" fill="#777" fontFamily="monospace" fontSize="8">INSERT {state.step.number.toString().padStart(2, '0')} · {state.step.entry.label}</text>
    <text x="54" y="384" fill={split && committed ? '#ff8e62' : ACTIVE_COLOR} fontFamily="monospace" fontSize="10" fontWeight="800">{status}</text>
    {decision ? <DecisionCandidates candidates={decision.candidates} /> : <g><rect x="54" y="398" width="244" height="48" rx="4" fill="#101010" stroke="#555" /><text x="68" y="417" fill="#aaa" fontFamily="monospace" fontSize="8">ROOT LEAF OCCUPANCY</text><text x="68" y="437" fill="#fff" fontFamily="monospace" fontSize="13" fontWeight="800">{Math.min(state.insertedCount, 8)} / 8</text></g>}
    <text x="566" y="456" textAnchor="end" fill="#666" fontFamily="monospace" fontSize="7">JSC_ASIC RTREE · LI1 · MAX_ENTRIES 8</text>
  </g>;
}

function DesktopConstruction({ progress }: ScrollDiagramProps): JSX.Element {
  const state = visibleState(progress);
  return <DiagramSvg className={styles.desktop} width={920} height={510} ariaLabel={`Complete R-tree construction from the demo ASIC's 22 LI1 rectangles using jsc_asic's capacity-eight insertion algorithm. Current insertion ${state.step.number}: ${state.step.entry.label}.`} contentScale={1} inset={16}>
    <Chip frame={DESKTOP_CHIP} state={state} />
    <text x="38" y="48" fill="#ddd" fontFamily="monospace" fontSize="11" fontWeight="800">LI1 RECTANGLES · SCENE ORDER</text><text x="578" y="48" textAnchor="end" fill="#777" fontFamily="monospace" fontSize="8">{state.insertedCount} / 22 INDEXED</text>
    <text x="620" y="48" fill="#ddd" fontFamily="monospace" fontSize="11" fontWeight="800">LIVE TREE</text>
    <Tree snapshot={state.snapshot} />
    <DecisionLedger state={state} />
  </DiagramSvg>;
}

function MobileConstruction({ progress }: ScrollDiagramProps): JSX.Element {
  const state = visibleState(progress);
  const leafNodes = leaves(state.snapshot);
  return <DiagramSvg className={styles.mobile} width={360} height={640} ariaLabel={`R-tree construction state ${state.step.number} of 22. ${state.insertedCount} LI1 rectangles are indexed in ${leafNodes.length} leaf nodes.`} contentScale={1} inset={10}>
    <text x="20" y="30" fill="#ddd" fontFamily="monospace" fontSize="10" fontWeight="800">LI1 · {state.insertedCount} / 22 INDEXED</text><text x="340" y="30" textAnchor="end" fill="#777" fontFamily="monospace" fontSize="8">CAPACITY 8</text>
    <Chip frame={MOBILE_CHIP} state={state} mobile />
    <rect x="20" y="212" width="320" height="54" rx="4" fill="#0d0d0d" stroke="#303030" /><text x="32" y="233" fill="#777" fontFamily="monospace" fontSize="8">INSERT {state.step.number.toString().padStart(2, '0')}</text><text x="32" y="253" fill={ACTIVE_COLOR} fontFamily="monospace" fontSize="10" fontWeight="800">{state.step.entry.label}</text>
    <rect x="125" y="292" width="110" height="44" rx="5" fill="#111" stroke="#ddd" /><text x="180" y="310" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="10" fontWeight="800">{state.snapshot.leaf ? 'ROOT · LEAF' : 'ROOT'}</text><text x="180" y="325" textAnchor="middle" fill="#777" fontFamily="monospace" fontSize="8">{state.snapshot.leaf ? `${state.snapshot.entryIndexes.length} / 8` : `${leafNodes.length} CHILD MBBs`}</text>
    {!state.snapshot.leaf && leafNodes.map((leaf, index) => {
      const x = 24 + index % 2 * 164;
      const y = 384 + Math.floor(index / 2) * 82;
      const color = leafColor(index);
      return <g key={leaf.id}><path d={`M180 336V356L${x + 74} ${y}`} fill="none" stroke="#555" /><rect x={x} y={y} width="148" height="62" rx="5" fill="#101010" stroke={color} strokeWidth="1.5" /><text x={x + 12} y={y + 24} fill="#fff" fontFamily="monospace" fontSize="10" fontWeight="800">LEAF {index + 1}</text><text x={x + 136} y={y + 24} textAnchor="end" fill={color} fontFamily="monospace" fontSize="9">{leaf.entryIndexes.length} / 8</text><text x={x + 12} y={y + 45} fill="#777" fontFamily="monospace" fontSize="7">{leaf.entryIndexes.map((entryIndex) => String(entryIndex + 1).padStart(2, '0')).join(' · ')}</text></g>;
    })}
    <text x="180" y="612" textAnchor="middle" fill="#777" fontFamily="monospace" fontSize="8">MIN ΔMBB · AREA TIE-BREAK · AXIS-MEDIAN SPLIT</text>
  </DiagramSvg>;
}

export function RTreeInsertionSequenceDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  return <DiagramFrame label="R-tree construction" status="22 real LI1 rectangles · jsc_asic algorithm" progress={progress} progressLabel={progressLabel(progress)}><div className={styles.stage}><DesktopConstruction progress={progress} /><MobileConstruction progress={progress} /></div></DiagramFrame>;
}
