'use client';

import React from 'react';
import { DiagramFrame, DiagramSvg, type ScrollDiagramProps } from './DiagramPrimitives';
import { DEMO_ASIC_SCENE, type ConductorLayerId, type DemoContact, type SceneBox } from './demoAsicScene';
import styles from './asic.module.css';

type Point = readonly [number, number];

interface LayerStyle {
  body: string;
  edge: string;
  thickness: number;
  baseZ: number;
  explodedZ: number;
  separateStart: number;
}

interface CuboidProps {
  box: SceneBox;
  z: number;
  height: number;
  body: string;
  edge: string;
  opacity?: number;
  quietSides?: boolean;
}

const LAYER_ORDER: readonly ConductorLayerId[] = ['li1', 'met1', 'met2', 'met3', 'met4', 'met5'];
const LAYERS: Readonly<Record<ConductorLayerId, LayerStyle>> = {
  li1: { body: '#009bc2', edge: '#00eaff', thickness: 0.16, baseZ: 0.42, explodedZ: 15, separateStart: 0.2 },
  met1: { body: '#d91470', edge: '#ff2d95', thickness: 0.18, baseZ: 0.55, explodedZ: 55, separateStart: 0.28 },
  met2: { body: '#173f9f', edge: '#2d64ff', thickness: 0.18, baseZ: 0.68, explodedZ: 95, separateStart: 0.38 },
  met3: { body: '#45d66b', edge: '#00ff9d', thickness: 0.22, baseZ: 0.81, explodedZ: 135, separateStart: 0.48 },
  met4: { body: '#16803a', edge: '#5dff2d', thickness: 0.22, baseZ: 0.94, explodedZ: 175, separateStart: 0.58 },
  met5: { body: '#7048ff', edge: '#ff36f4', thickness: 0.24, baseZ: 1.08, explodedZ: 215, separateStart: 0.68 },
};
const CONTACT_REVEAL = { mcon: 0.24, via: 0.32, via2: 0.42, via3: 0.52, via4: 0.62 } as const;
const CONTACT_COLORS = { body: '#c77b16', edge: '#ff9c24' } as const;
const LAYER_LABELS: readonly { id: ConductorLayerId; title: string; detail?: string; y: number }[] = [
  { id: 'met5', title: 'MET5', detail: 'global power strap', y: 156 },
  { id: 'met4', title: 'MET4', y: 205 },
  { id: 'met3', title: 'MET3', y: 249 },
  { id: 'met2', title: 'MET2', y: 293 },
  { id: 'met1', title: 'MET1', y: 337 },
  { id: 'li1', title: 'LI1', detail: 'cell-local wiring', y: 388 },
] as const;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const phase = (progress: number, start: number, duration: number): number => clamp((progress - start) / duration);
const mix = (start: number, end: number, amount: number): number => start + (end - start) * amount;
const points = (value: readonly Point[]): string => value.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function project(x: number, y: number, z: number): Point {
  const bounds = DEMO_ASIC_SCENE.bounds;
  const localX = x - (bounds.xMin + bounds.xMax) / 2;
  const localY = y - (bounds.yMin + bounds.yMax) / 2;
  return [360 + localX * 50 + localY * 26, 393 + localX * 13 - localY * 24 - z];
}

function layerSeparation(layer: ConductorLayerId, progress: number): number {
  return phase(progress, LAYERS[layer].separateStart, 0.16);
}

function layerZAtProgress(layer: ConductorLayerId, progress: number): number {
  const style = LAYERS[layer];
  const commonLift = mix(0, 8, phase(progress, 0.1, 0.16));
  return mix(style.baseZ + commonLift, style.explodedZ, layerSeparation(layer, progress));
}

function Cuboid({ box, z, height, body, edge, opacity = 1, quietSides = false }: CuboidProps): JSX.Element {
  const bottom = [project(box.xMin, box.yMin, z), project(box.xMax, box.yMin, z), project(box.xMax, box.yMax, z), project(box.xMin, box.yMax, z)] as const;
  const top = [project(box.xMin, box.yMin, z + height), project(box.xMax, box.yMin, z + height), project(box.xMax, box.yMax, z + height), project(box.xMin, box.yMax, z + height)] as const;
  return (
    <g opacity={opacity} stroke={edge} strokeWidth="0.55" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
      <polygon points={points([bottom[0], bottom[1], top[1], top[0]])} fill={body} fillOpacity={quietSides ? 0.16 : 0.35} />
      <polygon points={points([bottom[1], bottom[2], top[2], top[1]])} fill={body} fillOpacity={quietSides ? 0.1 : 0.24} />
      <polygon points={points(top)} fill={body} fillOpacity={quietSides ? 0.72 : 0.94} />
    </g>
  );
}

