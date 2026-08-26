'use client';

import React from 'react';
import { DEMO_ASIC_SCENE, type DemoShape, type SceneBox } from './demoAsicScene';
import { DiagramFrame, DiagramSvg, type ScrollDiagramProps } from './DiagramPrimitives';
import styles from './RTreeInsertionDiagram.module.css';

interface PlotFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SvgBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RTreeEntry {
  label: string;
  shape: DemoShape;
}

const LEFT_COLOR = '#63d6ff';
const RIGHT_COLOR = '#bd75ff';
const CANDIDATE_COLOR = '#f0c557';
const DESKTOP_CHIP: PlotFrame = { x: 42, y: 88, width: 560, height: 236 };
const MOBILE_CHIP: PlotFrame = { x: 24, y: 58, width: 312, height: 132 };

const LEFT_ENTRIES: readonly RTreeEntry[] = [
  { label: 'VDD DROP', shape: getShape('m2-vdd-drop') },
  { label: 'A SRC', shape: getShape('m2-a-source') },
  { label: 'B SRC', shape: getShape('m2-b-source') },
];
const RIGHT_ENTRIES: readonly RTreeEntry[] = [
  { label: 'A SINK', shape: getShape('m2-a-sink') },
  { label: 'B SINK', shape: getShape('m2-b-sink') },
  { label: 'Y SINK', shape: getShape('m2-y-sink') },
];
const CANDIDATE: RTreeEntry = { label: 'Y SRC', shape: getShape('m2-y-source') };
const MET2_SHAPES = DEMO_ASIC_SCENE.shapes.filter((shape) => shape.layer === 'met2');
const LEFT_BOUND = unionBoxes(LEFT_ENTRIES.map((entry) => entry.shape.box));
const RIGHT_BOUND = unionBoxes(RIGHT_ENTRIES.map((entry) => entry.shape.box));
const LEFT_PROPOSAL = unionBoxes([LEFT_BOUND, CANDIDATE.shape.box]);
const RIGHT_PROPOSAL = unionBoxes([RIGHT_BOUND, CANDIDATE.shape.box]);
const LEFT_ENLARGEMENT = boxArea(LEFT_PROPOSAL) - boxArea(LEFT_BOUND);
const RIGHT_ENLARGEMENT = boxArea(RIGHT_PROPOSAL) - boxArea(RIGHT_BOUND);

function getShape(id: string): DemoShape {
  const shape = DEMO_ASIC_SCENE.shapes.find((candidate) => candidate.id === id);
  if (!shape) throw new Error(`Demo ASIC scene is missing R-tree entry ${id}`);
  if (shape.layer !== 'met2') throw new Error(`R-tree entry ${id} must be on MET2`);
  return shape;
}

function unionBoxes(boxes: readonly SceneBox[]): SceneBox {
  if (!boxes.length) throw new Error('Cannot create an R-tree bound from zero rectangles');
  return boxes.reduce((bound, box) => ({ xMin: Math.min(bound.xMin, box.xMin), yMin: Math.min(bound.yMin, box.yMin), xMax: Math.max(bound.xMax, box.xMax), yMax: Math.max(bound.yMax, box.yMax) }));
}

function boxArea(box: SceneBox): number {
  return (box.xMax - box.xMin) * (box.yMax - box.yMin);
}

