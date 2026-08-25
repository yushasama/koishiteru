'use client';

import { useReducedMotion } from 'framer-motion';
import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { DiagramFrame, DiagramSvg, type ScrollDiagramProps, scrollRevealStyle, useScrollDiagramState } from './DiagramPrimitives';
import styles from './asic.module.css';

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
    { number: '01', lines: ['RECOVER CIRCUIT'], color: '#63d6ff' },
    { number: '02', lines: ['FIND AN INPUT', 'THAT MAKES SUCCESS GO HIGH'], color: '#f0c557' },
    { number: '03', lines: ['RECOVER THE FINAL OUTPUT'], color: '#7ce5a8' }
  ];
  return (
    <DiagramFrame label="The challenge" status="Recover circuit → make success go high → recover output">
      <div className={styles.pipelineMobile} aria-hidden="true">{stages.map(({ number, lines, color }, index) => <React.Fragment key={number}><div style={{ borderColor: color }}><small style={{ color }}>{number}</small><strong>{lines.join(' ')}</strong></div>{index < stages.length - 1 && <i>↓</i>}</React.Fragment>)}</div>
      <DiagramSvg width={900} height={250} ariaLabel="Recover the circuit, find an input that makes success go high, then recover the final output" className={styles.pipelineDesktop}>
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

function LayerStackDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const explode = clamp((progress - 0.14) / 0.68);
  const reveal = clamp((explode - 0.08) / 0.34);
  const labels = clamp((explode - 0.58) / 0.32);
  const status = explode > 0.82 ? 'Cover, wiring, connections, logic, and base separated' : explode > 0.16 ? 'Opening the chip' : 'A sealed chip';

  return (
    <DiagramFrame label="ASIC anatomy" status={status}>
      <DiagramSvg width={760} height={560} ariaLabel="A compact chip opens into a simple anatomical view of its cover, signal paths, connections, logic, and supporting base" contentScale={0.92}>
        <defs>
          <linearGradient id="package-top" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#272727" /><stop offset="0.52" stopColor="#111" /><stop offset="1" stopColor="#080808" /></linearGradient>
          <linearGradient id="logic-top" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#3c2a50" /><stop offset="0.52" stopColor="#181420" /><stop offset="1" stopColor="#0b0910" /></linearGradient>
          <filter id="chip-shadow" x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        <ellipse cx="340" cy="487" rx="176" ry="24" fill="#000" opacity="0.7" filter="url(#chip-shadow)" />

        <g transform={`translate(0 ${mix(0, 124, explode)})`}>
          <path d="M146 264L348 210L510 290L306 348Z" fill="#151515" stroke="#565656" strokeWidth="2" />
          <path d="M146 264L306 348V386L146 302Z" fill="#090909" stroke="#353535" />
          <path d="M306 348L510 290V328L306 386Z" fill="#060606" stroke="#303030" />
          <path d="M168 273L346 226L486 295L306 346Z" fill="#1a1a1a" stroke="#343434" />
        </g>

        <g opacity={reveal} transform={`translate(0 ${mix(0, 58, explode)})`}>
          <path d="M174 272L348 225L480 292L304 342Z" fill="url(#logic-top)" stroke="#a87cda" strokeWidth="2" />
          <path d="M174 272L304 342V360L174 290Z" fill="#100d17" stroke="#4c3b62" /><path d="M304 342L480 292V310L304 360Z" fill="#0c0911" stroke="#4c3b62" />
          <g fill="#bd8bf2" fillOpacity="0.12" stroke="#bd8bf2" strokeOpacity="0.72"><path d="M216 281L264 268L289 281L241 294Z" /><path d="M302 258L348 246L374 259L328 272Z" /><path d="M290 313L340 300L366 313L315 327Z" /><path d="M382 282L426 270L450 282L406 294Z" /></g>
        </g>

        <g opacity={reveal} transform={`translate(0 ${mix(0, 2, explode)})`} stroke="#f0c557" strokeWidth="3">
          {[[238, 281], [300, 264], [360, 281], [420, 266]].map(([x, y]) => <g key={`${x}-${y}`}><path d={`M${x} ${y - 12}V${y + 12}`} /><circle cx={x} cy={y - 13} r="4" fill="#f0c557" /></g>)}
        </g>

        <g opacity={reveal} transform={`translate(0 ${mix(0, -64, explode)})`}>
          <path d="M174 272L348 225L480 292L304 342Z" fill="#0b0d0d" fillOpacity="0.78" stroke="#4e6860" />
          <g fill="none" stroke="#020303" strokeLinecap="butt" strokeLinejoin="miter" strokeWidth="13"><path d="M194 292L276 270L318 291L400 269" /><path d="M242 321L326 298L370 320L444 300" /><path d="M276 256L348 237L402 264L458 249" /></g>
          <g fill="none" strokeLinecap="butt" strokeLinejoin="miter" strokeWidth="7"><path d="M194 292L276 270L318 291L400 269" stroke="#63d6ff" /><path d="M242 321L326 298L370 320L444 300" stroke="#fb4e7c" /><path d="M276 256L348 237L402 264L458 249" stroke="#7ce5a8" /></g>
        </g>

        <g opacity={mix(1, 0.94, explode)} transform={`translate(${mix(0, 6, explode)} ${mix(0, -154, explode)})`}>
          <path d="M146 264L348 210L510 290L306 348Z" fill="url(#package-top)" stroke="#737373" strokeWidth="2" />
          <path d="M146 264L306 348V376L146 292Z" fill="#0a0a0a" stroke="#424242" /><path d="M306 348L510 290V318L306 376Z" fill="#050505" stroke="#383838" />
        </g>

        <g opacity={labels} fontFamily="monospace" fontSize="12">
          <circle cx="500" cy="145" r="3" fill="#d6d6d6" /><path d="M500 145L532 132H564" fill="none" stroke="#d6d6d6" strokeOpacity="0.68" /><text x="576" y="137" fill="#f2f2f2">COVER</text>
          <circle cx="468" cy="210" r="3" fill="#63d6ff" /><path d="M468 210L522 196H564" fill="none" stroke="#63d6ff" strokeOpacity="0.68" /><text x="576" y="201" fill="#f2f2f2">SIGNAL PATHS</text>
          <circle cx="430" cy="272" r="3" fill="#f0c557" /><path d="M430 272L512 252H564" fill="none" stroke="#f0c557" strokeOpacity="0.68" /><text x="576" y="257" fill="#f2f2f2">CONNECTIONS</text>
          <circle cx="470" cy="346" r="3" fill="#bd8bf2" /><path d="M470 346L530 330H564" fill="none" stroke="#bd8bf2" strokeOpacity="0.68" /><text x="576" y="335" fill="#f2f2f2">LOGIC</text>
          <circle cx="500" cy="456" r="3" fill="#8f8f8f" /><path d="M500 456H564" fill="none" stroke="#8f8f8f" strokeOpacity="0.68" /><text x="576" y="461" fill="#f2f2f2">BASE</text>
        </g>
      </DiagramSvg>
    </DiagramFrame>
  );
}