function GuidePlane({ layer, z, opacity }: { layer: ConductorLayerId; z: number; opacity: number }): JSX.Element {
  const bounds = DEMO_ASIC_SCENE.bounds;
  const corners = [project(bounds.xMin, bounds.yMin, z), project(bounds.xMax, bounds.yMin, z), project(bounds.xMax, bounds.yMax, z), project(bounds.xMin, bounds.yMax, z)] as const;
  const siteLines = DEMO_ASIC_SCENE.cells.slice(1).map((cell) => [project(cell.x, bounds.yMin, z + 0.05), project(cell.x, bounds.yMax, z + 0.05)] as const);
  const trackLines = [0.25, 0.5, 0.75].map((amount) => {
    const y = mix(bounds.yMin, bounds.yMax, amount);
    return [project(bounds.xMin, y, z + 0.05), project(bounds.xMax, y, z + 0.05)] as const;
  });
  return (
    <g opacity={opacity} fill="none" stroke={LAYERS[layer].edge} strokeWidth="0.45" vectorEffect="non-scaling-stroke">
      <polygon points={points(corners)} fill="#dceeff" fillOpacity="0.08" strokeOpacity="0.22" />
      {[...siteLines, ...trackLines].map(([start, end], index) => <line key={index} x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} strokeOpacity="0.13" />)}
    </g>
  );
}

function DeviceRegion({ reveal }: { reveal: number }): JSX.Element {
  const bounds = DEMO_ASIC_SCENE.bounds;
  const silicon = { xMin: bounds.xMin - 0.08, yMin: bounds.yMin - 0.08, xMax: bounds.xMax + 0.08, yMax: bounds.yMax + 0.08 };
  const siliconTop = [project(silicon.xMin, silicon.yMin, 0.02), project(silicon.xMax, silicon.yMin, 0.02), project(silicon.xMax, silicon.yMax, 0.02), project(silicon.xMin, silicon.yMax, 0.02)] as const;
  return (
    <g>
      <Cuboid box={silicon} z={-1.9} height={1.9} body="#11161b" edge="#66717b" opacity={0.94} quietSides />
      <polygon points={points(siliconTop)} fill="url(#silicon-sheen)" opacity={mix(0.42, 0.12, reveal)} />
      <g opacity={mix(0.14, 0.94, reveal)}>
        {DEMO_ASIC_SCENE.cells.map((cell, index) => <Cuboid key={cell.id} box={{ xMin: cell.x, yMin: cell.y, xMax: cell.x + cell.width, yMax: cell.y + cell.height }} z={0.05} height={0.3} body={index % 2 ? '#28212c' : '#1d2028'} edge="#8b7894" quietSides />)}
      </g>
    </g>
  );
}

function ConductorLayers({ progress }: { progress: number }): JSX.Element {
  return (
    <>
      {LAYER_ORDER.map((layer) => {
        const style = LAYERS[layer];
        const separation = layerSeparation(layer, progress);
        const visibility = mix(0.18, 1, phase(progress, style.separateStart - 0.05, 0.12));
        const z = layerZAtProgress(layer, progress);
        return (
          <g key={layer} opacity={visibility}>
            <GuidePlane layer={layer} z={z - 0.12} opacity={separation * 0.14} />
            {DEMO_ASIC_SCENE.shapes.filter((shape) => shape.layer === layer).map((shape) => <Cuboid key={shape.id} box={shape.box} z={z} height={style.thickness} body={style.body} edge={style.edge} quietSides />)}
          </g>
        );
      })}
    </>
  );
}

function ContactCuts({ progress }: { progress: number }): JSX.Element {
  return <g>{DEMO_ASIC_SCENE.contacts.map((contact) => <ContactCut key={contact.id} contact={contact} progress={progress} />)}</g>;
}

function ContactCut({ contact, progress }: { contact: DemoContact; progress: number }): JSX.Element {
  const reveal = phase(progress, CONTACT_REVEAL[contact.layer], 0.08);
  const lowerZ = layerZAtProgress(contact.lower, progress) + LAYERS[contact.lower].thickness;
  const cutHeight = contact.layer === 'via4' ? 0.42 : 0.34;
  return (
    <g opacity={reveal}>
      <Cuboid box={contact.box} z={lowerZ + 0.08} height={cutHeight} body={CONTACT_COLORS.body} edge={CONTACT_COLORS.edge} quietSides />
    </g>
  );
}

