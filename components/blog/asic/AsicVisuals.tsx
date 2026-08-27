'use client';

import { useReducedMotion } from 'framer-motion';
import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { AsicAnatomyDiagram } from './AsicAnatomyDiagram';
import { DiagramFrame, DiagramSvg, type ScrollDiagramProps, scrollRevealStyle, useScrollDiagramState } from './DiagramPrimitives';
import { LayoutToNetsDiagram } from './LayoutToNetsDiagram';
import { RTreeInsertionDiagram } from './RTreeInsertionDiagram';
import styles from './asic.module.css';
import surfaceStyles from '../styles/diagramSurfaces.module.css';

export type AsicVisualKey = 'challenge-pipeline' | 'and-gate' | 'layer-stack' | 'rtree' | 'cache' | 'circuit-morph' | 'scc-dag' | 'io-stream' | 'sat-basics' | 'sat-timeline' | 'verification' | 'result-decode' | 'showcase-video';

interface AsicStickyStoryProps {
  visualKey: AsicVisualKey;
  children: ReactNode;
}

const ASIC_WITNESS_BITS = '0000000101010000100000000000010101010000000000001010000001000001000000100000101000010000000100000010000010010001010000000' as const;
const ASIC_WITNESS_BLOCK_SIZE = 11;
const ASIC_WITNESS_BLOCKS: readonly string[] = Array.from({ length: ASIC_WITNESS_BITS.length / ASIC_WITNESS_BLOCK_SIZE }, (_, index) => ASIC_WITNESS_BITS.slice(index * ASIC_WITNESS_BLOCK_SIZE, (index + 1) * ASIC_WITNESS_BLOCK_SIZE));

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
  const stages = [
    { number: '01', lines: ['RECOVER CIRCUIT', 'FROM GDS'], color: '#63d6ff' },
    { number: '02', lines: ['SOMEHOW FIND', 'THE RIGHT INPUT'], color: '#f0c557' },
    { number: '03', lines: ['EXTRACT THE', 'FINAL OUTPUT'], color: '#7ce5a8' }
  ];
  return (
    <DiagramFrame label="The challenge" status="Recover circuit from GDS → somehow find the right input → extract the final output">
      <div className={styles.pipelineMobile} aria-hidden="true">{stages.map(({ number, lines, color }, index) => <React.Fragment key={number}><div style={{ borderColor: color }}><small style={{ color }}>{number}</small><strong>{lines.join(' ')}</strong></div>{index < stages.length - 1 && <i>↓</i>}</React.Fragment>)}</div>
      <DiagramSvg width={900} height={250} ariaLabel="Recover the circuit from GDS, somehow find the right input, then extract the final output" className={styles.pipelineDesktop}>
        <defs><marker id="pipeline-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1 1L8 5L1 9" fill="none" stroke="#fb4e7c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45" /></marker></defs>
        <path d="M288 125H322" fill="none" stroke="#fb4e7c" strokeLinecap="round" strokeWidth="1.45" markerEnd="url(#pipeline-arrow)" /><path d="M580 125H614" fill="none" stroke="#fb4e7c" strokeLinecap="round" strokeWidth="1.45" markerEnd="url(#pipeline-arrow)" />
        {stages.map(({ number, lines, color }, index) => {
          const x = 44 + index * 292;
          return <g key={number} transform={`translate(${x} 54)`}><rect width="236" height="142" rx="12" fill="#101010" fillOpacity="0.68" stroke={color} strokeOpacity="0.52" strokeWidth="1.35" /><circle cx="28" cy="28" r="14" fill={color} fillOpacity="0.1" stroke={color} strokeOpacity="0.72" /><text x="28" y="32" textAnchor="middle" fill={color} fontFamily="monospace" fontSize="10">{number}</text><text x="118" y={lines.length === 1 ? 78 : 70} textAnchor="middle" fill="#f5f5f5" fontFamily="monospace" fontSize="13" letterSpacing="0.5">{lines.map((line, lineIndex) => <tspan key={line} x="118" dy={lineIndex === 0 ? 0 : 22}>{line}</tspan>)}</text></g>;
        })}
      </DiagramSvg>
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
        <g transform="translate(280 92)"><path d="M0 0h76c58 0 96 32 96 72s-38 72-96 72H0z" fill="#101010" stroke="#e8e8e8" strokeWidth="2" /><text x="76" y="79" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="18">AND</text></g>
        <path d="M452 164H590" fill="none" stroke="#e8e8e8" strokeWidth="3" />
        <circle cx="610" cy="164" r="20" fill="#111" stroke="#7ce5a8" strokeWidth="2" /><text x="610" y="169" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13">Y</text>
        <text x="380" y="280" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="18" fontWeight="700">BOTH INPUTS MUST BE HIGH</text>
        <text x="380" y="307" textAnchor="middle" fill="#7ce5a8" fontFamily="monospace" fontSize="18" fontWeight="700">FOR Y TO BE HIGH</text>
      </DiagramSvg>
      <DiagramSvg className={styles.andGateMobile} width={360} height={380} ariaLabel="Inputs A and B enter a hardware AND gate and produce output Y only when both are one" contentScale={1} inset={12}>
        <text x="28" y="42" fill="#fff" fontFamily="monospace" fontSize="15" fontWeight="700">INPUT PINS</text>
        <text x="332" y="34" textAnchor="end" fill="#a8a8a8" fontFamily="monospace" fontSize="12">HIGH = 1</text><text x="332" y="51" textAnchor="end" fill="#a8a8a8" fontFamily="monospace" fontSize="12">LOW = 0</text>
        <circle cx="54" cy="108" r="20" fill="#111" stroke="#63d6ff" strokeWidth="2" /><text x="54" y="114" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="17" fontWeight="700">A</text>
        <circle cx="54" cy="208" r="20" fill="#111" stroke="#f0c557" strokeWidth="2" /><text x="54" y="214" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="17" fontWeight="700">B</text>
        <path d="M74 108H126M74 208H126" fill="none" stroke="#676767" strokeWidth="3" />
        <g transform="translate(126 78)"><path d="M0 0h50c54 0 86 35 86 80s-32 80-86 80H0z" fill="#101010" stroke="#e8e8e8" strokeWidth="2" /><text x="58" y="87" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="18">AND</text></g>
        <path d="M262 158H298" fill="none" stroke="#e8e8e8" strokeWidth="3" />
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
  { id: '34', x: 210, y: 155 },
  { id: '35', x: 410, y: 135 },
  { id: '36', x: 470, y: 310 },
  { id: '37', x: 235, y: 345 },
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
  { id: 'S20', registerCount: 9, x: 110, y: 255 },
  { id: 'S0', registerCount: 1, x: 260, y: 150 },
  { id: 'S4', registerCount: 2, x: 260, y: 360 },
  { id: 'S3', registerCount: 4, x: 410, y: 150 },
  { id: 'S19', registerCount: 8, x: 580, y: 150 },
  { id: 'S1', registerCount: 1, x: 580, y: 280 },
  { id: 'S2', registerCount: 1, x: 580, y: 410 },
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
const stateCollapseCenter = { x: 385, y: 255 } as const;

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
  return <g opacity={opacity} transform={`translate(${node.x} ${node.y}) scale(${scale})`}><circle r="30" fill="#101010" stroke="#b8b8b8" strokeWidth="1.5" /><text y="-2" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13" fontWeight="700">q{node.id}</text><text y="14" textAnchor="middle" fill="#888" fontFamily="monospace" fontSize="8">DFXTP</text></g>;
}