function AndGateDiagram(): JSX.Element {
  return (
    <DiagramFrame label="Combinational logic" status="Both inputs must be high">
      <DiagramSvg width={760} height={350} ariaLabel="Inputs A and B enter a hardware AND gate and produce output Y only when both are one">
        <text x="72" y="80" fill="#fff" fontFamily="monospace" fontSize="15" fontWeight="700">INPUT PINS</text>
        <circle cx="112" cy="126" r="18" fill="#111" stroke="#63d6ff" /><text x="112" y="132" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="16" fontWeight="700">A</text>
        <circle cx="112" cy="202" r="18" fill="#111" stroke="#f0c557" /><text x="112" y="208" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="16" fontWeight="700">B</text>
        <path d="M130 126H280M130 202H280" fill="none" stroke="#676767" strokeWidth="3" />
        <g transform="translate(280 92)"><path d="M0 0h76c58 0 96 32 96 72s-38 72-96 72H0z" fill="#101010" stroke="#e8e8e8" strokeWidth="2" /><text x="76" y="79" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="18">AND</text></g>
        <path d="M452 164H590" fill="none" stroke="#e8e8e8" strokeWidth="3" />
        <circle cx="610" cy="164" r="20" fill="#111" stroke="#7ce5a8" strokeWidth="2" /><text x="610" y="169" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13">Y</text>
        <text x="380" y="292" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="22" fontWeight="700">Y = A ∧ B</text>
      </DiagramSvg>
    </DiagramFrame>
  );
}

function RTreeDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const cut = clamp((progress - 0.1) / 0.18);
  const color = clamp((progress - 0.28) / 0.18);
  const clear = clamp((progress - 0.52) / 0.16);
  const tree = clamp((progress - 0.66) / 0.24);
  const geometryOpacity = 1 - clear;
  const status = tree > 0.6 ? 'Nearby pieces grouped into a searchable tree' : clear > 0.3 ? 'Build the search tree' : color > 0.25 ? 'Color the three exact rectangles' : cut > 0.1 ? 'Draw two clean section lines' : 'Trace the I-shaped outline';

  return (
    <DiagramFrame label="Decomping A Weird Manhattan Polygon" status={status}>
      <DiagramSvg width={760} height={520} ariaLabel="An I-shaped Manhattan polygon stays in place while two section lines divide it into three colored rectangles; the board then becomes an R-tree" contentScale={0.92}>
        <g opacity={geometryOpacity}>
          <text x="44" y="54" fill="#aaa" fontFamily="monospace" fontSize="13">I-SHAPED POLYGON</text>
          <g transform="translate(380 258)">
            <path d="M-240-140H240V-60H50V60H240V140H-240V60H-50V-60H-240Z" fill="#d8d8d8" fillOpacity="0.1" />
            <g opacity={color}><rect x="-240" y="-140" width="480" height="80" fill="#63d6ff" fillOpacity="0.2" /><rect x="-50" y="-60" width="100" height="120" fill="#f0c557" fillOpacity="0.2" /><rect x="-240" y="60" width="480" height="80" fill="#7ce5a8" fillOpacity="0.2" /></g>
            <path d="M-240-140H240V-60H50V60H240V140H-240V60H-50V-60H-240Z" fill="none" stroke="#e6e6e6" strokeWidth="2.5" />
            <path d="M-50-60H50M-50 60H50" fill="none" stroke="#fff" strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - cut} />
            <g opacity={color} fontFamily="monospace" fontSize="14" fontWeight="700"><text x="-214" y="-94" fill="#79ddff">R0</text><text y="6" textAnchor="middle" fill="#f6cf68">R1</text><text x="-214" y="108" fill="#87eab2">R2</text></g>
          </g>
          <text x="380" y="460" textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize="12" opacity={color}>TWO CUTS · THREE EXACT RECTANGLES</text>
        </g>

        <g opacity={tree} transform={`translate(0 ${mix(12, 0, tree)})`}>
          <text x="44" y="54" fill="#aaa" fontFamily="monospace" fontSize="13">R-TREE · GROUP NEARBY PIECES</text>
          <path d="M380 136V174M380 174L225 210M380 174L535 210M225 274L150 340M225 274L365 340M535 274L610 340" fill="none" stroke="#777" strokeWidth="2.5" />
          <g transform="translate(300 80)"><rect width="160" height="56" rx="5" fill="#111" stroke="#e0e0e0" strokeWidth="1.5" /><text x="80" y="34" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14">ROOT</text></g>
          <g transform="translate(140 210)"><rect width="170" height="64" rx="5" fill="#101010" stroke="#686868" strokeWidth="1.5" /><text x="85" y="39" textAnchor="middle" fill="#ddd" fontFamily="monospace" fontSize="13">GROUP A</text></g>
          <g transform="translate(450 210)"><rect width="170" height="64" rx="5" fill="#101010" stroke="#686868" strokeWidth="1.5" /><text x="85" y="39" textAnchor="middle" fill="#ddd" fontFamily="monospace" fontSize="13">GROUP B</text></g>
          {[['R0', 90, '#63d6ff'], ['R1', 305, '#f0c557'], ['R2', 550, '#7ce5a8']].map(([label, x, pieceColor]) => <g key={String(label)} transform={`translate(${Number(x)} 340)`}><rect width="120" height="88" rx="5" fill="#0e0e0e" stroke={String(pieceColor)} strokeWidth="1.5" /><rect x="24" y="20" width="72" height="34" fill={String(pieceColor)} fillOpacity="0.18" stroke={String(pieceColor)} /><text x="60" y="75" textAnchor="middle" fill={String(pieceColor)} fontFamily="monospace" fontSize="14" fontWeight="700">{label}</text></g>)}
          <text x="380" y="470" textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize="12">SEARCH ONE AREA → IGNORE THE OTHER GROUP</text>
        </g>
      </DiagramSvg>
    </DiagramFrame>
  );
}

function CircuitMorphDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const nets = clamp((progress - 0.18) / 0.36);
  const logic = clamp((progress - 0.56) / 0.36);
  const status = logic > 0.5 ? 'Net names attach directly to cell pins' : nets > 0.5 ? 'Each connected shape gets one net name' : 'Start from connected geometry';
  return (
    <DiagramFrame label="From layout to logic" status={status}>
      <DiagramSvg width={760} height={520} ariaLabel="Three connected routes each become one named net, then each net name attaches directly to a recovered cell pin" contentScale={0.88}>
        <defs><marker id="morph-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0L9 4L0 8z" fill="#fb4e7c" /></marker></defs>
        <text x="44" y="54" fill="#b4b4b4" fontFamily="monospace" fontSize="13">1 · CONNECTED GEOMETRY</text>
        <g strokeLinejoin="miter">
          <path d="M72 80H330V112H204V174H164V112H72Z" fill="#63d6ff" fillOpacity="0.14" stroke="#63d6ff" strokeWidth="1.5" /><path d="M164 112H204M226 80V112" fill="none" stroke="#63d6ff" strokeOpacity="0.62" />
          <path d="M350 120H688V152H650V184H610V152H350Z" fill="#f0c557" fillOpacity="0.14" stroke="#f0c557" strokeWidth="1.5" /><path d="M610 152H650M528 120V152" fill="none" stroke="#f0c557" strokeOpacity="0.62" />
          <path d="M132 202H628V234H132Z" fill="#7ce5a8" fillOpacity="0.14" stroke="#7ce5a8" strokeWidth="1.5" /><path d="M254 202V234M380 202V234M506 202V234" fill="none" stroke="#7ce5a8" strokeOpacity="0.62" />
        </g>

        <g opacity={nets} transform={`translate(0 ${mix(12, 0, nets)})`}>
          <text x="44" y="270" fill="#b4b4b4" fontFamily="monospace" fontSize="13">2 · EACH SHAPE GETS ONE NET NAME</text>
          {[['N12', 58, '#63d6ff'], ['N18', 282, '#f0c557'], ['N27', 506, '#7ce5a8']].map(([label, x, netColor]) => <g key={String(label)}><rect x={Number(x)} y="288" width="196" height="62" rx="5" fill="#101010" stroke={String(netColor)} strokeWidth="1.5" /><line x1={Number(x) + 24} y1="319" x2={Number(x) + 76} y2="319" stroke={String(netColor)} strokeWidth="5" /><text x={Number(x) + 106} y="325" fill="#fff" fontFamily="monospace" fontSize="15">{label}</text></g>)}
        </g>

        <g opacity={logic} transform={`translate(0 ${mix(14, 0, logic)})`}>
          <path d="M156 350V382M380 350V382M604 350V382" fill="none" stroke="#fb4e7c" strokeWidth="2.5" markerEnd="url(#morph-arrow)" />
          <text x="44" y="412" fill="#b4b4b4" fontFamily="monospace" fontSize="13">3 · NET NAMES ATTACH TO CELL PINS</text>
          <path d="M64 468H194M328 468H420M554 468H624" stroke="#858585" strokeWidth="2" />
          <g transform="translate(194 438)"><path d="M0 0h42c32 0 52 14 52 30s-20 30-52 30H0z" fill="#111" stroke="#63d6ff" strokeWidth="1.5" /><text x="44" y="36" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13">AND</text></g>
          <g transform="translate(420 438)"><path d="M0 0h36c38 0 54 13 54 30s-16 30-54 30H0c13-18 13-42 0-60z" fill="#111" stroke="#f0c557" strokeWidth="1.5" /><text x="45" y="36" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13">XOR</text></g>
          <rect x="624" y="438" width="82" height="60" fill="#111" stroke="#7ce5a8" strokeWidth="1.5" /><text x="665" y="464" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13">DFF</text><text x="665" y="483" textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize="10">STATE</text>
          <text x="64" y="456" fill="#63d6ff" fontFamily="monospace" fontSize="11">N12</text><text x="328" y="456" fill="#f0c557" fontFamily="monospace" fontSize="11">N18</text><text x="554" y="456" fill="#7ce5a8" fontFamily="monospace" fontSize="11">N27</text>
        </g>
      </DiagramSvg>
    </DiagramFrame>
  );
}

