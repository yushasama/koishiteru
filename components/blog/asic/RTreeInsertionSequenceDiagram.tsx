'use client';

import React from 'react';
import { DEMO_ASIC_SCENE, type SceneBox } from './demoAsicScene';
import { DiagramFrame, DiagramSvg, type ScrollDiagramProps } from './DiagramPrimitives';
import { RTREE_CONSTRUCTION, type RTreeConstructionStep, type RTreeDecisionCandidate, type RTreeSnapshotNode } from './rTreeConstruction';
import styles from './RTreeInsertionDiagram.module.css';

interface PlotFrame { x: number; y: number; width: number; height: number; }
interface SvgBox { x: number; y: number; width: number; height: number; }
interface VisibleConstructionState { step: RTreeConstructionStep; stepIndex: number; localProgress: number; previousSnapshot: RTreeSnapshotNode; snapshot: RTreeSnapshotNode; committed: boolean; insertedCount: number; }

const DESKTOP_CHIP: PlotFrame = { x: 32, y: 70, width: 590, height: 226 };
const MOBILE_CHIP: PlotFrame = { x: 20, y: 52, width: 320, height: 136 };
const LEAF_COLORS = ['#5ed8ff', '#b879ff', '#68e09c', '#ff8e62', '#ff6fb5'] as const;
const ACTIVE_COLOR = '#f0c557';
const ENTRY_COUNT = RTREE_CONSTRUCTION.entries.length;
const INSERT_COMMIT_AT = 0.42;
const SPLIT_FADE_END = 0.74;
const FINAL_STEP = RTREE_CONSTRUCTION.steps[RTREE_CONSTRUCTION.steps.length - 1];
const CONSTRUCTION_COMPLETE_AT = (RTREE_CONSTRUCTION.steps.length - 1 + (FINAL_STEP.splits.length ? SPLIT_FADE_END : INSERT_COMMIT_AT)) / RTREE_CONSTRUCTION.steps.length;
const CANDIDATE_WIDTH = 104;
const CANDIDATE_STRIDE = 112;
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
  const previousSnapshot = stepIndex ? RTREE_CONSTRUCTION.steps[stepIndex - 1].snapshot : RTREE_CONSTRUCTION.initial;
  const committed = localProgress >= INSERT_COMMIT_AT || progress >= 0.999;
  return { step, stepIndex, localProgress, previousSnapshot, snapshot: committed ? step.snapshot : previousSnapshot, committed, insertedCount: stepIndex + (committed ? 1 : 0) };
}

function progressLabel(progress: number): string {
  const state = visibleState(progress);
  if (progress >= CONSTRUCTION_COMPLETE_AT) return `${ENTRY_COUNT} / ${ENTRY_COUNT} · complete · ${leaves(FINAL_STEP.snapshot).length} leaves`;
  if (!state.committed) return `${state.insertedCount} / ${ENTRY_COUNT} indexed · next ${state.step.number}`;
  if (state.step.event === 'root-split') return `${state.step.number} / ${ENTRY_COUNT} · overflow resolved · root + 2 leaves`;
  if (state.step.event === 'leaf-split') return `${state.step.number} / ${ENTRY_COUNT} · overflow resolved · entries redistributed`;
  return `${state.step.number} / ${ENTRY_COUNT} · inserted ${state.step.entry.label}`;
}

function PlotRect({ box, frame, fill, fillOpacity, stroke, strokeWidth = 1.25 }: { box: SceneBox; frame: PlotFrame; fill: string; fillOpacity: number; stroke: string; strokeWidth?: number }): JSX.Element {
  const rect = toSvgBox(box, frame);
  return <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />;
}