function LayerLabels({ opacity }: { opacity: number }): JSX.Element {
  return (
    <g aria-hidden="true" className={styles.anatomyLegend} opacity={opacity} fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace">
      {LAYER_LABELS.map((label) => <g key={label.id}><rect x="582" y={label.y - 8} width="11" height="11" fill={LAYERS[label.id].body} stroke={LAYERS[label.id].edge} strokeWidth="0.8" /><text className={styles.anatomyLayerTitle} x="602" y={label.y - (label.detail ? 2 : -2)} fill="#e3e3e3" fontSize="16" fontWeight="800">{label.title}</text>{label.detail && <text className={styles.anatomyLayerDetail} x="602" y={label.y + 11} fill="#a0a0a0" fontSize="11.5">{label.detail}</text>}</g>)}
      <g><rect x="582" y="426" width="11" height="11" fill={CONTACT_COLORS.body} stroke={CONTACT_COLORS.edge} strokeWidth="0.8" /><text className={styles.anatomyLayerTitle} x="602" y="432" fill="#e3e3e3" fontSize="16" fontWeight="800">VIA CUTS</text><text className={styles.anatomyLayerDetail} x="602" y="447" fill="#a0a0a0" fontSize="11.5">adjacent-layer links</text></g>
      <text className={styles.anatomyPowerLabel} x="602" y="490" fill="#e3e3e3" fontSize="13" fontWeight="800">VDD · POWER</text>
      <text className={styles.anatomyPowerLabel} x="602" y="514" fill="#e3e3e3" fontSize="13" fontWeight="800">GND · GROUND</text>
    </g>
  );
}

function MobileLegend(): JSX.Element {
  return (
    <div className={styles.anatomyMobileLegend} aria-hidden="true">
      {LAYER_LABELS.map((label) => <div key={label.id} className={styles.anatomyMobileLegendItem}><i style={{ background: LAYERS[label.id].body, borderColor: LAYERS[label.id].edge }} /><span><b>{label.title}</b>{label.detail && <small>{label.detail}</small>}</span></div>)}
      <div className={`${styles.anatomyMobileLegendItem} ${styles.anatomyMobileLegendWide}`}><i style={{ background: CONTACT_COLORS.body, borderColor: CONTACT_COLORS.edge }} /><span><b>VIA CUTS</b><small>vertical links between layers</small></span></div>
      <div className={styles.anatomyMobilePower}><b>VDD <small>POWER</small></b><b>GND <small>GROUND</small></b></div>
    </div>
  );
}

function PinLabels({ opacity, progress }: { opacity: number; progress: number }): JSX.Element {
  return (
    <g aria-hidden="true" className={styles.anatomyPinLabels} opacity={opacity} fill="#f4f7fa" fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace" fontSize="9.5" fontWeight="800">
      {DEMO_ASIC_SCENE.pins.filter((pin) => pin.displayName !== null).map((pin) => {
        const centerX = (pin.box.xMin + pin.box.xMax) / 2;
        const centerY = (pin.box.yMin + pin.box.yMax) / 2;
        const style = LAYERS[pin.layer];
        const [x, y] = project(centerX, centerY, layerZAtProgress(pin.layer, progress) + style.thickness + 2.8);
        return <g key={pin.id}><circle cx={x} cy={y + 6} r="1.65" fill={style.edge} /><text x={x} y={y} textAnchor="middle">{pin.displayName}</text></g>;
      })}
    </g>
  );
}

export function AsicAnatomyDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const cellsReveal = phase(progress, 0.1, 0.16);
  const labels = phase(progress, 0.74, 0.14);

  return (
    <DiagramFrame label="ASIC anatomy" status="" corner="SCHEMATIC · NOT TO SCALE" headingLayout="stacked" progress={progress}>
      <div className={styles.anatomyStage}>
        <DiagramSvg width={760} height={560} ariaLabel="A thin bare silicon ASIC die with source-derived layout texture separates into eight abstract standard-cell placements, LI1, MET1 through MET5, and tiny local cuts between adjacent routing layers." className={styles.anatomyDiagram} contentScale={1}>
          <defs><filter id="anatomy-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" /></filter><linearGradient id="silicon-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#70808a" stopOpacity="0.2" /><stop offset="0.42" stopColor="#17242c" stopOpacity="0.08" /><stop offset="1" stopColor="#83949d" stopOpacity="0.16" /></linearGradient></defs>
          <g transform="translate(-40 0)">
            <ellipse cx="360" cy="458" rx="202" ry="18" fill="#000" opacity="0.72" filter="url(#anatomy-glow)" />
            <DeviceRegion reveal={cellsReveal} />
            <ConductorLayers progress={progress} />
            <ContactCuts progress={progress} />
            <PinLabels opacity={phase(progress, 0.24, 0.12)} progress={progress} />

            <g aria-hidden="true" opacity={cellsReveal} fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace">
              <text className={styles.anatomyCellTitle} x="174" y="482" fill="#d9c8e8" fontSize="16" fontWeight="800">STANDARD-CELL PLACEMENTS</text><text className={styles.anatomyCellDetail} x="174" y="498" fill="#a0a0a0" fontSize="11.5">abstract logic region on silicon</text>
            </g>
          </g>

          <LayerLabels opacity={labels} />
        </DiagramSvg>
        <MobileLegend />
      </div>
    </DiagramFrame>
  );
}
