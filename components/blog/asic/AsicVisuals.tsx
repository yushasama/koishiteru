'use client';

import { useReducedMotion } from 'framer-motion';
import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { AsicAnatomyDiagram } from './AsicAnatomyDiagram';
import { DiagramFrame, DiagramProgress, DiagramSvg, type ScrollDiagramProps, useScrollDiagramState } from './DiagramPrimitives';
import { LayoutToNetsDiagram } from './LayoutToNetsDiagram';
import { IShapePolygonDiagram } from './IShapePolygonDiagram';
import { RTreeInsertionSequenceDiagram } from './RTreeInsertionSequenceDiagram';
import styles from './asic.module.css';
import surfaceStyles from '../styles/diagramSurfaces.module.css';

export type AsicVisualKey = 'challenge-pipeline' | 'and-gate' | 'layer-stack' | 'polygon-decomposition' | 'rtree' | 'cache' | 'circuit-morph' | 'scc-dag' | 'io-stream' | 'sat-basics' | 'sat-timeline' | 'verification' | 'result-decode' | 'showcase-video';

interface AsicStickyStoryProps {
  visualKey: AsicVisualKey;
  children: ReactNode;
}

const ASIC_WITNESS_BITS = '0000000101010000100000000000010101010000000000001010000001000001000000100000101000010000000100000010000010010001010000000' as const;
const ASIC_WITNESS_BLOCK_SIZE = 11;
const ASIC_WITNESS_BLOCKS: readonly string[] = Array.from({ length: ASIC_WITNESS_BITS.length / ASIC_WITNESS_BLOCK_SIZE }, (_, index) => ASIC_WITNESS_BITS.slice(index * ASIC_WITNESS_BLOCK_SIZE, (index + 1) * ASIC_WITNESS_BLOCK_SIZE));
const VERIFIED_WITNESS_SLICE = Array.from(ASIC_WITNESS_BITS.slice(7, 13), (value, index) => ({ cycle: index + 8, value: value === '1' ? '1' : '0' } as const));
const SCC_TIMING = { start: 0.08, duration: 0.84, dagStart: 0.58, dagDuration: 0.25 } as const;
const SAT_SUCCESS_AT = 0.91;
const RESULT_BLOCKS_END = 0.82;
const RESULT_REVEAL_AT = 0.84;
const RESULT_RESET_AT = 0.76;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const mix = (start: number, end: number, amount: number): number => start + (end - start) * amount;

function useVisibleActivation<T extends HTMLElement>(): { ref: React.RefObject<T>; active: boolean } {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, active };
}

function ChallengePipelineDiagram(): JSX.Element {
  return (
    <DiagramFrame label="The challenge" status="">
      <div className={styles.pipelineDiagram}><div className={styles.pipelineFlow}>
        <div className={styles.pipelineStage}>
          <span className={styles.pipelineStep}>01</span>
          <div className={styles.pipelineObject}>
            <svg className={styles.pipelineLayout} viewBox="0 0 120 92" role="img" aria-label="Schematic GDS geometry preview, not an actual layout extract">
              <g fill="#122128" stroke="#477584" strokeWidth="1"><path d="M10 12H48V30H28V56H10Z" /><path d="M58 12H110V30H78V47H58Z" /><path d="M40 42H50V66H110V82H40Z" /></g>
              <g fill="#153540" stroke="#63d6ff" strokeOpacity="0.8" strokeWidth="1"><path d="M20 4H30V74H20Z" /><path d="M68 20H78V62H98V72H68Z" /></g>
              <g fill="#a0d5df"><rect x="21" y="17" width="8" height="8" /><rect x="69" y="23" width="8" height="8" /><rect x="69" y="63" width="8" height="8" /></g>
            </svg>
          </div>
          <span className={styles.pipelineLabel}>RECOVER CIRCUIT<br /> FROM GDS</span>
        </div>
        <svg className={styles.pipelineConnector} viewBox="0 0 24 10" aria-hidden="true"><path d="M0 5H22M18 1L22 5L18 9" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
        <div className={styles.pipelineStage}>
          <span className={styles.pipelineStep}>02</span>
          <div className={styles.pipelineObject}><div className={styles.pipelineBits} role="img" aria-label="Unknown input bitstream"><span>?</span><span>?</span><span>?</span><span>?</span><span>?</span><span>?</span></div></div>
          <span className={styles.pipelineLabel}>SOMEHOW FIND<br /> THE RIGHT INPUT</span>
        </div>
        <svg className={styles.pipelineConnector} viewBox="0 0 24 10" aria-hidden="true"><path d="M0 5H22M18 1L22 5L18 9" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
        <div className={styles.pipelineStage}>
          <span className={styles.pipelineStep}>03</span>
          <div className={styles.pipelineObject}><div className={styles.pipelineOutput} role="img" aria-label="Eight-bit output bus, values still unknown"><strong>????????</strong></div></div>
          <span className={styles.pipelineLabel}>EXTRACT THE<br /> FINAL OUTPUT</span>
        </div>
      </div></div>
    </DiagramFrame>
  );
}