function MbbCorners({ box, frame, color, label, opacity = 1, dashed = false }: { box: SceneBox; frame: PlotFrame; color: string; label?: string; opacity?: number; dashed?: boolean }): JSX.Element {
  const rect = toSvgBox(box, frame);
  const corner = Math.min(14, rect.width / 4, rect.height / 4);
  const path = `M${rect.x + corner} ${rect.y}H${rect.x}V${rect.y + corner}M${rect.x + rect.width - corner} ${rect.y}H${rect.x + rect.width}V${rect.y + corner}M${rect.x + rect.width} ${rect.y + rect.height - corner}V${rect.y + rect.height}H${rect.x + rect.width - corner}M${rect.x + corner} ${rect.y + rect.height}H${rect.x}V${rect.y + rect.height - corner}`;
  return <g opacity={opacity}><rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={color} fillOpacity="0.035" /><path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeDasharray={dashed ? '5 4' : undefined} vectorEffect="non-scaling-stroke" />{label && <text x={rect.x + 5} y={rect.y + 16} fill={color} fontFamily="monospace" fontSize="12.5" fontWeight="800">{label}</text>}</g>;
}

function ActiveInsertion({ box, frame, committed }: { box: SceneBox; frame: PlotFrame; committed: boolean }): JSX.Element {
  const rect = toSvgBox(box, frame);
  return <g opacity={committed ? 0.5 : 1}><rect x={rect.x - 2} y={rect.y - 2} width={rect.width + 4} height={rect.height + 4} fill={ACTIVE_COLOR} fillOpacity="0.035" stroke={ACTIVE_COLOR} strokeWidth={committed ? 1.4 : 2.2} strokeDasharray={committed ? undefined : '5 3'} vectorEffect="non-scaling-stroke" /></g>;
}

function Chip({ frame, state, mobile = false }: { frame: PlotFrame; state: VisibleConstructionState; mobile?: boolean }): JSX.Element {
  const colors = ownerColors(state.snapshot);
  const active = state.step.entry;
  const split = state.step.splits[0];
  const previousMbbOpacity = state.committed && split ? clamp((SPLIT_FADE_END - state.localProgress) / 0.3) : 0;
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
    {previousMbbOpacity > 0 && leaves(state.previousSnapshot).map((leaf) => leaf.bbox && <MbbCorners key={`previous-${leaf.id}`} box={leaf.bbox} frame={frame} color="#777" opacity={previousMbbOpacity} dashed />)}
    {leaves(state.snapshot).map((leaf, index) => leaf.bbox && <MbbCorners key={leaf.id} box={leaf.bbox} frame={frame} color={leafColor(index)} label={mobile ? undefined : `LEAF ${index + 1} · ${leaf.entryIndexes.length}`} />)}
    <ActiveInsertion box={active.shape.box} frame={frame} committed={state.committed} />
  </g>;
}

function Tree({ snapshot }: { snapshot: RTreeSnapshotNode }): JSX.Element {
  const leafNodes = leaves(snapshot);
  if (snapshot.leaf) return <g><rect x="705" y="112" width="230" height="72" rx="5" fill="#111" stroke={leafColor(0)} strokeWidth="1.6" /><text x="820" y="138" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14" fontWeight="800">ROOT · LEAF</text><text x="820" y="162" textAnchor="middle" fill={leafColor(0)} fontFamily="monospace" fontSize="13">{snapshot.entryIndexes.length} ENTRIES</text></g>;
  return <g>
    <rect x="747" y="62" width="146" height="54" rx="5" fill="#111" stroke="#ddd" strokeWidth="1.4" /><text x="820" y="84" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13.5" fontWeight="800">ROOT</text><text x="820" y="104" textAnchor="middle" fill="#a0a0a0" fontFamily="monospace" fontSize="12">{snapshot.children.length} CHILD MBBs</text>
    <path d={`M820 114V132H674V${148 + (leafNodes.length - 1) * 64 + 25}`} fill="none" stroke="#8b8b8b" strokeOpacity="0.34" strokeWidth="1.2" />
    {leafNodes.map((leaf, index) => {
      const y = 148 + index * 64;
      const color = leafColor(index);
      const entries = leaf.entryIndexes.map((entryIndex) => String(entryIndex + 1).padStart(2, '0')).join(' · ');
      return <g key={leaf.id}><path d={`M674 ${y + 25}H690`} fill="none" stroke="#8b8b8b" strokeOpacity="0.42" strokeWidth="1.2" /><rect x="690" y={y} width="260" height="54" rx="5" fill="#101010" stroke={color} strokeWidth="1.45" /><text x="704" y={y + 20} fill="#fff" fontFamily="monospace" fontSize="13" fontWeight="800">LEAF {index + 1}</text><text x="936" y={y + 20} textAnchor="end" fill={color} fontFamily="monospace" fontSize="12">{leaf.entryIndexes.length} ENTRIES</text><text x="704" y={y + 42} fill="#a0a0a0" fontFamily="monospace" fontSize="11.5">{entries}</text></g>;
    })}
  </g>;
}