interface SccRawNode {
  label: string;
  x: number;
  y: number;
  component: 'R0' | 'R1';
}

interface SccComponentNode {
  id: 'R0' | 'R1' | 'R2';
  members: string;
  x: number;
  y: number;
  r: number;
  color: string;
}

type SccPoint = readonly [number, number];

const sccRawNodes: readonly SccRawNode[] = [
  { label: 'A', x: 112, y: 250, component: 'R0' },
  { label: 'B', x: 176, y: 158, component: 'R0' },
  { label: 'C', x: 286, y: 194, component: 'R0' },
  { label: 'D', x: 282, y: 316, component: 'R0' },
  { label: 'F', x: 410, y: 158, component: 'R1' },
  { label: 'G', x: 500, y: 246, component: 'R1' },
  { label: 'H', x: 424, y: 354, component: 'R1' },
];

const sccComponents: readonly SccComponentNode[] = [
  { id: 'R0', members: 'A · B · C · D', x: 130, y: 278, r: 46, color: '#63d6ff' },
  { id: 'R1', members: 'F · G · H', x: 310, y: 278, r: 46, color: '#f0c557' },
  { id: 'R2', members: 'relay', x: 470, y: 278, r: 46, color: '#7ce5a8' },
];

const sccSuccessNode = { x: 606, y: 278, r: 24, color: '#7ce5a8' } as const;

function easeInOutCubic(k: number): number {
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}

function getSccComponent(id: SccComponentNode['id']): SccComponentNode {
  const component = sccComponents.find((candidate) => candidate.id === id);
  if (!component) throw new Error(`Unknown SCC component: ${id}`);
  return component;
}

function getSccRawNodePosition(node: SccRawNode, t: number): SccPoint {
  const target = getSccComponent(node.component);
  return [mix(node.x, target.x, t), mix(node.y, target.y, t)];
}

function getCircleEdgePoint(center: SccPoint, target: SccPoint, radius: number, pad: number): SccPoint {
  const dx = target[0] - center[0];
  const dy = target[1] - center[1];
  const len = Math.hypot(dx, dy) || 1;
  return [center[0] + (dx / len) * (radius + pad), center[1] + (dy / len) * (radius + pad)];
}