function AndGateDiagram(): JSX.Element {
  return (
    <DiagramFrame label="Logical Schematic of an AND Gate" status="">
      <div className={styles.andGateStage}>
      <DiagramSvg className={styles.andGateDesktop} width={760} height={350} ariaLabel="Inputs A and B enter a hardware AND gate and produce output Y only when both are one">
        <text x="72" y="80" fill="#fff" fontFamily="monospace" fontSize="15" fontWeight="700">INPUT PINS</text>
        <text x="688" y="67" textAnchor="end" fill="#a8a8a8" fontFamily="monospace" fontSize="13">HIGH = 1</text><text x="688" y="87" textAnchor="end" fill="#a8a8a8" fontFamily="monospace" fontSize="13">LOW = 0</text>
        <circle cx="112" cy="126" r="18" fill="#111" stroke="#63d6ff" /><text x="112" y="132" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="16" fontWeight="700">A</text>
        <circle cx="112" cy="202" r="18" fill="#111" stroke="#f0c557" /><text x="112" y="208" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="16" fontWeight="700">B</text>
        <path d="M130 126H280M130 202H280" fill="none" stroke="#676767" strokeWidth="3" />
        <g transform="translate(280 110)"><path d="M0 0H84C160 0 208 26 208 54S160 108 84 108H0Z" fill="#101010" stroke="#e8e8e8" strokeWidth="2" /><text x="91" y="61" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="18">AND</text></g>
        <path d="M488 164H590" fill="none" stroke="#e8e8e8" strokeWidth="3" />
        <circle cx="610" cy="164" r="20" fill="#111" stroke="#7ce5a8" strokeWidth="2" /><text x="610" y="169" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13">Y</text>
        <text x="380" y="280" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="18" fontWeight="700">BOTH INPUTS MUST BE HIGH</text>
        <text x="380" y="307" textAnchor="middle" fill="#7ce5a8" fontFamily="monospace" fontSize="18" fontWeight="700">FOR Y TO BE HIGH</text>
      </DiagramSvg>
      <DiagramSvg className={styles.andGateMobile} width={360} height={380} ariaLabel="Inputs A and B enter a hardware AND gate and produce output Y only when both are one" contentScale={1} inset={12}>
        <text x="28" y="42" fill="#fff" fontFamily="monospace" fontSize="15" fontWeight="700">INPUT PINS</text>
        <text x="332" y="34" textAnchor="end" fill="#a8a8a8" fontFamily="monospace" fontSize="12">HIGH = 1</text><text x="332" y="51" textAnchor="end" fill="#a8a8a8" fontFamily="monospace" fontSize="12">LOW = 0</text>
        <circle cx="54" cy="116" r="20" fill="#111" stroke="#63d6ff" strokeWidth="2" /><text x="54" y="122" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="17" fontWeight="700">A</text>
        <circle cx="54" cy="200" r="20" fill="#111" stroke="#f0c557" strokeWidth="2" /><text x="54" y="206" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="17" fontWeight="700">B</text>
        <path d="M74 116H130M74 200H130" fill="none" stroke="#676767" strokeWidth="2.5" />
        <g transform="translate(130 98)"><path d="M0 0H50C94 0 122 28 122 60S94 120 50 120H0Z" fill="#101010" stroke="#e8e8e8" strokeWidth="2" /><text x="53" y="66" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="16">AND</text></g>
        <path d="M252 158H298" fill="none" stroke="#e8e8e8" strokeWidth="2.5" />
        <circle cx="320" cy="158" r="21" fill="#111" stroke="#7ce5a8" strokeWidth="2" /><text x="320" y="164" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="15">Y</text>
        <text x="180" y="300" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14" fontWeight="700">BOTH INPUTS MUST BE HIGH</text>
        <text x="180" y="328" textAnchor="middle" fill="#7ce5a8" fontFamily="monospace" fontSize="14" fontWeight="700">FOR Y TO BE HIGH</text>
      </DiagramSvg>
      </div>
    </DiagramFrame>
  );
}

interface StateRegisterNode {
  id: StateRegisterId;
  x: number;
  y: number;
}

interface StateRegionNode {
  id: StateRegionId;
  registerCount: number;
  x: number;
  y: number;
}

type StateRegisterId = '34' | '35' | '36' | '37';
type StateRegionId = 'S20' | 'S0' | 'S4' | 'S3' | 'S19' | 'S1' | 'S2';

interface StateRegisterEdge {
  from: StateRegisterId;
  to: StateRegisterId;
}

interface StateRegionEdge {
  from: StateRegionId;
  to: StateRegionId;
  bend?: number;
}

const stateRegisterNodes: readonly StateRegisterNode[] = [
  { id: '34', x: 210, y: 199 },
  { id: '35', x: 410, y: 179 },
  { id: '36', x: 470, y: 354 },
  { id: '37', x: 235, y: 389 },
];

const stateRegisterEdges: readonly StateRegisterEdge[] = [
  { from: '34', to: '35' },
  { from: '35', to: '36' },
  { from: '36', to: '37' },
  { from: '37', to: '34' },
  { from: '34', to: '36' },
  { from: '35', to: '37' },
];
const stateRegionNodes: readonly StateRegionNode[] = [
  { id: 'S20', registerCount: 9, x: 110, y: 299 },
  { id: 'S0', registerCount: 1, x: 260, y: 194 },
  { id: 'S4', registerCount: 2, x: 260, y: 404 },
  { id: 'S3', registerCount: 4, x: 410, y: 194 },
  { id: 'S19', registerCount: 8, x: 580, y: 194 },
  { id: 'S1', registerCount: 1, x: 580, y: 324 },
  { id: 'S2', registerCount: 1, x: 580, y: 454 },
];
const stateRegionEdges: readonly StateRegionEdge[] = [
  { from: 'S20', to: 'S0' },
  { from: 'S20', to: 'S4' },
  { from: 'S20', to: 'S19', bend: -116 },
  { from: 'S0', to: 'S3' },
  { from: 'S0', to: 'S1', bend: 74 },
  { from: 'S3', to: 'S19' },
  { from: 'S4', to: 'S1', bend: -48 },
  { from: 'S4', to: 'S2', bend: 48 },
];
const mobileStateRegionNodes: readonly StateRegionNode[] = [
  { id: 'S20', registerCount: 9, x: 180, y: 105 },
  { id: 'S0', registerCount: 1, x: 90, y: 225 },
  { id: 'S4', registerCount: 2, x: 270, y: 225 },
  { id: 'S3', registerCount: 4, x: 90, y: 355 },
  { id: 'S1', registerCount: 1, x: 270, y: 355 },
  { id: 'S19', registerCount: 8, x: 90, y: 480 },
  { id: 'S2', registerCount: 1, x: 270, y: 480 },
];
const stateCollapseCenter = { x: 385, y: 299 } as const;