function StateRegion({ node, largeText = false, opacity = 1, scale = 1 }: { node: StateRegionNode; largeText?: boolean; opacity?: number; scale?: number }): JSX.Element {
  const selected = node.id === 'S3';
  const radius = selected ? 34 : 30;
  return <g opacity={opacity} transform={`translate(${node.x} ${node.y}) scale(${scale})`}><circle r={radius} fill="#101010" stroke={selected ? '#63d6ff' : '#777'} strokeWidth={selected ? 2 : 1.4} /><text y="-3" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize={largeText ? 16 : 14} fontWeight="800">{node.id}</text><text y="14" textAnchor="middle" fill={selected ? '#63d6ff' : '#aaa'} fontFamily="monospace" fontSize={largeText ? 9 : 8}>{node.registerCount} reg{node.registerCount === 1 ? '' : 's'}</text></g>;
}

function SccDagDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const t = clamp((progress - 0.08) / 0.84);
  const collapse = clamp((t - 0.12) / 0.38);
  const registerOpacity = 1 - clamp((collapse - 0.72) / 0.28);
  const registerScale = mix(1, 0.45, collapse);
  const condensedReveal = clamp((t - 0.34) / 0.18);
  const dagReveal = clamp((t - 0.58) / 0.25);
  const rawTitleOpacity = 1 - clamp((t - 0.3) / 0.16);
  const middleTitleOpacity = Math.min(clamp((t - 0.3) / 0.12), 1 - clamp((t - 0.53) / 0.12));
  const movingRegisterNodes = stateRegisterNodes.map((node) => ({ ...node, x: mix(node.x, stateCollapseCenter.x, collapse), y: mix(node.y, stateCollapseCenter.y, collapse) }));
  const finalS3 = stateRegionNodes.find((node) => node.id === 'S3') ?? { id: 'S3' as const, registerCount: 4, x: 410, y: 150 };
  const movingS3 = { ...finalS3, x: mix(stateCollapseCenter.x, finalS3.x, dagReveal), y: mix(stateCollapseCenter.y, finalS3.y, dagReveal) };
  const movingRegionNodes = stateRegionNodes.map((node) => node.id === 'S3' ? movingS3 : node);

  return (
    <DiagramFrame label="State dependency" status="" progress={progress}>
      <div className={styles.stateDagStage}>
      <DiagramSvg className={styles.stateDagDesktop} width={760} height={520} ariaLabel="A real four-register feedback cluster from the recovered ASIC condenses into state region S3, followed by a real seven-node excerpt of the 51-region state dependency DAG" contentScale={1}>
        <defs><marker id="state-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke="#8a8a8a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></marker><marker id="state-dag-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke="#8a8a8a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></marker></defs>
        <g opacity={rawTitleOpacity}>
          <text x="52" y="58" fill="#e7e7e7" fontFamily="monospace" fontSize="14" fontWeight="800">1 · REAL REGISTER DEPENDENCY GRAPH</text>
          <text x="52" y="79" fill="#929292" fontFamily="monospace" fontSize="11">nodes = recovered registers · arrows = next-state influence</text>
        </g>
        <text x="52" y="58" opacity={middleTitleOpacity} fill="#e7e7e7" fontFamily="monospace" fontSize="14" fontWeight="800">4 REGISTERS → ONE FEEDBACK REGION</text>
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
          <text x="52" y="58" fill="#e7e7e7" fontFamily="monospace" fontSize="14" fontWeight="800">2 · SCC CONDENSATION DAG · REAL EXCERPT</text>
          <text x="52" y="79" fill="#929292" fontFamily="monospace" fontSize="11">nodes = register feedback regions · arrows = state influence</text>
          <text x="708" y="58" textAnchor="end" fill="#777" fontFamily="monospace" fontSize="10">7 OF 51 REGIONS</text>
          <text x="380" y="478" textAnchor="middle" fill="#888" fontFamily="monospace" fontSize="10">EACH SCC BECOMES ONE NODE · INTERNAL FEEDBACK DISAPPEARS</text>
        </g>
      </DiagramSvg>
      <DiagramSvg className={styles.stateDagMobile} width={360} height={570} ariaLabel="A phone-friendly portrait view of the same real seven-region state dependency DAG excerpt" contentScale={1} inset={12}>
        <defs><marker id="state-mobile-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke="#8a8a8a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></marker></defs>
        <text x="24" y="38" fill="#e7e7e7" fontFamily="monospace" fontSize="12" fontWeight="800">SCC CONDENSATION DAG</text>
        <text x="336" y="38" textAnchor="end" fill="#777" fontFamily="monospace" fontSize="9">7 OF 51 REGIONS</text>
        <text x="24" y="56" fill="#929292" fontFamily="monospace" fontSize="9">real feedback regions · real state influence</text>
        {stateRegionEdges.map((edge) => <path key={`${edge.from}-${edge.to}`} d={graphEdgePath(mobileStateRegionNodes, edge, 34)} fill="none" stroke="#777" strokeWidth="1.7" markerEnd="url(#state-mobile-arrow)" />)}
        {mobileStateRegionNodes.map((node) => <StateRegion key={node.id} node={node} largeText />)}
        <text x="180" y="542" textAnchor="middle" fill="#888" fontFamily="monospace" fontSize="9">EACH SCC IS ONE FEEDBACK REGION</text>
      </DiagramSvg>
      </div>
    </DiagramFrame>
  );
}

function SatBasicsDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const rows = [['0', '0', '0'], ['0', '1', '0'], ['1', '0', '0'], ['1', '1', '1']];
  const status = progress >= 0.82 ? 'Only one truth-table row satisfies the target' : progress >= 0.5 ? 'Require success to equal one' : 'Feed A and B into the AND gate';
  return (
    <DiagramFrame label="SAT intuition" status={status} progress={progress}>
      <div className={styles.satSequence} aria-label="A equals one and B equals one enter an AND gate, producing success equals one; the truth table then shows this is the only satisfying row">
        <div className={styles.satSchematic}>
          <div className={styles.satInputs}><span style={scrollRevealStyle(progress, 0.08)}><small>INPUT</small><b>A = 1</b></span><span style={scrollRevealStyle(progress, 0.2)}><small>INPUT</small><b>B = 1</b></span></div>
          <div className={styles.satAndGate} style={scrollRevealStyle(progress, 0.34)}><svg viewBox="0 0 120 92" aria-hidden="true"><path d="M8 8h42c38 0 62 18 62 38S88 84 50 84H8z" /><text x="55" y="52" textAnchor="middle">AND</text></svg></div>
          <div className={styles.satTarget} style={scrollRevealStyle(progress, 0.48)}><small>REQUIRED</small><b>success = 1</b></div>
        </div>
        <div className={styles.truthTable} style={scrollRevealStyle(progress, 0.62)}>
          <div className={styles.truthHead}><span>A</span><span>B</span><span>success</span></div>
          {rows.map(([a, b, output]) => <div key={`${a}${b}`} className={styles.truthRow} data-valid={output === '1'}><span>{a}</span><span>{b}</span><span>{output}</span></div>)}
        </div>
        <div className={styles.satConclusion} style={scrollRevealStyle(progress, 0.8)}>Only <b>A = 1</b> and <b>B = 1</b> satisfy the target.</div>
      </div>
    </DiagramFrame>
  );
}

function SatTimelineDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const animationProgress = clamp((progress - 0.16) / 0.68);
  const resolved = Math.floor(clamp(animationProgress / 0.72) * 4);
  const success = animationProgress >= 0.86;
  return (
    <DiagramFrame label="Bounded reachability" status={success ? 'One valid input trace reaches success' : resolved ? `${resolved} unknown input${resolved === 1 ? '' : 's'} fixed` : 'Unroll the circuit, then constrain the ending'} progress={progress}>
      <DiagramSvg width={620} height={620} ariaLabel="One hardware clock step takes the current state and input into the circuit to produce the next state, then the circuit is copied across bounded cycles until success is required">
        <text x="68" y="82" fill="#858585" fontFamily="monospace" fontSize="12">ONE CLOCK STEP</text>
        <rect x="72" y="108" width="98" height="62" fill="#111" stroke="#4a4a4a" /><text x="121" y="134" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14">STATE S<tspan baselineShift="sub" fontSize="10">t</tspan></text><text x="121" y="154" textAnchor="middle" fill="#8a8a8a" fontFamily="monospace" fontSize="10">memory now</text>
        <rect x="72" y="190" width="98" height="52" fill="#111" stroke="#fb4e7c" /><text x="121" y="221" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14">INPUT I<tspan baselineShift="sub" fontSize="10">t</tspan></text>
        <path d="M170 139H238M170 216C202 216 204 174 238 174" fill="none" stroke="#777" strokeWidth="2" markerEnd="url(#time-arrow)" />
        <rect x="240" y="118" width="140" height="102" fill="#15110f" stroke="#e9b94f" /><text x="310" y="162" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="15">CIRCUIT</text><text x="310" y="184" textAnchor="middle" fill="#a18a5b" fontFamily="monospace" fontSize="10">logic + registers</text>
        <path d="M380 169H444" stroke="#777" strokeWidth="2" markerEnd="url(#time-arrow)" />
        <rect x="446" y="128" width="104" height="82" fill="#111" stroke="#4a4a4a" /><text x="498" y="162" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14">STATE S<tspan baselineShift="sub" fontSize="10">t+1</tspan></text><text x="498" y="184" textAnchor="middle" fill="#8a8a8a" fontFamily="monospace" fontSize="10">memory next</text>
        <path d="M68 275H552" stroke="#242424" />
        <text x="68" y="306" fill="#858585" fontFamily="monospace" fontSize="12">COPY THAT STEP ACROSS k CLOCK CYCLES</text>
        {Array.from({ length: 4 }, (_, index) => {
          const x = 100 + index * 132;
          const fixed = index < resolved;
          return <g key={index}><rect x={x - 34} y="338" width="68" height="50" fill="#111" stroke="#4a4a4a" /><text x={x} y="369" textAnchor="middle" fill="#eee" fontFamily="monospace" fontSize="14">S{index}</text>{index < 3 && <><path d={`M${x + 34} 363H${x + 96}`} stroke="#666" strokeWidth="2" markerEnd="url(#time-arrow)" /><rect x={x + 48} y="402" width="44" height="38" fill={fixed ? '#fb4e7c' : '#111'} fillOpacity={fixed ? 0.12 : 1} stroke={fixed ? '#fb4e7c' : '#3e3e3e'} /><text x={x + 70} y="426" textAnchor="middle" fill={fixed ? '#fff' : '#888'} fontFamily="monospace" fontSize="11">I{index}={fixed ? (index === 1 ? '0' : '1') : '?'}</text><path d={`M${x + 70} 402V381`} stroke={fixed ? '#fb4e7c' : '#444'} strokeDasharray="4 4" /></>}</g>;
        })}
        <text x="548" y="366" fill="#777" fontFamily="monospace" fontSize="12">… S<tspan baselineShift="sub" fontSize="8">k</tspan></text>
        <rect x="68" y="474" width="484" height="64" fill="#fb4e7c" fillOpacity={success ? 0.1 : 0.035} stroke="#fb4e7c" strokeOpacity={success ? 1 : 0.55} />
        <text x="90" y="501" fill="#999" fontFamily="monospace" fontSize="10">TARGET CONSTRAINT</text>
        <text x="310" y="522" textAnchor="middle" fill={success ? '#fff' : '#bbb'} fontFamily="monospace" fontSize="15">success<tspan baselineShift="sub" fontSize="10">0</tspan> ∨ success<tspan baselineShift="sub" fontSize="10">1</tspan> ∨ … ∨ success<tspan baselineShift="sub" fontSize="10">k</tspan> = 1</text>
        <circle cx="526" cy="506" r="8" fill={success ? '#fb4e7c' : '#242424'} stroke="#fb4e7c" />
        <defs><marker id="time-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0 0L8 3L0 6z" fill="#777" /></marker></defs>
      </DiagramSvg>
    </DiagramFrame>
  );
}