function toSvgBox(box: SceneBox, frame: PlotFrame): SvgBox {
  const bounds = DEMO_ASIC_SCENE.bounds;
  const scaleX = frame.width / (bounds.xMax - bounds.xMin);
  const scaleY = frame.height / (bounds.yMax - bounds.yMin);
  return { x: frame.x + (box.xMin - bounds.xMin) * scaleX, y: frame.y + (bounds.yMax - box.yMax) * scaleY, width: (box.xMax - box.xMin) * scaleX, height: (box.yMax - box.yMin) * scaleY };
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function mix(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function phase(progress: number, start: number, duration: number): number {
  return clamp((progress - start) / duration);
}

function stepLabel(progress: number): string {
  if (progress < 0.28) return '1 · BUILD CURRENT TREE · SIX MET2 RECTANGLES';
  if (progress < 0.44) return '2 · SCAN NEXT RECTANGLE · M2-Y-SOURCE';
  if (progress < 0.58) return `3 · TEST LEAF A · +${LEFT_ENLARGEMENT.toFixed(2)} µm²`;
  if (progress < 0.72) return `4 · TEST LEAF B · +${RIGHT_ENLARGEMENT.toFixed(2)} µm²`;
  if (progress < 0.84) return '5 · CHOOSE LEAF B · MINIMUM ENLARGEMENT';
  return '6 · INSERTED · LEAF B NOW HOLDS FOUR RECTANGLES';
}

function PlotRect({ box, frame, fill, fillOpacity, stroke, strokeDasharray, strokeWidth = 1.4 }: { box: SceneBox; frame: PlotFrame; fill: string; fillOpacity: number; stroke: string; strokeDasharray?: string; strokeWidth?: number }): JSX.Element {
  const rect = toSvgBox(box, frame);
  return <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeDasharray={strokeDasharray} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />;
}

function MbbCorners({ box, frame, color, label, fillOpacity = 0.025, strokeWidth = 1.8 }: { box: SceneBox; frame: PlotFrame; color: string; label?: string; fillOpacity?: number; strokeWidth?: number }): JSX.Element {
  const rect = toSvgBox(box, frame);
  const corner = Math.min(16, rect.width / 4, rect.height / 4);
  const path = `M${rect.x + corner} ${rect.y}H${rect.x}V${rect.y + corner}M${rect.x + rect.width - corner} ${rect.y}H${rect.x + rect.width}V${rect.y + corner}M${rect.x + rect.width} ${rect.y + rect.height - corner}V${rect.y + rect.height}H${rect.x + rect.width - corner}M${rect.x + corner} ${rect.y + rect.height}H${rect.x}V${rect.y + rect.height - corner}`;
  return <g><rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={color} fillOpacity={fillOpacity} stroke="none" /><path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />{label && <text x={rect.x + 5} y={rect.y + 13} fill={color} fontFamily="monospace" fontSize="8" fontWeight="800">{label}</text>}</g>;
}

function ChipBase({ frame }: { frame: PlotFrame }): JSX.Element {
  return (
    <g>
      <rect x={frame.x} y={frame.y} width={frame.width} height={frame.height} fill="#080808" stroke="#393939" strokeWidth="1.4" />
      {DEMO_ASIC_SCENE.cells.map((cell) => {
        const cellBox = toSvgBox({ xMin: cell.x, yMin: cell.y, xMax: cell.x + cell.width, yMax: cell.y + cell.height }, frame);
        return <rect key={cell.id} x={cellBox.x} y={cellBox.y} width={cellBox.width} height={cellBox.height} fill="#111" fillOpacity="0.42" stroke="#242424" strokeWidth="1" />;
      })}
      {MET2_SHAPES.map((shape) => <PlotRect key={shape.id} box={shape.box} frame={frame} fill="#484848" fillOpacity={0.1} stroke="#383838" strokeWidth={1} />)}
    </g>
  );
}

function DesktopRTree({ progress }: ScrollDiagramProps): JSX.Element {
  const treeOpacity = phase(progress, 0.01, 0.07);
  const boundOpacity = phase(progress, 0.2, 0.08);
  const scan = phase(progress, 0.28, 0.14);
  const scanOpacity = phase(progress, 0.24, 0.05) * (1 - phase(progress, 0.46, 0.06));
  const candidateOpacity = phase(progress, 0.34, 0.06);
  const compareA = phase(progress, 0.44, 0.08);
  const compareB = phase(progress, 0.58, 0.08);
  const choice = phase(progress, 0.72, 0.08);
  const insert = phase(progress, 0.82, 0.14);
  const settled = phase(progress, 0.92, 0.06);
  const candidateRect = toSvgBox(CANDIDATE.shape.box, DESKTOP_CHIP);
  const scanTargetX = candidateRect.x + candidateRect.width / 2;
  const tokenX = mix(scanTargetX, 819, insert);
  const tokenY = mix(candidateRect.y + candidateRect.height / 2, 321, insert);

  return (
    <DiagramSvg className={styles.desktop} width={900} height={540} ariaLabel={`An R-tree indexes real MET2 rectangles from the demo ASIC. Inserting m2-y-source would enlarge leaf A by ${LEFT_ENLARGEMENT.toFixed(2)} square micrometers or leaf B by ${RIGHT_ENLARGEMENT.toFixed(2)} square micrometers, so leaf B is selected and updated.`} contentScale={1} inset={18}>
      <defs>
        <linearGradient id="rtree-scan-beam" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#fb4e7c" stopOpacity="0" /><stop offset="0.5" stopColor="#fb4e7c" stopOpacity="0.34" /><stop offset="1" stopColor="#fb4e7c" stopOpacity="0" /></linearGradient>
        <marker id="rtree-index-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke="#f0c557" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></marker>
      </defs>

      <text x="42" y="52" fill="#e8e8e8" fontFamily="monospace" fontSize="14" fontWeight="800">SAMPLE ASIC · ACTUAL MET2 RECTANGLES</text>
      <text x="602" y="52" textAnchor="end" fill="#777" fontFamily="monospace" fontSize="10">SOURCE SHA · {DEMO_ASIC_SCENE.sourceSha256.slice(0, 8)}</text>
      <ChipBase frame={DESKTOP_CHIP} />

      {LEFT_ENTRIES.map((entry, index) => <g key={entry.shape.id} opacity={phase(progress, 0.06 + index * 0.035, 0.06)}><PlotRect box={entry.shape.box} frame={DESKTOP_CHIP} fill={LEFT_COLOR} fillOpacity={0.22} stroke={LEFT_COLOR} strokeWidth={1.6} /></g>)}
      {RIGHT_ENTRIES.map((entry, index) => <g key={entry.shape.id} opacity={phase(progress, 0.095 + index * 0.035, 0.06)}><PlotRect box={entry.shape.box} frame={DESKTOP_CHIP} fill={RIGHT_COLOR} fillOpacity={0.2} stroke={RIGHT_COLOR} strokeWidth={1.6} /></g>)}
      <g opacity={boundOpacity}><MbbCorners box={LEFT_BOUND} frame={DESKTOP_CHIP} color={LEFT_COLOR} label="LEAF A · SAMPLE MBB" /><MbbCorners box={RIGHT_BOUND} frame={DESKTOP_CHIP} color={RIGHT_COLOR} label="LEAF B · SAMPLE MBB" /></g>

      <g opacity={scanOpacity} transform={`translate(${mix(DESKTOP_CHIP.x, scanTargetX, scan)} 0)`}><rect x="-28" y={DESKTOP_CHIP.y} width="56" height={DESKTOP_CHIP.height} fill="url(#rtree-scan-beam)" /><line y1={DESKTOP_CHIP.y} y2={DESKTOP_CHIP.y + DESKTOP_CHIP.height} stroke="#fb4e7c" strokeWidth="1.5" /></g>
      <g opacity={candidateOpacity}><PlotRect box={CANDIDATE.shape.box} frame={DESKTOP_CHIP} fill={CANDIDATE_COLOR} fillOpacity={0.26} stroke={CANDIDATE_COLOR} strokeWidth={2.2} /><text x={candidateRect.x + candidateRect.width / 2} y={candidateRect.y - 9} textAnchor="middle" fill={CANDIDATE_COLOR} fontFamily="monospace" fontSize="10" fontWeight="800">NEW · M2-Y-SOURCE</text></g>

      <g opacity={compareA * (1 - choice * 0.72)}><MbbCorners box={LEFT_PROPOSAL} frame={DESKTOP_CHIP} color={LEFT_COLOR} fillOpacity={0.035} strokeWidth={2.2} /></g>
      <g opacity={compareB * (1 - settled)}><MbbCorners box={RIGHT_PROPOSAL} frame={DESKTOP_CHIP} color={RIGHT_COLOR} fillOpacity={0.045} strokeWidth={2.2} /></g>
      <g opacity={settled}><MbbCorners box={RIGHT_PROPOSAL} frame={DESKTOP_CHIP} color={RIGHT_COLOR} fillOpacity={0.07} strokeWidth={2.4} /></g>

      <text x="642" y="52" fill="#e8e8e8" fontFamily="monospace" fontSize="14" fontWeight="800">R-TREE INDEX</text>
      <g opacity={treeOpacity}>
        <path d="M762 132V156M762 156L688 184M762 156L812 184" fill="none" stroke="#626262" strokeWidth="1.8" />
        <rect x="702" y="88" width="120" height="44" rx="5" fill="#111" stroke="#ddd" strokeWidth="1.5" /><text x="762" y="107" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="12" fontWeight="800">ROOT</text><text x="762" y="122" textAnchor="middle" fill="#777" fontFamily="monospace" fontSize="8">2 LEAF MBBs</text>
        <rect x="634" y="184" width="108" height="54" rx="5" fill="#101010" stroke={LEFT_COLOR} strokeWidth="1.5" /><text x="688" y="205" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="11" fontWeight="800">LEAF A</text><text x="688" y="222" textAnchor="middle" fill={LEFT_COLOR} fontFamily="monospace" fontSize="8">3 ENTRIES</text>
        <rect x="758" y="184" width="108" height="54" rx="5" fill="#101010" stroke={RIGHT_COLOR} strokeWidth="1.5" /><rect x="758" y="184" width="108" height="54" rx="5" fill="none" stroke={CANDIDATE_COLOR} strokeWidth="2.5" opacity={choice} /><text x="812" y="205" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="11" fontWeight="800">LEAF B</text><text x="812" y="222" textAnchor="middle" fill={RIGHT_COLOR} fontFamily="monospace" fontSize="8">{settled > 0.5 ? '4 ENTRIES' : '3 ENTRIES'}</text>
        {LEFT_ENTRIES.map((entry, index) => <g key={entry.shape.id} opacity={phase(progress, 0.06 + index * 0.035, 0.06)}><circle cx="645" cy={260 + index * 22} r="3" fill={LEFT_COLOR} /><text x="655" y={263 + index * 22} fill="#999" fontFamily="monospace" fontSize="8">{entry.label}</text></g>)}
        {RIGHT_ENTRIES.map((entry, index) => <g key={entry.shape.id} opacity={phase(progress, 0.095 + index * 0.035, 0.06)}><circle cx="769" cy={260 + index * 22} r="3" fill={RIGHT_COLOR} /><text x="779" y={263 + index * 22} fill="#999" fontFamily="monospace" fontSize="8">{entry.label}</text></g>)}
        <g opacity={settled}><circle cx="769" cy="326" r="3" fill={CANDIDATE_COLOR} /><text x="779" y="329" fill={CANDIDATE_COLOR} fontFamily="monospace" fontSize="8">{CANDIDATE.label}</text></g>
      </g>

      <g opacity={compareA}><rect x="42" y="354" width="262" height="78" rx="5" fill="#0d1215" stroke={LEFT_COLOR} strokeOpacity={0.65} /><text x="60" y="378" fill={LEFT_COLOR} fontFamily="monospace" fontSize="10" fontWeight="800">LEAF A · AREA ENLARGEMENT</text><text x="60" y="410" fill="#fff" fontFamily="monospace" fontSize="22" fontWeight="800">+{LEFT_ENLARGEMENT.toFixed(2)} µm²</text></g>
      <g opacity={compareB}><rect x="324" y="354" width="278" height="78" rx="5" fill="#15120b" stroke={choice ? CANDIDATE_COLOR : RIGHT_COLOR} strokeOpacity="0.78" /><text x="342" y="378" fill={RIGHT_COLOR} fontFamily="monospace" fontSize="10" fontWeight="800">LEAF B · AREA ENLARGEMENT</text><text x="342" y="410" fill="#fff" fontFamily="monospace" fontSize="22" fontWeight="800">+{RIGHT_ENLARGEMENT.toFixed(2)} µm²</text><text x="574" y="410" textAnchor="end" fill={CANDIDATE_COLOR} fontFamily="monospace" fontSize="10" fontWeight="800" opacity={choice}>MIN</text></g>

      <g opacity={insert > 0 && insert < 1 ? 1 : 0} transform={`translate(${tokenX} ${tokenY})`}><rect x="-7" y="-7" width="14" height="14" fill={CANDIDATE_COLOR} stroke="#fff" strokeWidth="1.3" /><path d="M10 0H28" stroke={CANDIDATE_COLOR} strokeWidth="1.5" markerEnd="url(#rtree-index-arrow)" /></g>
      <g opacity={phase(insert, 0.72, 0.28) * (1 - settled)} transform={`translate(819 321) scale(${mix(0.92, 1.35, phase(insert, 0.72, 0.28))})`}><circle r="22" fill="none" stroke={CANDIDATE_COLOR} strokeWidth="2" /></g>

      <text x="42" y="482" fill="#f2f2f2" fontFamily="monospace" fontSize="14" fontWeight="800">{stepLabel(progress)}</text>
      <text x="858" y="482" textAnchor="end" fill="#777" fontFamily="monospace" fontSize="9">CHOOSE THE LEAF WITH THE SMALLEST Δ AREA</text>
      <rect x="42" y="507" width="816" height="2" fill="#282828" /><g transform={`translate(42 507) scale(${progress} 1)`}><rect width="816" height="2" fill="#fb4e7c" /></g>
    </DiagramSvg>
  );
}

function MobileRTree(): JSX.Element {
  return (
    <DiagramSvg className={styles.mobile} width={360} height={600} ariaLabel={`Final phone view of the R-tree insertion: leaf B wins because ${RIGHT_ENLARGEMENT.toFixed(2)} square micrometers is less enlargement than ${LEFT_ENLARGEMENT.toFixed(2)} square micrometers.`} contentScale={1} inset={12}>
      <text x="24" y="34" fill="#e8e8e8" fontFamily="monospace" fontSize="13" fontWeight="800">SAMPLE ASIC · MET2</text>
      <text x="336" y="34" textAnchor="end" fill="#777" fontFamily="monospace" fontSize="9">ACTUAL RECTANGLES</text>
      <ChipBase frame={MOBILE_CHIP} />
      {LEFT_ENTRIES.map((entry) => <PlotRect key={entry.shape.id} box={entry.shape.box} frame={MOBILE_CHIP} fill={LEFT_COLOR} fillOpacity={0.22} stroke={LEFT_COLOR} strokeWidth={1.4} />)}
      {RIGHT_ENTRIES.map((entry) => <PlotRect key={entry.shape.id} box={entry.shape.box} frame={MOBILE_CHIP} fill={RIGHT_COLOR} fillOpacity={0.2} stroke={RIGHT_COLOR} strokeWidth={1.4} />)}
      <PlotRect box={CANDIDATE.shape.box} frame={MOBILE_CHIP} fill={CANDIDATE_COLOR} fillOpacity={0.26} stroke={CANDIDATE_COLOR} strokeWidth={1.8} />
      <MbbCorners box={LEFT_BOUND} frame={MOBILE_CHIP} color={LEFT_COLOR} fillOpacity={0.02} strokeWidth={1.5} />
      <MbbCorners box={RIGHT_PROPOSAL} frame={MOBILE_CHIP} color={RIGHT_COLOR} fillOpacity={0.05} strokeWidth={1.8} />

      <rect x="24" y="210" width="148" height="66" rx="5" fill="#0d1215" stroke={LEFT_COLOR} strokeOpacity="0.65" /><text x="36" y="232" fill={LEFT_COLOR} fontFamily="monospace" fontSize="9" fontWeight="800">LEAF A · Δ AREA</text><text x="36" y="260" fill="#fff" fontFamily="monospace" fontSize="18" fontWeight="800">+{LEFT_ENLARGEMENT.toFixed(2)} µm²</text>
      <rect x="188" y="210" width="148" height="66" rx="5" fill="#15120b" stroke={CANDIDATE_COLOR} strokeOpacity="0.82" /><text x="200" y="232" fill={RIGHT_COLOR} fontFamily="monospace" fontSize="9" fontWeight="800">LEAF B · Δ AREA</text><text x="200" y="260" fill="#fff" fontFamily="monospace" fontSize="18" fontWeight="800">+{RIGHT_ENLARGEMENT.toFixed(2)} µm²</text><text x="324" y="232" textAnchor="end" fill={CANDIDATE_COLOR} fontFamily="monospace" fontSize="8" fontWeight="800">MIN</text>

      <text x="24" y="310" fill="#e8e8e8" fontFamily="monospace" fontSize="13" fontWeight="800">R-TREE AFTER INSERT</text>
      <path d="M180 368V392M180 392L102 420M180 392L258 420" fill="none" stroke="#676767" strokeWidth="1.8" />
      <rect x="125" y="326" width="110" height="42" rx="5" fill="#111" stroke="#ddd" /><text x="180" y="351" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="12" fontWeight="800">ROOT</text>
      <rect x="42" y="420" width="120" height="68" rx="5" fill="#101010" stroke={LEFT_COLOR} strokeWidth="1.6" /><text x="102" y="447" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13" fontWeight="800">LEAF A</text><text x="102" y="469" textAnchor="middle" fill={LEFT_COLOR} fontFamily="monospace" fontSize="10">3 ENTRIES</text>
      <rect x="198" y="420" width="120" height="68" rx="5" fill="#101010" stroke={CANDIDATE_COLOR} strokeWidth="2.2" /><text x="258" y="447" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13" fontWeight="800">LEAF B</text><text x="258" y="469" textAnchor="middle" fill={RIGHT_COLOR} fontFamily="monospace" fontSize="10">4 ENTRIES</text>
      <path d="M258 488V512" stroke={CANDIDATE_COLOR} strokeWidth="1.6" /><rect x="216" y="512" width="84" height="34" rx="4" fill="#16120a" stroke={CANDIDATE_COLOR} /><text x="258" y="533" textAnchor="middle" fill={CANDIDATE_COLOR} fontFamily="monospace" fontSize="10" fontWeight="800">+ Y SRC</text>
      <text x="180" y="574" textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize="9">MINIMUM MBB ENLARGEMENT → INSERT</text>
    </DiagramSvg>
  );
}

export function RTreeInsertionDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  return <DiagramFrame label="R-tree insertion · sample ASIC" status=""><div className={styles.stage}><DesktopRTree progress={progress} /><MobileRTree /></div></DiagramFrame>;
}