function SccMovingRawNode({ node, t }: { node: SccRawNode; t: number }): JSX.Element {
  const [x, y] = getSccRawNodePosition(node, t);
  return <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${mix(1, 0.62, t).toFixed(3)})`} opacity={Math.max(0, 1 - t * 1.55)}><circle r="18" fill="#101010" stroke="#d7d7d7" /><text y="4" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="10">{node.label}</text></g>;
}

function SccComponentCircle({ node, t }: { node: SccComponentNode; t: number }): JSX.Element {
  const opacity = node.id === 'R2' ? clamp((t - 0.5) / 0.32) : clamp((t - 0.22) / 0.46);
  const scale = node.id === 'R2' ? mix(0.82, 1, opacity) : mix(0.58, 1, opacity);
  return <g transform={`translate(${node.x} ${node.y}) scale(${scale})`} opacity={opacity}><circle r={node.r} fill={node.color} fillOpacity="0.055" stroke={node.color} strokeWidth="2" /><text y="-2" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="13">{node.id}</text><text y="17" textAnchor="middle" fill={node.color} fontFamily="monospace" fontSize="9">{node.members}</text></g>;
}

function SccDirectedEdge({ from, to, fromRadius, toRadius, label, index, t }: { from: SccPoint; to: SccPoint; fromRadius: number; toRadius: number; label: string; index: number; t: number }): JSX.Element {
  const start = getCircleEdgePoint(from, to, fromRadius, 9);
  const end = getCircleEdgePoint(to, from, toRadius, 15);
  const path = `M${start[0].toFixed(1)} ${start[1].toFixed(1)}H${end[0].toFixed(1)}`;
  const edgeProgress = clamp((t - 0.52 - index * 0.08) / 0.24);
  const labelOpacity = clamp((edgeProgress - 0.18) / 0.32);
  const pulseX = mix(start[0], end[0], edgeProgress);
  const midX = (start[0] + end[0]) / 2;

  return (
    <g opacity={clamp((t - 0.46) / 0.2)}>
      <path d={path} fill="none" stroke="#35101b" strokeWidth="5" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#fb4e7c" strokeWidth="2" strokeLinecap="round" markerEnd="url(#state-arrow-pink)" />
      <circle cx={start[0]} cy={start[1]} r="2.3" fill="#fb4e7c" opacity="0.7" />
      <circle cx={pulseX} cy={start[1]} r="3.1" fill="#fb4e7c" opacity={edgeProgress > 0 && edgeProgress < 1 ? 0.9 : 0} />
      <text x={midX} y={start[1] - 24} textAnchor="middle" fill="#fb4e7c" opacity={labelOpacity} fontFamily="monospace" fontSize="10" fontWeight="700">{label}</text>
    </g>
  );
}

function SccDagDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const t = easeInOutCubic(clamp((progress - 0.18) / 0.7));
  const rawOpacity = 1 - clamp((t - 0.5) / 0.18);
  const dagOpacity = clamp((t - 0.48) / 0.3);
  const r0 = getSccComponent('R0');
  const r1 = getSccComponent('R1');
  const r2 = getSccComponent('R2');
  const status = t > 0.68 ? 'Cycles condensed into a directed acyclic graph' : t > 0.28 ? 'Compressing feedback regions into SCC nodes' : 'The raw register graph contains cycles';

  return (
    <DiagramFrame label="State dependency" status={status}>
      <DiagramSvg width={760} height={520} ariaLabel="A cyclic register dependency graph compresses the original A through H nodes into SCC components R0 and R1, then reveals the same R0 to R2 to success condensation DAG" contentScale={1}>
        <defs><marker id="state-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0 0L8 3L0 6z" fill="#777" /></marker><marker id="state-arrow-pink" markerWidth="16" markerHeight="16" refX="14" refY="8" orient="auto" markerUnits="userSpaceOnUse"><path d="M2.5 2.5L14 8L2.5 13.5" fill="none" stroke="#fb4e7c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></marker></defs>
        <g transform="translate(35 -30) scale(1.12)">
          <g opacity={rawOpacity}>
            <text x="60" y="88" fill="#aaa" fontFamily="monospace" fontSize="12">RAW REGISTER DEPENDENCY GRAPH</text>
            <path d="M127 236C134 194 151 169 164 162M193 162C236 164 267 177 278 188M290 212C304 250 300 287 288 304M268 318C215 356 135 331 117 267" fill="none" stroke="#63d6ff" strokeWidth="2" strokeOpacity={rawOpacity} markerEnd="url(#state-arrow)" />
            <path d="M302 194C340 170 376 160 397 159M426 166C466 182 490 213 496 231M495 263C485 308 454 340 438 348M410 347C361 332 321 316 299 314" fill="none" stroke="#f0c557" strokeWidth="2" strokeOpacity={rawOpacity} markerEnd="url(#state-arrow)" />
            <path d="M188 169C254 112 355 106 401 151M286 210C332 245 393 260 483 248M278 322C324 392 380 391 415 360M118 252C175 285 221 298 268 311" fill="none" stroke="#555" strokeWidth="1.5" strokeOpacity={rawOpacity} markerEnd="url(#state-arrow)" />
            <path d="M114 219C74 214 70 276 99 281M504 222C548 198 568 235 528 259" fill="none" stroke="#4b4b4b" strokeWidth="1.5" strokeOpacity={rawOpacity} markerEnd="url(#state-arrow)" />
          </g>
          <g>{sccRawNodes.map((node) => <SccMovingRawNode key={node.label} node={node} t={t} />)}</g>
          <g>{sccComponents.map((node) => <SccComponentCircle key={node.id} node={node} t={t} />)}</g>
          <g opacity={dagOpacity} transform={`translate(0 ${mix(16, 0, dagOpacity)})`}>
            <text x="60" y="88" fill="#aaa" fontFamily="monospace" fontSize="12">CONDENSATION GRAPH · NOW A DAG</text>
            <SccDirectedEdge from={[r0.x, r0.y]} to={[r1.x, r1.y]} fromRadius={r0.r} toRadius={r1.r} label="R0 → R1" index={0} t={t} />
            <SccDirectedEdge from={[r1.x, r1.y]} to={[r2.x, r2.y]} fromRadius={r1.r} toRadius={r2.r} label="R1 → R2" index={1} t={t} />
            <SccDirectedEdge from={[r2.x, r2.y]} to={[sccSuccessNode.x, sccSuccessNode.y]} fromRadius={r2.r} toRadius={sccSuccessNode.r} label="R2 → OK" index={2} t={t} />
            <g transform={`translate(${sccSuccessNode.x} ${sccSuccessNode.y})`}><circle r={sccSuccessNode.r} fill={sccSuccessNode.color} fillOpacity="0.14" stroke={sccSuccessNode.color} /><text y="4" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="10">OK</text><text y="43" textAnchor="middle" fill={sccSuccessNode.color} fontFamily="monospace" fontSize="10">SUCCESS</text></g>
            <text x="310" y="408" textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize="11">INTERNAL LOOPS HIDDEN · REGION DEPENDENCIES REMAIN</text>
          </g>
        </g>
      </DiagramSvg>
    </DiagramFrame>
  );
}

function SatBasicsDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const rows = [['0', '0', '0'], ['0', '1', '0'], ['1', '0', '0'], ['1', '1', '1']];
  const status = progress >= 0.82 ? 'Only one truth-table row satisfies the target' : progress >= 0.5 ? 'Require success to equal one' : 'Feed A and B into the AND gate';
  return (
    <DiagramFrame label="SAT intuition" status={status}>
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
    <DiagramFrame label="Bounded reachability" status={success ? 'One valid input trace reaches success' : resolved ? `${resolved} unknown input${resolved === 1 ? '' : 's'} fixed` : 'Unroll the circuit, then constrain the ending'}>
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
        <rect x="58" y="82" width="176" height="166" fill="#101010" stroke="#63d6ff" />
        <text x="146" y="112" textAnchor="middle" fill="#777" fontFamily="monospace" fontSize="9">TIME →</text>
        {['I₀', 'I₁', 'I₂', '···', 'I₁₂₀'].map((cycle, index) => <g key={cycle} transform={`translate(${76 + index * 33} 132)`}><text x="13" y="0" textAnchor="middle" fill="#777" fontFamily="monospace" fontSize="7">{cycle}</text><rect x="0" y="10" width="26" height="32" fill={cycle === '···' ? '#0c0c0c' : '#111'} stroke={cycle === '···' ? '#343434' : '#63d6ff'} strokeOpacity="0.75" /><text x="13" y="31" textAnchor="middle" fill={cycle === '···' ? '#666' : '#fff'} fontFamily="monospace" fontSize="10">{sampleBits[index]}</text></g>)}
        <path d="M78 211H214" stroke="#3b3b3b" /><path d="M84 205V217M116 205V217M148 205V217M180 205V217M212 205V217" stroke="#777" />
        <text x="146" y="234" textAnchor="middle" fill="#63d6ff" fontFamily="monospace" fontSize="8">clk  clk  clk  ···  clk</text>
        <path d="M234 140H318" {...signalArrowProps} />

        <rect x="288" y="64" width="260" height="202" fill="#0d0d0d" stroke="#454545" />
        <text x="418" y="91" textAnchor="middle" fill="#777" fontFamily="monospace" fontSize="9">RECOVERED SEQUENTIAL CIRCUIT</text>
        <rect x="325" y="112" width="186" height="56" fill="#15110f" stroke="#e9b94f" /><text x="418" y="136" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="11">SKY130 LOGIC</text><text x="418" y="153" textAnchor="middle" fill="#b29a6d" fontFamily="monospace" fontSize="8">compute this clock</text>
        <rect x="356" y="197" width="124" height="42" fill="#0e1513" stroke="#7ce5a8" /><text x="418" y="215" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="10">STATE qₜ</text><text x="418" y="229" textAnchor="middle" fill="#6f9e8a" fontFamily="monospace" fontSize="7">register values</text>
        <path d="M390 168V197" {...signalArrowProps} /><path d="M446 197V168" {...signalArrowProps} />
        <text x="382" y="186" textAnchor="end" fill="#fb4e7c" fontFamily="monospace" fontSize="7">WRITE NEXT</text><text x="454" y="186" fill="#fb4e7c" fontFamily="monospace" fontSize="7">READ NOW</text>

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

function ResultDecode(): JSX.Element {
  return <section className={styles.resultFigure} aria-label="The verified 121-bit witness produces the OCaml comment two stars"><div className={styles.resultBits}>{ASIC_WITNESS_BLOCKS.map((block, index) => <span key={`${block}-${index}`}>{block}</span>)}</div><div className={styles.resultText}><span>(*</span><strong>TWO STARS</strong><span>*)</span></div></section>;
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

  return <figure className={styles.showcaseVideo}><video ref={videoRef} src="/media/jsc-asic-showcase.mp4" poster="/blog/asic-reverse-engineering/layout.png" controls loop muted playsInline preload="metadata" aria-label="Real ASIC layer stack assembling, exploding, orbiting, and collapsing" /><figcaption><span>Final layer playback</span><strong>Recovered puzzle geometry · original 1080p viewer export</strong></figcaption></figure>;
}

function VisualForKey({ visualKey, progress }: { visualKey: AsicVisualKey; progress: number }): JSX.Element {
  if (visualKey === 'challenge-pipeline') return <ChallengePipelineDiagram />;
  if (visualKey === 'and-gate') return <AndGateDiagram />;
  if (visualKey === 'layer-stack') return <LayerStackDiagram progress={progress} />;
  if (visualKey === 'rtree') return <RTreeDiagram progress={progress} />;
  if (visualKey === 'circuit-morph') return <CircuitMorphDiagram progress={progress} />;
  if (visualKey === 'scc-dag') return <SccDagDiagram progress={progress} />;
  if (visualKey === 'sat-basics') return <SatBasicsDiagram progress={progress} />;
  if (visualKey === 'sat-timeline') return <SatTimelineDiagram progress={progress} />;
  if (visualKey === 'cache') return <CacheDiagram />;
  if (visualKey === 'io-stream') return <IoStreamDiagram />;
  if (visualKey === 'verification') return <VerificationDiagram />;
  if (visualKey === 'result-decode') return <ResultDecode />;
  return <ShowcaseVideo />;
}

export function AsicStickyStory({ visualKey, children }: AsicStickyStoryProps): JSX.Element {
  const { ref, scrollState } = useScrollDiagramState();
  return <section ref={ref} className={styles.stickyStory} data-visual={visualKey} data-scroll-progress={scrollState.progress.toFixed(3)} data-scroll-start={scrollState.atStart} data-scroll-end={scrollState.atEnd}><div className={styles.stickyCopy}>{children}</div><div className={styles.stickyVisual} data-sticky-visual><VisualForKey visualKey={visualKey} progress={scrollState.progress} /></div></section>;
}

export function AsicInlineVisual({ visualKey }: { visualKey: AsicVisualKey }): JSX.Element {
  return <div className={styles.inlineVisual} data-visual={visualKey}><VisualForKey visualKey={visualKey} progress={1} /></div>;
}