function CacheDiagram(): JSX.Element {
  return <DiagramFrame label="Content-addressed extraction" status="Only relevant changes rebuild"><div className={styles.cacheFlow}><div className={styles.fileStack}><span>puzzle.gds</span><span>extractor.py</span><span>technology + vias</span><span>cache version</span></div><span className={styles.flowArrow} aria-hidden="true">→</span><div className={styles.hashBox}><small>SHA-256</small><strong>7f31…a9c2</strong></div><div className={styles.cacheBranches}><div className={styles.cacheBranch}><i aria-hidden="true">→</i><div><b>HIT</b><span>load recovered graph</span></div></div><div className={styles.cacheBranch}><i aria-hidden="true">→</i><div><b>MISS</b><span>rebuild + save</span></div></div></div></div></DiagramFrame>;
}

function IoStreamDiagram(): JSX.Element {
  const sampleBits = [ASIC_WITNESS_BITS[0], ASIC_WITNESS_BITS[1], ASIC_WITNESS_BITS[2], '···', ASIC_WITNESS_BITS.at(-1) ?? '0'];
  const signalArrowProps = { fill: 'none', stroke: '#fb4e7c', strokeWidth: 1.35, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, markerEnd: 'url(#io-arrow-clean)' };

  return (
    <DiagramFrame label="Recovered circuit I/O" status="Input + current state → logic → outputs + next state">
      <div className={styles.ioMobile} aria-hidden="true"><div className={styles.ioSequence}><small>CANDIDATE TRACE</small><strong>I₀ I₁ I₂ ··· I₁₂₀</strong><span>{sampleBits.join(' ')} · one bit each clock</span></div><span className={styles.mobileReplayStep}>↓ CLOCKED REPLAY</span><div className={styles.mobileHardware}><small>RECOVERED CIRCUIT</small><strong>SKY130 logic</strong><span>read qₜ now · save qₜ₊₁ for the next clock</span></div><span className={styles.mobileReplayStep}>↓ OBSERVE HARDWARE</span><div className={styles.mobileOutputs}><span><i />success</span><span><i />O[7:0]</span></div></div>
      <DiagramSvg width={820} height={330} ariaLabel="Each clock supplies one input bit while the circuit reads its current state, computes outputs, and stores the next state" className={styles.ioDesktop}>
        <defs><marker id="io-arrow-clean" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke="#fb4e7c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" /></marker></defs>
        <text x="58" y="61" fill="#777" fontFamily="monospace" fontSize="9">CANDIDATE TRACE · ONE BIT PER CLOCK</text>
        <rect x="58" y="82" width="194" height="166" fill="#101010" stroke="#63d6ff" />
        <text x="155" y="112" textAnchor="middle" fill="#777" fontFamily="monospace" fontSize="9">TIME →</text>
        {['I₀', 'I₁', 'I₂', '···', 'I₁₂₀'].map((cycle, index) => <g key={cycle} transform={`translate(${72 + index * 34} 132)`}><text x="13" y="0" textAnchor="middle" fill="#777" fontFamily="monospace" fontSize="7">{cycle}</text><rect x="0" y="10" width="26" height="32" fill={cycle === '···' ? '#0c0c0c' : '#111'} stroke={cycle === '···' ? '#343434' : '#63d6ff'} strokeOpacity="0.75" /><text x="13" y="31" textAnchor="middle" fill={cycle === '···' ? '#666' : '#fff'} fontFamily="monospace" fontSize="10">{sampleBits[index]}</text></g>)}
        <path d="M78 211H214" stroke="#3b3b3b" /><path d="M84 205V217M116 205V217M148 205V217M180 205V217M212 205V217" stroke="#777" />
        <text x="155" y="234" textAnchor="middle" fill="#63d6ff" fontFamily="monospace" fontSize="8">clk  clk  clk  ···  clk</text>
        <path d="M252 140H318" {...signalArrowProps} />

        <rect x="288" y="64" width="260" height="202" fill="#0d0d0d" stroke="#454545" />
        <text x="418" y="91" textAnchor="middle" fill="#777" fontFamily="monospace" fontSize="9">RECOVERED SEQUENTIAL CIRCUIT</text>
        <rect x="325" y="112" width="186" height="56" fill="#15110f" stroke="#e9b94f" /><text x="418" y="136" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="11">SKY130 LOGIC</text><text x="418" y="153" textAnchor="middle" fill="#b29a6d" fontFamily="monospace" fontSize="8">compute this clock</text>
        <rect x="356" y="197" width="124" height="42" fill="#0e1513" stroke="#7ce5a8" /><text x="418" y="215" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="10">STATE qₜ</text><text x="418" y="229" textAnchor="middle" fill="#6f9e8a" fontFamily="monospace" fontSize="7">register values</text>
        <path d="M390 168V197" {...signalArrowProps} /><path d="M446 197V168" {...signalArrowProps} />
        <text x="382" y="186" textAnchor="end" fill="#fff" fontFamily="monospace" fontSize="7">WRITE NEXT</text><text x="454" y="186" fill="#fff" fontFamily="monospace" fontSize="7">READ NOW</text>

        <path d="M511 130H570V116H608" {...signalArrowProps} /><path d="M511 150H570V218H608" {...signalArrowProps} />
        <rect x="610" y="82" width="154" height="68" fill="#101010" stroke="#7ce5a8" /><circle cx="634" cy="116" r="8" fill="#7ce5a8" /><text x="656" y="113" fill="#777" fontFamily="monospace" fontSize="9">1-BIT DECISION</text><text x="656" y="131" fill="#fff" fontFamily="monospace" fontSize="12">success</text>
        <rect x="610" y="184" width="154" height="68" fill="#101010" stroke="#bd75ff" /><path d="M626 218H644" stroke="#bd75ff" strokeWidth="7" /><text x="656" y="215" fill="#777" fontFamily="monospace" fontSize="9">8-BIT OUTPUT BUS</text><text x="656" y="233" fill="#fff" fontFamily="monospace" fontSize="12">O[7:0]</text>
      </DiagramSvg>
    </DiagramFrame>
  );
}