function DecisionCandidates({ candidates }: { candidates: readonly RTreeDecisionCandidate[] }): JSX.Element {
  return <g>{candidates.map((candidate, index) => {
    const x = 54 + index * CANDIDATE_STRIDE;
    const color = candidate.selected ? ACTIVE_COLOR : '#555';
    return <g key={candidate.childIndex}><rect x={x} y="380" width={CANDIDATE_WIDTH} height="48" rx="4" fill={candidate.selected ? '#17140b' : '#101010'} stroke={color} /><text x={x + 8} y="398" fill={color} fontFamily="monospace" fontSize="11" fontWeight="800">LEAF {candidate.childIndex + 1}{candidate.selected ? ' · MIN' : ''}</text><text x={x + 8} y="420" fill="#eee" fontFamily="monospace" fontSize="12.5">Δ {(candidate.enlargement / 1_000_000).toFixed(2)} µm²</text></g>;
  })}</g>;
}

function DecisionLedger({ state }: { state: VisibleConstructionState }): JSX.Element {
  const decision = state.step.decisionPath[0];
  const split = state.step.splits[0];
  const candidateCount = decision?.candidates.length ?? 0;
  const ledgerWidth = decision ? Math.max(260, 20 + candidateCount * CANDIDATE_STRIDE) : 260;
  const status = !state.committed ? `NEXT · ${state.step.entry.label}` : split ? `${state.step.event === 'root-split' ? 'ROOT' : 'LEAF'} SPLIT · ${split.axis.toUpperCase()} AXIS · ${split.leftCount} | ${split.rightCount}` : `ADDED · ${state.step.entry.label}`;
  return <g transform="translate(0 -18)">
    <rect x="32" y="338" width={ledgerWidth} height={decision ? 108 : 54} rx="5" fill="#0d0d0d" stroke="#303030" />
    <text x="48" y="365" fill={split ? '#ff8e62' : ACTIVE_COLOR} fontFamily="monospace" fontSize="12" fontWeight="800">{status}</text>
    {decision && <DecisionCandidates candidates={decision.candidates} />}
  </g>;
}

function DesktopConstruction({ progress }: ScrollDiagramProps): JSX.Element {
  const state = visibleState(progress);
  return <DiagramSvg className={styles.desktop} width={1080} height={540} ariaLabel={`R-tree construction from 22 LI1 rectangles. Current insertion ${state.step.number}: ${state.step.entry.label}.`} boardBottomInset={26} contentScale={1} inset={2} progress={progress} progressEnd={CONSTRUCTION_COMPLETE_AT} progressLabel={progressLabel(progress)}>
    <g transform="translate(50 0)">
      <Chip frame={DESKTOP_CHIP} state={state} />
      <text x="38" y="48" fill="#eee" fontFamily="monospace" fontSize="15" fontWeight="800">LI1 RECTANGLES</text><text x="622" y="48" textAnchor="end" fill="#a0a0a0" fontFamily="monospace" fontSize="11.5">{state.insertedCount} / {ENTRY_COUNT} INDEXED</text>
      <text x="690" y="48" fill="#ddd" fontFamily="monospace" fontSize="13" fontWeight="800">LIVE TREE</text>
      <Tree snapshot={state.snapshot} />
      <DecisionLedger state={state} />
    </g>
  </DiagramSvg>;
}