function graphEdgePath<T extends string>(nodes: readonly { id: T; x: number; y: number }[], edge: { from: T; to: T; bend?: number }, radius: number): string {
  const from = nodes.find((node) => node.id === edge.from);
  const to = nodes.find((node) => node.id === edge.to);
  if (!from || !to) return '';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 0.001) return '';
  const ux = dx / distance;
  const uy = dy / distance;
  const startX = from.x + ux * radius;
  const startY = from.y + uy * radius;
  const endX = to.x - ux * radius;
  const endY = to.y - uy * radius;
  if (!edge.bend) return `M${startX} ${startY}L${endX} ${endY}`;
  const controlX = (startX + endX) / 2 - uy * edge.bend;
  const controlY = (startY + endY) / 2 + ux * edge.bend;
  return `M${startX} ${startY}Q${controlX} ${controlY} ${endX} ${endY}`;
}

function StateRegister({ node, opacity, scale }: { node: StateRegisterNode; opacity: number; scale: number }): JSX.Element {
  return <g opacity={opacity} transform={`translate(${node.x} ${node.y}) scale(${scale})`}><circle r="32" fill="#101010" stroke="#b8b8b8" strokeWidth="1.5" /><text y="-3" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14" fontWeight="700">q{node.id}</text><text y="15" textAnchor="middle" fill="#a0a0a0" fontFamily="monospace" fontSize="10.5">DFXTP</text></g>;
}

function StateRegion({ node, largeText = false, opacity = 1, scale = 1 }: { node: StateRegionNode; largeText?: boolean; opacity?: number; scale?: number }): JSX.Element {
  const selected = node.id === 'S3';
  const radius = selected ? 34 : 30;
  return <g opacity={opacity} transform={`translate(${node.x} ${node.y}) scale(${scale})`}><circle r={radius} fill="#101010" stroke={selected ? '#63d6ff' : '#777'} strokeWidth={selected ? 2 : 1.4} /><text y="-4" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize={largeText ? 16 : 14} fontWeight="800">{node.id}</text><text y="15" textAnchor="middle" fill={selected ? '#63d6ff' : '#bbb'} fontFamily="monospace" fontSize={largeText ? 11 : 10.5}>{node.registerCount} reg{node.registerCount === 1 ? '' : 's'}</text></g>;
}

function SccDagDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const t = clamp((progress - SCC_TIMING.start) / SCC_TIMING.duration);
  const collapse = clamp((t - 0.12) / 0.38);
  const registerOpacity = 1 - clamp((collapse - 0.72) / 0.28);
  const registerScale = mix(1, 0.45, collapse);
  const condensedReveal = clamp((t - 0.34) / 0.18);
  const dagReveal = clamp((t - SCC_TIMING.dagStart) / SCC_TIMING.dagDuration);
  const rawTitleOpacity = 1 - clamp((t - 0.3) / 0.16);
  const middleTitleOpacity = Math.min(clamp((t - 0.3) / 0.12), 1 - clamp((t - 0.53) / 0.12));
  const movingRegisterNodes = stateRegisterNodes.map((node) => ({ ...node, x: mix(node.x, stateCollapseCenter.x, collapse), y: mix(node.y, stateCollapseCenter.y, collapse) }));
  const finalS3 = stateRegionNodes.find((node) => node.id === 'S3') ?? { id: 'S3' as const, registerCount: 4, x: 410, y: 150 };
  const movingS3 = { ...finalS3, x: mix(stateCollapseCenter.x, finalS3.x, dagReveal), y: mix(stateCollapseCenter.y, finalS3.y, dagReveal) };
  const movingRegionNodes = stateRegionNodes.map((node) => node.id === 'S3' ? movingS3 : node);

  return (
    <DiagramFrame label="State dependency" status="">
      <div className={styles.stateDagStage}>
      <DiagramSvg className={styles.stateDagDesktop} width={760} height={570} ariaLabel="A four-register dependency loop condenses into one node, followed by the simplified state dependency DAG" contentScale={1} progress={progress} progressEnd={SCC_TIMING.start + SCC_TIMING.duration * (SCC_TIMING.dagStart + SCC_TIMING.dagDuration)} progressLabel={dagReveal > 0.82 ? 'Register groups form the dependency DAG' : collapse > 0.72 ? 'Collapse the dependency loop into one SCC' : 'Trace register-to-register dependencies'} showBoard={false}>
        <defs><marker id="state-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke="#8a8a8a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></marker><marker id="state-dag-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke="#8a8a8a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></marker></defs>
        <g opacity={rawTitleOpacity}>
          <text x="52" y="58" fill="#e7e7e7" fontFamily="monospace" fontSize="14" fontWeight="800">1 · REAL REGISTER DEPENDENCY GRAPH</text>
          <text x="52" y="81" fill="#a0a0a0" fontFamily="monospace" fontSize="13">nodes = recovered registers · arrows = next-state influence</text>
        </g>
        <text x="52" y="58" opacity={middleTitleOpacity} fill="#e7e7e7" fontFamily="monospace" fontSize="14" fontWeight="800">4 REGISTERS → ONE DEPENDENCY GROUP</text>
        <g opacity={1 - collapse}>
          {stateRegisterEdges.map((edge) => <path key={`${edge.from}-${edge.to}`} d={graphEdgePath(movingRegisterNodes, edge, 30 * registerScale)} fill="none" stroke="#777" strokeWidth="1.7" markerEnd="url(#state-arrow)" />)}
        </g>
        {movingRegisterNodes.map((node) => <StateRegister key={node.id} node={node} opacity={registerOpacity} scale={registerScale} />)}

        <g opacity={dagReveal}>
          {stateRegionEdges.map((edge) => <path key={`${edge.from}-${edge.to}`} d={graphEdgePath(movingRegionNodes, edge, 34)} fill="none" stroke="#7b7b7b" strokeWidth="1.7" markerEnd="url(#state-dag-arrow)" />)}
          {movingRegionNodes.filter((node) => node.id !== 'S3').map((node) => <StateRegion key={node.id} node={node} opacity={dagReveal} scale={mix(0.82, 1, dagReveal)} />)}
        </g>
        <StateRegion node={movingS3} opacity={condensedReveal} scale={mix(0.72, 1, condensedReveal)} />

        <g opacity={dagReveal}>
          <text x="52" y="58" fill="#e7e7e7" fontFamily="monospace" fontSize="14" fontWeight="800">2 · SCC CONDENSATION DAG</text>
          <text x="52" y="81" fill="#a0a0a0" fontFamily="monospace" fontSize="13">each node groups registers that depend on one another</text>
        </g>
      </DiagramSvg>
      <DiagramSvg className={styles.stateDagMobile} width={360} height={620} ariaLabel="A phone-friendly view of the simplified state dependency DAG" contentScale={1} inset={12} progress={1} progressLabel="Register groups form the dependency DAG" showBoard={false}>
        <defs><marker id="state-mobile-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke="#8a8a8a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></marker></defs>
        <text x="24" y="38" fill="#e7e7e7" fontFamily="monospace" fontSize="12" fontWeight="800">SCC CONDENSATION DAG</text>
        <text x="24" y="58" fill="#a0a0a0" fontFamily="monospace" fontSize="10.5">register groups · next-state influence</text>
        {stateRegionEdges.map((edge) => <path key={`${edge.from}-${edge.to}`} d={graphEdgePath(mobileStateRegionNodes, edge, 34)} fill="none" stroke="#777" strokeWidth="1.7" markerEnd="url(#state-mobile-arrow)" />)}
        {mobileStateRegionNodes.map((node) => <StateRegion key={node.id} node={node} largeText />)}
      </DiagramSvg>
      </div>
    </DiagramFrame>
  );
}

function SatBasicsDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const rows = [{ a: '0', b: '0', output: '0' }, { a: '0', b: '1', output: '0' }, { a: '1', b: '0', output: '0' }, { a: '1', b: '1', output: '1' }] as const;
  const activeRowIndex = Math.min(rows.length - 1, Math.floor(clamp(progress) * rows.length));
  const activeRow = rows[activeRowIndex];
  const satisfiesTarget = activeRow.output === '1';
  return (
    <DiagramFrame label="SAT intuition" status="">
      <div className={styles.satSequence} aria-label="Walk through the four AND-gate truth-table assignments. The first three produce zero and do not satisfy the required target. A equals one and B equals one produce success equals one.">
        <div className={styles.satSchematic} data-output={activeRow.output}>
          <div className={styles.satInputs}><span><small>CURRENT ASSIGNMENT</small><b>A = {activeRow.a}</b></span><span><small>CURRENT ASSIGNMENT</small><b>B = {activeRow.b}</b></span></div>
          <div className={styles.satInputWires} aria-hidden="true"><i /><i /></div>
          <div className={styles.satAndGate}><svg viewBox="0 0 148 92" aria-hidden="true"><defs><linearGradient id="sat-gate-tint" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--sat-wire-color)" stopOpacity="0.2" /><stop offset="0.52" stopColor="var(--sat-wire-color)" stopOpacity="0.08" /><stop offset="1" stopColor="var(--sat-wire-color)" stopOpacity="0.015" /></linearGradient></defs><path d="M0 8h60c54 0 88 18 88 38s-34 38-88 38H0z" /><text x="65" y="52" textAnchor="middle">AND</text></svg></div>
          <i className={styles.satOutputWire} aria-hidden="true" />
          <div className={styles.satTarget} data-output={activeRow.output}><small>GATE OUTPUT</small><b>success = {activeRow.output}</b></div>
        </div>
        <div className={styles.truthTable}>
          <div className={styles.truthHead}><span>A</span><span>B</span><span>success</span></div>
          {rows.map((row, index) => {
            const active = index === activeRowIndex;
            const eliminated = index < activeRowIndex && row.output === '0';
            return <div key={`${row.a}${row.b}`} className={styles.truthRow} data-active={active} data-valid={active && row.output === '1'} data-eliminated={eliminated} data-output={active ? row.output : undefined} aria-current={active ? 'step' : undefined}><span>{row.a}</span><span>{row.b}</span><span>{row.output}</span></div>;
          })}
        </div>
        <div className={styles.satConclusion}>{satisfiesTarget ? <><b>A = 1</b> and <b>B = 1</b> are the only values consistent with required <b>success = 1</b>.</> : <>This row produces <b className={styles.satRejected}>success = 0</b>, so it cannot satisfy the required target.</>}</div>
        <DiagramProgress progress={progress} progressEnd={(rows.length - 1) / rows.length} />
      </div>
    </DiagramFrame>
  );
}