function VerificationDiagram(): JSX.Element {
  const { ref, active } = useVisibleActivation<HTMLElement>();
  return <section ref={ref} className={styles.verificationFigure} data-active={active} aria-label="The same input bits split into a SAT model and an independent structural Verilog simulation, which must both report success at the same cycle"><header><span>Independent replay</span></header><div className={styles.verificationFlow}><div className={styles.sharedWitness}><strong>{ASIC_WITNESS_BLOCKS[0]} … {ASIC_WITNESS_BLOCKS.at(-1)}</strong><span>same exact bits</span></div><div className={styles.modelFork} aria-hidden="true"><i /><i /></div><div className={styles.modelCards}><article><small>FORMAL PATH</small><strong>Z3 transition model</strong><p>predicts <b>success = 1</b> at cycle T</p><span className={styles.successLamp}><i />SUCCESS @ T</span></article><article><small>HARDWARE REPLAY</small><strong>Structural Verilog</strong><p>official SKY130 models · Icarus</p><span className={styles.successLamp}><i />SUCCESS @ T</span></article></div><div className={styles.matchLine}><span>cycle T</span><i /><strong>MATCH</strong><i /><span>cycle T</span></div></div><div className={styles.passBadge}>PASS <span>the model predicted what the recovered hardware simulated</span></div></section>;
}