function MobileConstruction({ progress }: ScrollDiagramProps): JSX.Element {
  const state = visibleState(progress);
  const leafNodes = leaves(state.snapshot);
  return <DiagramSvg className={styles.mobile} width={360} height={680} ariaLabel={`R-tree construction state ${state.step.number} of ${ENTRY_COUNT}. ${state.insertedCount} LI1 rectangles are indexed in ${leafNodes.length} leaf nodes.`} boardBottomInset={26} contentScale={1} inset={10} progress={progress} progressEnd={CONSTRUCTION_COMPLETE_AT} progressLabel={progressLabel(progress)}>
    <text x="20" y="30" fill="#ddd" fontFamily="monospace" fontSize="12" fontWeight="800">{state.insertedCount} / {ENTRY_COUNT} INDEXED</text>
    <Chip frame={MOBILE_CHIP} state={state} mobile />
    <rect x="20" y="212" width="320" height="54" rx="4" fill="#0d0d0d" stroke="#303030" /><text x="32" y="233" fill="#a0a0a0" fontFamily="monospace" fontSize="12">INSERT {state.step.number.toString().padStart(2, '0')}</text><text x="32" y="254" fill={ACTIVE_COLOR} fontFamily="monospace" fontSize="13.5" fontWeight="800">{state.step.entry.label}</text>
    <rect x="117" y="292" width="126" height="50" rx="5" fill="#111" stroke="#ddd" /><text x="180" y="312" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="12.5" fontWeight="800">{state.snapshot.leaf ? 'ROOT · LEAF' : 'ROOT'}</text><text x="180" y="331" textAnchor="middle" fill="#a8a8a8" fontFamily="monospace" fontSize="11">{state.snapshot.leaf ? `${state.snapshot.entryIndexes.length} ENTRIES` : `${leafNodes.length} CHILD MBBs`}</text>
    {!state.snapshot.leaf && leafNodes.map((leaf, index) => {
      const x = 24 + index % 2 * 164;
      const y = 384 + Math.floor(index / 2) * 82;
      const color = leafColor(index);
      const entryLabels = leaf.entryIndexes.map((entryIndex) => String(entryIndex + 1).padStart(2, '0'));
      const breakAt = Math.ceil(entryLabels.length / 2);
      return <g key={leaf.id}><path d={`M180 342V364H${x + 74}V${y}`} fill="none" stroke="#8b8b8b" strokeOpacity="0.38" /><rect x={x} y={y} width="148" height="68" rx="5" fill="#101010" stroke={color} strokeWidth="1.5" /><text x={x + 12} y={y + 23} fill="#fff" fontFamily="monospace" fontSize="12.5" fontWeight="800">LEAF {index + 1}</text><text x={x + 136} y={y + 23} textAnchor="end" fill={color} fontFamily="monospace" fontSize="11">{leaf.entryIndexes.length} ENTRIES</text><text x={x + 12} y={y + 45} fill="#aaa" fontFamily="monospace" fontSize="10.5">{entryLabels.slice(0, breakAt).join(' · ')}</text><text x={x + 12} y={y + 60} fill="#aaa" fontFamily="monospace" fontSize="10.5">{entryLabels.slice(breakAt).join(' · ')}</text></g>;
    })}
  </DiagramSvg>;
}

export function RTreeInsertionSequenceDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  return <DiagramFrame label="R-tree construction" status={`${ENTRY_COUNT} real LI1 rectangles`}><div className={styles.stage}><DesktopConstruction progress={progress} /><MobileConstruction progress={progress} /></div></DiagramFrame>;
}