function SatTimelineTints({ id }: { id: string }): JSX.Element {
  return <>
    <linearGradient id={`${id}-replay`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#63b5ff" stopOpacity="0.13" /><stop offset="1" stopColor="#63b5ff" stopOpacity="0.025" /></linearGradient>
    <linearGradient id={`${id}-bit`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fb4e7c" stopOpacity="0.17" /><stop offset="1" stopColor="#fb4e7c" stopOpacity="0.025" /></linearGradient>
    <linearGradient id={`${id}-shimmer`}><stop stopColor="#ffd8e2" stopOpacity="0" /><stop offset="0.5" stopColor="#ffd8e2" stopOpacity="0.16" /><stop offset="1" stopColor="#ffd8e2" stopOpacity="0" /></linearGradient>
    <linearGradient id={`${id}-success-shimmer`}><stop stopColor="#ceffe0" stopOpacity="0" /><stop offset="0.5" stopColor="#ceffe0" stopOpacity="0.2" /><stop offset="1" stopColor="#ceffe0" stopOpacity="0" /></linearGradient>
    <linearGradient id={`${id}-success`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7ce5a8" stopOpacity="0.21" /><stop offset="0.6" stopColor="#7ce5a8" stopOpacity="0.08" /><stop offset="1" stopColor="#7ce5a8" stopOpacity="0.025" /></linearGradient>
  </>;
}

function SatTimelineDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const unrollProgress = clamp((progress - 0.04) / 0.18);
  const targetProgress = clamp((progress - 0.22) / 0.12);
  const witnessProgress = clamp((progress - 0.34) / 0.12);
  const feedProgress = clamp((progress - 0.48) / 0.3);
  const fedCount = feedProgress <= 0 ? 0 : Math.min(VERIFIED_WITNESS_SLICE.length, Math.ceil(feedProgress * VERIFIED_WITNESS_SLICE.length));
  const activeIndex = Math.max(0, fedCount - 1);
  const activeBit = VERIFIED_WITNESS_SLICE[activeIndex];
  const witnessChosen = witnessProgress >= 0.5;
  const success = progress >= SAT_SUCCESS_AT;
  const status = success ? 'Target reached at cycle 122' : fedCount ? `Replay witness cycle ${activeBit.cycle}: I = ${activeBit.value}` : witnessChosen ? 'Z3 returns one globally consistent witness' : targetProgress > 0.5 ? 'Constrain success₁ ∨ … ∨ success₁₂₂ = 1' : unrollProgress > 0.1 ? 'Unroll recovered transitions forward across the bound' : 'Reset the recovered circuit at cycle 0';
  return (
    <DiagramFrame label="Bounded reachability" status="">
      <DiagramSvg className={styles.satTimelineDesktop} width={920} height={500} ariaLabel="The implementation resets at cycle zero, unrolls the recovered transition relation forward across a 123-cycle bound, constrains success to be one at an eligible cycle, and asks Z3 for one globally consistent trace. A verified slice is then replayed forward one enabled input bit per clock; success is first observed at cycle 122." progress={progress} progressEnd={SAT_SUCCESS_AT} progressLabel={status} showBoard={false}>
        <defs><marker id="time-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0 0L8 3L0 6z" fill="#777" /></marker><SatTimelineTints id="timeline" /></defs>
        <g transform="translate(0 -24)">

        <rect x="54" y="42" width="812" height="132" rx="8" fill="#090909" stroke="#2e2e2e" />
        <text x="76" y="95" fill="#929292" fontFamily="monospace" fontSize="12">7 EARLIER BITS</text><path d="M146 114H174" stroke="#444" strokeWidth="1.5" markerEnd="url(#time-arrow)" />
        {VERIFIED_WITNESS_SLICE.map((bit, index) => {
          const x = 184 + index * 82;
          const fed = index < fedCount;
          const active = index === activeIndex && fedCount > 0 && !success;
          return <g key={bit.cycle} opacity={mix(0.5, 1, witnessProgress)}>
            <rect x={x} y="84" width="64" height="66" rx="5" fill={fed ? 'url(#timeline-bit)' : '#111'} stroke={active ? '#ff9db8' : fed ? '#ad3e5c' : witnessChosen ? '#626262' : '#363636'} strokeWidth="1.2" />
            {active && <g clipPath={`url(#timeline-bit-${bit.cycle})`} aria-hidden="true"><defs><clipPath id={`timeline-bit-${bit.cycle}`}><rect x={x} y="84" width="64" height="66" rx="5" /></clipPath></defs><rect className={styles.satBitShimmer} x={x} y="84" width="64" height="66" fill="url(#timeline-shimmer)" /></g>}
            <text x={x + 32} y="104" textAnchor="middle" fill={fed ? '#d0d0d0' : '#898989'} fontFamily="monospace" fontSize="11.5">CYCLE {bit.cycle.toString().padStart(2, '0')}</text><text x={x + 32} y="136" textAnchor="middle" fill={fed ? '#fff' : witnessChosen ? '#bbb' : '#888'} fontFamily="monospace" fontSize="25" fontWeight="800">{witnessChosen ? bit.value : '?'}</text>{index < VERIFIED_WITNESS_SLICE.length - 1 && <path d={`M${x + 64} 117H${x + 78}`} stroke={fed ? '#fb4e7c' : '#444'} strokeWidth="1.4" />}
          </g>;
        })}
        <path d="M658 117H686" stroke="#444" strokeWidth="1.5" markerEnd="url(#time-arrow)" /><text x="706" y="109" fill="#999" fontFamily="monospace" fontSize="20">…</text><text x="706" y="130" fill="#929292" fontFamily="monospace" fontSize="12">108 LATER BITS</text>

        <path d="M460 174V226H351V244" fill="none" stroke="#666" strokeWidth="1.7" markerEnd="url(#time-arrow)" />
        <rect x="54" y="248" width="594" height="112" rx="8" fill="url(#timeline-replay)" stroke="#426584" />
        <text x="351" y="278" textAnchor="middle" fill="#99bbd4" fontFamily="monospace" fontSize="13">{fedCount ? 'FORWARD REPLAY · ONE ENABLED CLOCK' : 'UNROLL FORWARD · ONE TRANSITION PER CYCLE'}</text>
        <text x="351" y="309" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="20" fontWeight="800">S<tspan baselineShift="sub" fontSize="12">t</tspan> + I<tspan baselineShift="sub" fontSize="12">t</tspan> → RECOVERED CIRCUIT → S<tspan baselineShift="sub" fontSize="12">t+1</tspan></text>
        <text x="351" y="338" textAnchor="middle" fill="#85a4ba" fontFamily="monospace" fontSize="12">{fedCount ? `replay I = ${activeBit.value} at cycle ${activeBit.cycle}` : targetProgress > 0.5 ? 'add the bounded target, then solve all cycles together' : 'reset S₀, then add each recovered transition'}</text>

        <path d="M648 304H702" stroke="#666" strokeWidth="1.7" markerEnd="url(#time-arrow)" />
        <rect x="704" y="268" width="162" height="72" rx="8" fill={success ? 'url(#timeline-success)' : '#121212'} stroke={success ? '#609d78' : '#484848'} strokeWidth={success ? 1.35 : 1.2} />
        {success && <g clipPath="url(#timeline-success-clip)" aria-hidden="true"><defs><clipPath id="timeline-success-clip"><rect x="704" y="268" width="162" height="72" rx="8" /></clipPath></defs><rect className={styles.satBitShimmer} x="704" y="268" width="162" height="72" fill="url(#timeline-success-shimmer)" /></g>}
        <text x="785" y="311" textAnchor="middle" fill={success ? '#8dc8a4' : '#ddd'} fontFamily="monospace" fontSize="21" fontWeight="800">success = {success ? '1' : '0'}</text>

        <text x="351" y="385" textAnchor="middle" fill={targetProgress > 0.5 ? '#7ce5a8' : '#777'} fontFamily="monospace" fontSize="15" fontWeight="760" opacity={mix(0.3, 1, targetProgress)}>TARGET · success₁ ∨ … ∨ success₁₂₂ = 1</text>
        </g>
      </DiagramSvg>
      <DiagramSvg className={styles.satTimelineMobile} width={360} height={500} ariaLabel="The recovered transition relation is unrolled forward, success is constrained within the bound, and Z3 chooses one globally consistent trace. A verified slice of cycles eight through thirteen is then replayed one enabled input bit per clock; success is first observed at cycle 122." progress={progress} progressEnd={SAT_SUCCESS_AT} progressLabel={status} showBoard={false}>
        <defs><marker id="time-arrow-mobile" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0 0L8 3L0 6z" fill="#777" /></marker><SatTimelineTints id="timeline-mobile" /></defs>
        <rect x="18" y="30" width="324" height="112" rx="7" fill="#090909" stroke="#2e2e2e" />
        {VERIFIED_WITNESS_SLICE.map((bit, index) => {
          const x = 28 + index * 52;
          const fed = index < fedCount;
          const active = index === activeIndex && fedCount > 0 && !success;
          return <g key={bit.cycle} opacity={mix(0.5, 1, witnessProgress)}>
            <rect x={x} y="54" width="42" height="62" rx="4" fill={fed ? 'url(#timeline-mobile-bit)' : '#111'} stroke={active ? '#ff9db8' : fed ? '#ad3e5c' : witnessChosen ? '#626262' : '#363636'} strokeWidth="1.1" />
            {active && <g clipPath={`url(#timeline-mobile-bit-${bit.cycle})`} aria-hidden="true"><defs><clipPath id={`timeline-mobile-bit-${bit.cycle}`}><rect x={x} y="54" width="42" height="62" rx="4" /></clipPath></defs><rect className={styles.satBitShimmer} x={x} y="54" width="42" height="62" fill="url(#timeline-mobile-shimmer)" /></g>}
            <text x={x + 21} y="74" textAnchor="middle" fill={fed ? '#d0d0d0' : '#999'} fontFamily="monospace" fontSize="10.5">C{bit.cycle.toString().padStart(2, '0')}</text><text x={x + 21} y="104" textAnchor="middle" fill={fed ? '#fff' : witnessChosen ? '#bbb' : '#888'} fontFamily="monospace" fontSize="21" fontWeight="800">{witnessChosen ? bit.value : '?'}</text>
          </g>;
        })}
        <text x="180" y="132" textAnchor="middle" fill="#a0a0a0" fontFamily="monospace" fontSize="11.5">7 EARLIER BITS · 108 LATER BITS</text>
        <path d="M180 142V192" stroke="#666" strokeWidth="1.5" markerEnd="url(#time-arrow-mobile)" />
        <rect x="34" y="196" width="292" height="94" rx="7" fill="url(#timeline-mobile-replay)" stroke="#426584" />
        <text x="180" y="222" textAnchor="middle" fill="#99bbd4" fontFamily="monospace" fontSize="11.5">{fedCount ? 'FORWARD REPLAY · ONE CLOCK' : 'UNROLL FORWARD · ONE TRANSITION'}</text>
        <text x="180" y="251" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14" fontWeight="800">S<tspan baselineShift="sub" fontSize="11">t</tspan> + I<tspan baselineShift="sub" fontSize="11">t</tspan> → CIRCUIT → S<tspan baselineShift="sub" fontSize="11">t+1</tspan></text>
        <text x="180" y="274" textAnchor="middle" fill="#85a4ba" fontFamily="monospace" fontSize="11.5">{fedCount ? `replay I = ${activeBit.value} at cycle ${activeBit.cycle}` : targetProgress > 0.5 ? 'constrain target · solve all cycles' : 'reset S₀ · add each transition'}</text>
        <path d="M180 290V316" stroke="#666" strokeWidth="1.5" markerEnd="url(#time-arrow-mobile)" />
        <rect x="80" y="324" width="200" height="66" rx="7" fill={success ? 'url(#timeline-mobile-success)' : '#121212'} stroke={success ? '#609d78' : '#484848'} strokeWidth={success ? 1.35 : 1.2} />
        {success && <g clipPath="url(#timeline-mobile-success-clip)" aria-hidden="true"><defs><clipPath id="timeline-mobile-success-clip"><rect x="80" y="324" width="200" height="66" rx="7" /></clipPath></defs><rect className={styles.satBitShimmer} x="80" y="324" width="200" height="66" fill="url(#timeline-mobile-success-shimmer)" /></g>}
        <text x="180" y="364" textAnchor="middle" fill={success ? '#8dc8a4' : '#ddd'} fontFamily="monospace" fontSize="19" fontWeight="800">success = {success ? '1' : '0'}</text>
        <text x="180" y="422" textAnchor="middle" fill={targetProgress > 0.5 ? '#7ce5a8' : '#888'} fontFamily="monospace" fontSize="11.5" fontWeight="760" opacity={mix(0.3, 1, targetProgress)}>TARGET · success₁ ∨ … ∨ success₁₂₂ = 1</text>
      </DiagramSvg>
    </DiagramFrame>
  );
}

function CacheDiagram(): JSX.Element {
  return <DiagramFrame label="Caching mechanism" status="Content-addressed extraction"><div className={styles.cacheFlow}><div className={styles.cacheSource}><small>FINGERPRINT THESE INPUTS</small><div className={styles.fileStack}><span>puzzle.gds</span><span>extractor.py</span><span>technology + vias</span><span>cache version</span></div></div><span className={styles.flowArrow} aria-hidden="true">→</span><div className={styles.hashBox}><small>SHA-256 CONTENT KEY</small><strong>7f31…a9c2</strong></div><span className={styles.flowArrow} aria-hidden="true">→</span><div className={styles.cacheBranches}><small>CACHE LOOKUP</small><div className={styles.cacheBranch} data-route="hit"><b>HIT</b><span>load connectivity state</span></div><div className={styles.cacheBranch} data-route="miss"><b>MISS</b><span>rebuild + save</span></div></div></div></DiagramFrame>;
}

function IoStreamDiagram(): JSX.Element {
  const sampleBits = [ASIC_WITNESS_BITS[0], ASIC_WITNESS_BITS[1], ASIC_WITNESS_BITS[2], '···', ASIC_WITNESS_BITS.at(-1) ?? '0'];
  const signalArrowProps = { fill: 'none', stroke: '#fb4e7c', strokeWidth: 1.35, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, markerEnd: 'url(#io-arrow-clean)' };

  return (
    <DiagramFrame label="Recovered circuit I/O" status="">
      <div className={styles.ioMobile} aria-hidden="true"><div className={styles.ioSequence}><strong>I₀ I₁ I₂ ··· I₁₂₀</strong><span>{sampleBits.join(' ')}</span></div><span className={styles.mobileReplayStep}>↓ CLOCKED REPLAY</span><div className={styles.mobileHardware}><small>RECOVERED CIRCUIT</small><strong>SKY130 logic</strong><span>read qₜ now · save qₜ₊₁ for the next clock</span></div><span className={styles.mobileReplayStep}>↓ OBSERVE HARDWARE</span><div className={styles.mobileOutputs}><span><i />success</span><span><i />O[7:0]</span></div></div>
      <DiagramSvg width={820} height={330} ariaLabel="Each clock supplies one input bit while the circuit reads its current state, computes outputs, and stores the next state" className={styles.ioDesktop}>
        <defs><marker id="io-arrow-clean" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke="#fb4e7c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" /></marker></defs>
        <rect x="58" y="62" width="194" height="166" fill="#101010" stroke="#63d6ff" />
        <text x="155" y="92" textAnchor="middle" fill="#999" fontFamily="monospace" fontSize="12">TIME →</text>
        {['I₀', 'I₁', 'I₂', '···', 'I₁₂₀'].map((cycle, index) => <g key={cycle} transform={`translate(${72 + index * 34} 112)`}><text x="13" y="0" textAnchor="middle" fill="#999" fontFamily="monospace" fontSize="10.5">{cycle}</text><rect x="0" y="10" width="26" height="32" fill={cycle === '···' ? '#0c0c0c' : '#111'} stroke={cycle === '···' ? '#343434' : '#63d6ff'} strokeOpacity="0.75" /><text x="13" y="32" textAnchor="middle" fill={cycle === '···' ? '#888' : '#fff'} fontFamily="monospace" fontSize="12">{sampleBits[index]}</text></g>)}
        <path d="M252 120H318" {...signalArrowProps} />

        <rect x="288" y="64" width="260" height="202" fill="#0d0d0d" stroke="#454545" />
        <text x="418" y="91" textAnchor="middle" fill="#999" fontFamily="monospace" fontSize="12">RECOVERED SEQUENTIAL CIRCUIT</text>
        <rect x="325" y="112" width="186" height="56" fill="#15110f" stroke="#e9b94f" /><text x="418" y="136" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13">SKY130 LOGIC</text><text x="418" y="155" textAnchor="middle" fill="#c0a875" fontFamily="monospace" fontSize="11">compute this clock</text>
        <rect x="356" y="197" width="124" height="42" fill="#0e1513" stroke="#7ce5a8" /><text x="418" y="215" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="12">STATE qₜ</text><text x="418" y="232" textAnchor="middle" fill="#85b69f" fontFamily="monospace" fontSize="10.5">register values</text>
        <path d="M390 168V197" {...signalArrowProps} /><path d="M446 197V168" {...signalArrowProps} />
        <text x="382" y="186" textAnchor="end" fill="#fff" fontFamily="monospace" fontSize="10.5">WRITE NEXT</text><text x="454" y="186" fill="#fff" fontFamily="monospace" fontSize="10.5">READ NOW</text>

        <path d="M511 130H570V116H608" {...signalArrowProps} /><path d="M511 150H570V218H608" {...signalArrowProps} />
        <rect x="610" y="82" width="154" height="68" fill="#101010" stroke="#7ce5a8" /><circle cx="634" cy="116" r="6" fill="none" stroke="#7ce5a8" strokeOpacity="0.5" strokeWidth="0.75" vectorEffect="non-scaling-stroke" /><circle cx="634" cy="116" r="2.5" fill="#7ce5a8" /><text x="656" y="112" fill="#999" fontFamily="monospace" fontSize="11.5">1-BIT DECISION</text><text x="656" y="133" fill="#fff" fontFamily="monospace" fontSize="13">success</text>
        <rect x="610" y="184" width="154" height="68" fill="#101010" stroke="#bd75ff" /><path d="M626 218H644" stroke="#bd75ff" strokeWidth="7" /><text x="656" y="214" fill="#999" fontFamily="monospace" fontSize="11.5">8-BIT OUTPUT BUS</text><text x="656" y="235" fill="#fff" fontFamily="monospace" fontSize="13">O[7:0]</text>
      </DiagramSvg>
    </DiagramFrame>
  );
}

function VerificationDiagram(): JSX.Element {
  const { ref, active } = useVisibleActivation<HTMLElement>();
  return <section ref={ref} className={styles.verificationFigure} data-active={active} aria-label="The exact SAT witness is replayed through separately implemented Z3 and structural Verilog paths. Both consume the same recovered circuit and must report success at the same cycle."><header><span>Cross-implementation replay</span></header><div className={styles.verificationFlow}><div className={styles.sharedWitness}><strong>{ASIC_WITNESS_BLOCKS[0]} … {ASIC_WITNESS_BLOCKS.at(-1)}</strong><span>same exact bits</span></div><div className={styles.modelFork} aria-hidden="true"><i /><i /></div><div className={styles.modelCards}><article><small>FORMAL PATH</small><strong>Z3 transition model</strong><p>predicts <b>success = 1</b> at cycle T</p><span className={styles.successLamp}><i />SUCCESS @ T</span></article><article><small>STRUCTURAL REPLAY</small><strong>Generated Verilog</strong><p>official SKY130 models · Icarus</p><span className={styles.successLamp}><i />SUCCESS @ T</span></article></div><div className={styles.matchLine}><span>cycle T</span><i /><strong>MATCH</strong><i /><span>cycle T</span></div></div></section>;
}

function resultBlockStyle(progress: number, index: number): React.CSSProperties {
  const scaled = clamp(progress / RESULT_BLOCKS_END) * ASIC_WITNESS_BLOCKS.length;
  const activeIndex = progress >= RESULT_BLOCKS_END ? ASIC_WITNESS_BLOCKS.length : Math.min(ASIC_WITNESS_BLOCKS.length - 1, Math.floor(scaled));
  if (index < activeIndex) return { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' };
  if (index > activeIndex) return { opacity: 0, transform: 'translate3d(0, 10px, 0) scale(0.96)' };
  const localProgress = scaled - activeIndex;
  const bounce = Math.sin(localProgress * Math.PI);
  return { opacity: 0.28 + localProgress * 0.72, transform: `translate3d(0, ${(1 - localProgress) * 10 - bounce * 7}px, 0) scale(${1 + bounce * 0.055})` };
}

function ResultDecode({ progress }: ScrollDiagramProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [payoffComplete, setPayoffComplete] = useState(false);

  useEffect(() => {
    // Separate trigger/reset thresholds prevent trackpad jitter from restarting the payoff.
    if (progress >= RESULT_REVEAL_AT) setRevealed(true);
    else if (progress < RESULT_RESET_AT) {
      setRevealed(false);
      setPayoffComplete(false);
    }
  }, [progress]);

  return (
    <DiagramFrame label="SOLUTION" status="">
      <section className={`${styles.resultFigure} ${surfaceStyles.coolVerificationSurface}`} aria-label="The verified 121-bit witness is revealed one 11-bit block at a time before producing the OCaml comment two stars">
        <div className={styles.resultBits}>{ASIC_WITNESS_BLOCKS.map((block, index) => <span key={`${block}-${index}`} style={resultBlockStyle(progress, index)}>{block}</span>)}</div>
        <div className={styles.resultText} role="img" aria-label="(* TWO STARS *)" data-revealed={reduceMotion || revealed} data-reduced-motion={Boolean(reduceMotion)}>
          <span className={styles.resultBracket} aria-hidden="true">(*</span>
          <strong className={styles.resultWord} aria-hidden="true">
            <span className={styles.resultWordBase} onAnimationEnd={() => setPayoffComplete(true)}>TWO STARS</span>
            {[0, 1, 2].map((slice) => <span key={slice} className={styles.resultSlice} data-slice={slice}>TWO STARS</span>)}
            <span className={styles.resultShine}>TWO STARS</span>
          </strong>
          <span className={styles.resultBracket} aria-hidden="true">*)</span>
        </div>
        <DiagramProgress progress={reduceMotion || (revealed && payoffComplete && progress >= RESULT_REVEAL_AT) ? 1 : Math.min(progress, RESULT_REVEAL_AT)} />
      </section>
    </DiagramFrame>
  );
}

function ShowcaseVideo(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => undefined);
      else video.pause();
    }, { threshold: 0.45 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return <figure className={styles.showcaseVideo}><video ref={videoRef} src="/blog/asic-reverse-engineering/jsc-asic-showcase-1080p.mp4" controls loop playsInline preload="metadata" aria-label="Real ASIC layer stack assembling, exploding, orbiting, and collapsing" /><figcaption><div className={styles.showcaseCaptionCopy}><small>The grid lines were added as a visual aid to make the separation between layers easier to see.</small></div></figcaption></figure>;
}

function VisualForKey({ visualKey, progress }: { visualKey: AsicVisualKey; progress: number }): JSX.Element {
  if (visualKey === 'challenge-pipeline') return <ChallengePipelineDiagram />;
  if (visualKey === 'and-gate') return <AndGateDiagram />;
  if (visualKey === 'layer-stack') return <AsicAnatomyDiagram progress={progress} />;
  if (visualKey === 'polygon-decomposition') return <IShapePolygonDiagram progress={progress} />;
  if (visualKey === 'rtree') return <RTreeInsertionSequenceDiagram progress={progress} />;
  if (visualKey === 'circuit-morph') return <LayoutToNetsDiagram progress={progress} />;
  if (visualKey === 'scc-dag') return <SccDagDiagram progress={progress} />;
  if (visualKey === 'sat-basics') return <SatBasicsDiagram progress={progress} />;
  if (visualKey === 'sat-timeline') return <SatTimelineDiagram progress={progress} />;
  if (visualKey === 'cache') return <CacheDiagram />;
  if (visualKey === 'io-stream') return <IoStreamDiagram />;
  if (visualKey === 'verification') return <VerificationDiagram />;
  if (visualKey === 'result-decode') return <ResultDecode progress={progress} />;
  return <ShowcaseVideo />;
}

export function AsicStickyStory({ visualKey, children }: AsicStickyStoryProps): JSX.Element {
  const { ref, scrollState } = useScrollDiagramState();
  return <section ref={ref} className={styles.stickyStory} data-visual={visualKey} data-scroll-progress={scrollState.progress.toFixed(3)} data-scroll-start={scrollState.atStart} data-scroll-end={scrollState.atEnd}><div className={styles.stickyCopy}>{children}</div><div className={styles.stickyVisual} data-sticky-visual><VisualForKey visualKey={visualKey} progress={scrollState.progress} /></div></section>;
}

export function AsicInlineVisual({ visualKey }: { visualKey: AsicVisualKey }): JSX.Element {
  if (visualKey === 'polygon-decomposition' || visualKey === 'rtree' || visualKey === 'sat-basics' || visualKey === 'result-decode') return <AsicAnimatedInlineVisual visualKey={visualKey} />;
  return <div className={styles.inlineVisual} data-visual={visualKey}><VisualForKey visualKey={visualKey} progress={1} /></div>;
}

function AsicAnimatedInlineVisual({ visualKey }: { visualKey: AsicVisualKey }): JSX.Element {
  const { ref, scrollState } = useScrollDiagramState(visualKey === 'sat-basics' ? 0.08 : 0);
  return <section ref={ref} className={`${styles.inlineVisual} ${styles.inlineAnimatedVisual}`} data-visual={visualKey} data-scroll-progress={scrollState.progress.toFixed(3)} data-scroll-start={scrollState.atStart} data-scroll-end={scrollState.atEnd}><div className={styles.inlineAnimatedFrame} data-sticky-visual><VisualForKey visualKey={visualKey} progress={scrollState.progress} /></div></section>;
}