function ResultDecode({ progress }: ScrollDiagramProps): JSX.Element {
  return <DiagramFrame label="Result decode" status="Verified output bytes → (* TWO STARS *)" progress={progress}><section className={`${styles.resultFigure} ${surfaceStyles.coolVerificationSurface}`} aria-label="The verified 121-bit witness produces the OCaml comment two stars"><div className={styles.resultBits}>{ASIC_WITNESS_BLOCKS.map((block, index) => <span key={`${block}-${index}`} style={scrollRevealStyle(progress, 0.04 + index * 0.045, 0.16, 8)}>{block}</span>)}</div><div className={styles.resultText} style={scrollRevealStyle(progress, 0.62, 0.24, 16)}><span>(*</span><strong>TWO STARS</strong><span>*)</span></div></section></DiagramFrame>;
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

  return <figure className={styles.showcaseVideo}><video ref={videoRef} src="/blog/asic-reverse-engineering/jsc-asic-showcase-1080p.mp4" controls loop playsInline preload="metadata" aria-label="Real ASIC layer stack assembling, exploding, orbiting, and collapsing" /><figcaption><span>Final layer playback</span><div className={styles.showcaseCaptionCopy}><strong>Recovered puzzle geometry · compressed 1080p export with stereo audio</strong><small>The grid lines were added as a visual aid to make the separation between layers easier to see.</small></div></figcaption></figure>;
}

function VisualForKey({ visualKey, progress }: { visualKey: AsicVisualKey; progress: number }): JSX.Element {
  if (visualKey === 'challenge-pipeline') return <ChallengePipelineDiagram />;
  if (visualKey === 'and-gate') return <AndGateDiagram />;
  if (visualKey === 'layer-stack') return <AsicAnatomyDiagram progress={progress} />;
  if (visualKey === 'rtree') return <RTreeInsertionDiagram progress={progress} />;
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
  if (visualKey === 'result-decode') return <AsicAnimatedInlineVisual visualKey={visualKey} />;
  return <div className={styles.inlineVisual} data-visual={visualKey}><VisualForKey visualKey={visualKey} progress={1} /></div>;
}

function AsicAnimatedInlineVisual({ visualKey }: { visualKey: AsicVisualKey }): JSX.Element {
  const { ref, scrollState } = useScrollDiagramState();
  return <section ref={ref} className={`${styles.inlineVisual} ${styles.inlineAnimatedVisual}`} data-visual={visualKey} data-scroll-progress={scrollState.progress.toFixed(3)} data-scroll-start={scrollState.atStart} data-scroll-end={scrollState.atEnd}><div className={styles.inlineAnimatedFrame} data-sticky-visual><VisualForKey visualKey={visualKey} progress={scrollState.progress} /></div></section>;
}
