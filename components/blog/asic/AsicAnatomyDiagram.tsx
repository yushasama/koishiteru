'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DiagramFrame, DiagramProgress, DiagramSvg, type ScrollDiagramProps } from './DiagramPrimitives';
import { DEMO_ASIC_SCENE, type ConductorLayerId, type DemoCell, type DemoContact, type DemoShape, type SceneBox } from './demoAsicScene';
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
  surfaceOpacity?: number;
  interaction?: SceneObject;
  interactive?: boolean;
  selectedObjectKey?: string | null;
  onSelect?: (object: SceneObject) => void;
}

type SceneObject =
  | { key: string; kind: 'cell'; id: string; label: string; box: SceneBox; topZ: number; cell: DemoCell }
  | { key: string; kind: 'shape'; id: string; label: string; box: SceneBox; topZ: number; shape: DemoShape }
  | { key: string; kind: 'contact'; id: string; label: string; box: SceneBox; topZ: number; contact: DemoContact };

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
const LABEL_REVEAL = { start: 0.74, duration: 0.14 } as const;
const LAYER_LABELS: readonly { id: ConductorLayerId; title: string; y: number }[] = [
  { id: 'met5', title: 'MET5', y: 159 },
  { id: 'met4', title: 'MET4', y: 204 },
  { id: 'met3', title: 'MET3', y: 249 },
  { id: 'met2', title: 'MET2', y: 294 },
  { id: 'met1', title: 'MET1', y: 339 },
  { id: 'li1', title: 'LI1', y: 384 },
] as const;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const phase = (progress: number, start: number, duration: number): number => clamp((progress - start) / duration);
const mix = (start: number, end: number, amount: number): number => start + (end - start) * amount;
const points = (value: readonly Point[]): string => value.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function cellBox(cell: DemoCell): SceneBox {
  return { xMin: cell.x, yMin: cell.y, xMax: cell.x + cell.width, yMax: cell.y + cell.height };
}

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

function cellObject(cell: DemoCell): SceneObject {
  return { key: `cell:${cell.id}`, kind: 'cell', id: cell.id, label: `Inspect cell ${cell.id}, ${cell.displayName}`, box: cellBox(cell), topZ: 0.35, cell };
}

function shapeObject(shape: DemoShape, progress: number): SceneObject {
  const style = LAYERS[shape.layer];
  return { key: `shape:${shape.id}`, kind: 'shape', id: shape.id, label: `Inspect ${shape.layer.toUpperCase()} ${shape.kind} ${shape.id} on ${shape.net}`, box: shape.box, topZ: layerZAtProgress(shape.layer, progress) + style.thickness, shape };
}

function contactHeight(contact: DemoContact): number {
  return contact.layer === 'via4' ? 0.42 : 0.34;
}

function contactBaseZ(contact: DemoContact, progress: number): number {
  return layerZAtProgress(contact.lower, progress) + LAYERS[contact.lower].thickness + 0.08;
}

function contactObject(contact: DemoContact, progress: number): SceneObject {
  return { key: `contact:${contact.id}`, kind: 'contact', id: contact.id, label: `Inspect ${contact.layer.toUpperCase()} contact ${contact.id} on ${contact.net}`, box: contact.box, topZ: contactBaseZ(contact, progress) + contactHeight(contact), contact };
}

function sceneObjectsAtProgress(progress: number): readonly SceneObject[] {
  return [...DEMO_ASIC_SCENE.cells.map(cellObject), ...DEMO_ASIC_SCENE.shapes.map((shape) => shapeObject(shape, progress)), ...DEMO_ASIC_SCENE.contacts.map((contact) => contactObject(contact, progress))];
}

function Cuboid({ box, z, height, body, edge, opacity = 1, quietSides = false, surfaceOpacity, interaction, interactive = false, selectedObjectKey = null, onSelect }: CuboidProps): JSX.Element {
  const bottom = [project(box.xMin, box.yMin, z), project(box.xMax, box.yMin, z), project(box.xMax, box.yMax, z), project(box.xMin, box.yMax, z)] as const;
  const top = [project(box.xMin, box.yMin, z + height), project(box.xMax, box.yMin, z + height), project(box.xMax, box.yMax, z + height), project(box.xMin, box.yMax, z + height)] as const;
  const selectable = interactive && interaction !== undefined && onSelect !== undefined;
  const select = (): void => { if (selectable) onSelect(interaction); };
  return (
    <g className={selectable ? styles.anatomyObjectTarget : undefined} data-object-key={interaction?.key} role={selectable ? 'button' : undefined} tabIndex={selectable ? 0 : undefined} aria-label={selectable ? interaction.label : undefined} aria-pressed={selectable ? selectedObjectKey === interaction.key : undefined} opacity={opacity} stroke={edge} strokeWidth="0.55" strokeLinejoin="round" vectorEffect="non-scaling-stroke" onClick={selectable ? select : undefined} onKeyDown={selectable ? (event) => { if (event.key !== 'Enter' && event.key !== ' ') return; event.preventDefault(); select(); } : undefined}>
      <polygon points={points([bottom[0], bottom[1], top[1], top[0]])} fill={body} fillOpacity={quietSides ? 0.16 : 0.35} />
      <polygon points={points([bottom[1], bottom[2], top[2], top[1]])} fill={body} fillOpacity={quietSides ? 0.1 : 0.24} />
      <polygon className={selectable ? styles.anatomyObjectSurface : undefined} points={points(top)} fill={body} fillOpacity={surfaceOpacity ?? (quietSides ? 0.72 : 0.94)} />
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
    <g opacity={opacity} fill="none" stroke={LAYERS[layer].edge} strokeWidth="0.45" vectorEffect="non-scaling-stroke" pointerEvents="none">
      <polygon points={points(corners)} fill="#dceeff" fillOpacity="0.08" strokeOpacity="0.22" />
      {[...siteLines, ...trackLines].map(([start, end], index) => <line key={index} x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} strokeOpacity="0.13" />)}
    </g>
  );
}

function DeviceRegion({ reveal, interactive, selectedObjectKey, onSelect }: { reveal: number; interactive: boolean; selectedObjectKey: string | null; onSelect: (object: SceneObject) => void }): JSX.Element {
  const bounds = DEMO_ASIC_SCENE.bounds;
  const silicon = { xMin: bounds.xMin - 0.08, yMin: bounds.yMin - 0.08, xMax: bounds.xMax + 0.08, yMax: bounds.yMax + 0.08 };
  const siliconTop = [project(silicon.xMin, silicon.yMin, 0.02), project(silicon.xMax, silicon.yMin, 0.02), project(silicon.xMax, silicon.yMax, 0.02), project(silicon.xMin, silicon.yMax, 0.02)] as const;
  return (
    <g>
      <Cuboid box={silicon} z={-1.9} height={1.9} body="#11161b" edge="#66717b" opacity={0.94} quietSides />
      <polygon points={points(siliconTop)} fill="url(#silicon-sheen)" opacity={mix(0.42, 0.12, reveal)} />
      <g opacity={mix(0.14, 0.94, reveal)}>
        {DEMO_ASIC_SCENE.cells.map((cell) => <Cuboid key={cell.id} box={cellBox(cell)} z={0.05} height={0.3} body="#15191e" edge="#4b535b" quietSides surfaceOpacity={0.94} interaction={cellObject(cell)} interactive={interactive} selectedObjectKey={selectedObjectKey} onSelect={onSelect} />)}
      </g>
    </g>
  );
}

function Nand2Schematic(): JSX.Element {
  return (
    <svg className={styles.anatomyCellSchematic} viewBox="0 0 240 108" role="img" aria-label="Two-input NAND gate: inputs A and B feed an AND-shaped gate with an inverted output Y">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M92 26H118C142 26 156 40 156 54S142 82 118 82H92Z" />
        <line x1="28" y1="39" x2="92" y2="39" /><line x1="28" y1="69" x2="92" y2="69" />
        <circle cx="164" cy="54" r="7" /><line x1="171" y1="54" x2="220" y2="54" />
      </g>
      <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace" fontSize="13" fontWeight="800"><text x="14" y="43">A</text><text x="14" y="73">B</text><text x="224" y="58">Y</text></g>
    </svg>
  );
}

function PhysicalCellSchematic({ cell }: { cell: DemoCell }): JSX.Element {
  const isDecap = cell.functionId === 'decap';
  return (
    <svg className={styles.anatomyCellSchematic} viewBox="0 0 240 108" role="img" aria-label={isDecap ? 'Decoupling capacitor connected between the power and ground rails' : 'Well tap tying the substrate and well to the power rails'}>
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="22" y1="22" x2="218" y2="22" /><line x1="22" y1="86" x2="218" y2="86" />
        {isDecap ? <><line x1="120" y1="22" x2="120" y2="46" /><line x1="96" y1="46" x2="144" y2="46" strokeWidth="5" /><line x1="96" y1="62" x2="144" y2="62" strokeWidth="5" /><line x1="120" y1="62" x2="120" y2="86" /></> : <><line x1="120" y1="22" x2="120" y2="86" /><circle cx="120" cy="54" r="8" fill="currentColor" /></>}
      </g>
      <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace" fontSize="12" fontWeight="800"><text x="22" y="16">VPWR</text><text x="22" y="103">VGND</text></g>
    </svg>
  );
}

function SelectedObjectOutline({ object }: { object: SceneObject }): JSX.Element {
  const outline = [project(object.box.xMin, object.box.yMin, object.topZ + 0.08), project(object.box.xMax, object.box.yMin, object.topZ + 0.08), project(object.box.xMax, object.box.yMax, object.topZ + 0.08), project(object.box.xMin, object.box.yMax, object.topZ + 0.08)];
  return <polygon className={styles.anatomyCellHighlight} data-selected-object-key={object.key} points={points(outline)} />;
}

function CellInspector({ cell, onClose }: { cell: DemoCell; onClose: () => void }): JSX.Element {
  return (
    <aside className={styles.anatomyCellInspector} data-cell-id={cell.id} aria-label={`${cell.id} cell details`}>
      <header><span>{cell.id} · {cell.displayName}</span><button type="button" onClick={onClose} aria-label="Close cell details">×</button></header>
      <small>CELL = PLACED FOOTPRINT · LI1 = LOCAL WIRING</small>
      {cell.role === 'logic' ? <Nand2Schematic /> : <PhysicalCellSchematic cell={cell} />}
      {cell.equation && <strong className={styles.anatomyCellEquation}>{cell.equation}</strong>}
      <p>{cell.description}</p>
      <code>{cell.cellName}</code>
    </aside>
  );
}

function SceneObjectInspector({ object, onClose }: { object: SceneObject; onClose: () => void }): JSX.Element {
  if (object.kind === 'cell') return <CellInspector cell={object.cell} onClose={onClose} />;
  const title = object.kind === 'shape' ? `${object.shape.layer.toUpperCase()} · ${object.shape.kind.toUpperCase()}` : `${object.contact.layer.toUpperCase()} · CONTACT`;
  const description = object.kind === 'shape' ? `Exact ${object.shape.layer.toUpperCase()} conductor geometry on net ${object.shape.net}.` : `Exact vertical link from ${object.contact.lower.toUpperCase()} to ${object.contact.upper.toUpperCase()} on net ${object.contact.net}.`;
  return (
    <aside className={styles.anatomyCellInspector} data-object-key={object.key} aria-label={`${object.id} geometry details`}>
      <header><span>{title}</span><button type="button" onClick={onClose} aria-label="Close geometry details">×</button></header>
      <strong className={styles.anatomyCellEquation}>{object.id}</strong>
      <p>{description}</p>
      <code>{object.kind === 'shape' ? object.shape.net : object.contact.net}</code>
    </aside>
  );
}

function ConductorLayers({ progress, interactive, selectedObjectKey, onSelect }: { progress: number; interactive: boolean; selectedObjectKey: string | null; onSelect: (object: SceneObject) => void }): JSX.Element {
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
            {DEMO_ASIC_SCENE.shapes.filter((shape) => shape.layer === layer).map((shape) => <Cuboid key={shape.id} box={shape.box} z={z} height={style.thickness} body={style.body} edge={style.edge} quietSides interaction={shapeObject(shape, progress)} interactive={interactive} selectedObjectKey={selectedObjectKey} onSelect={onSelect} />)}
          </g>
        );
      })}
    </>
  );
}

function ContactCuts({ progress, interactive, selectedObjectKey, onSelect }: { progress: number; interactive: boolean; selectedObjectKey: string | null; onSelect: (object: SceneObject) => void }): JSX.Element {
  return <g>{DEMO_ASIC_SCENE.contacts.map((contact) => <ContactCut key={contact.id} contact={contact} progress={progress} interactive={interactive} selectedObjectKey={selectedObjectKey} onSelect={onSelect} />)}</g>;
}

function ContactCut({ contact, progress, interactive, selectedObjectKey, onSelect }: { contact: DemoContact; progress: number; interactive: boolean; selectedObjectKey: string | null; onSelect: (object: SceneObject) => void }): JSX.Element {
  const reveal = phase(progress, CONTACT_REVEAL[contact.layer], 0.08);
  return (
    <g opacity={reveal}>
      <Cuboid box={contact.box} z={contactBaseZ(contact, progress)} height={contactHeight(contact)} body={CONTACT_COLORS.body} edge={CONTACT_COLORS.edge} quietSides interaction={contactObject(contact, progress)} interactive={interactive && reveal > 0.72} selectedObjectKey={selectedObjectKey} onSelect={onSelect} />
    </g>
  );
}

function LayerLabels({ opacity }: { opacity: number }): JSX.Element {
  return (
    <g aria-hidden="true" className={styles.anatomyLegend} opacity={opacity} fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace">
      {LAYER_LABELS.map((label) => <g key={label.id}><rect x="582" y={label.y - 8} width="11" height="11" fill={LAYERS[label.id].body} stroke={LAYERS[label.id].edge} strokeWidth="0.8" /><text className={styles.anatomyLayerTitle} x="602" y={label.y + 2} fill="#e3e3e3" fontSize="16" fontWeight="800">{label.title}</text></g>)}
      <g><rect x="582" y="421" width="11" height="11" fill={CONTACT_COLORS.body} stroke={CONTACT_COLORS.edge} strokeWidth="0.8" /><text className={styles.anatomyLayerTitle} x="602" y="431" fill="#e3e3e3" fontSize="16" fontWeight="800">VIA CUTS</text></g>
    </g>
  );
}

function MobileLegend(): JSX.Element {
  return (
    <details className={styles.anatomyMobileLegend}>
      <summary><span className={styles.anatomyLegendIcon} aria-hidden="true"><i /><i /><i /></span><span>Legends</span></summary>
      <ul className={styles.anatomyMobileLegendList} aria-label="ASIC layer legend">
        {LAYER_LABELS.map((label) => <li key={label.id} className={styles.anatomyMobileLegendItem}><i aria-hidden="true" style={{ background: LAYERS[label.id].body, borderColor: LAYERS[label.id].edge }} /><span><b>{label.title}</b></span></li>)}
        <li className={styles.anatomyMobileLegendItem}><i aria-hidden="true" style={{ background: CONTACT_COLORS.body, borderColor: CONTACT_COLORS.edge }} /><span><b>VIA CUTS</b></span></li>
      </ul>
    </details>
  );
}

function PinLabels({ opacity, progress }: { opacity: number; progress: number }): JSX.Element {
  return (
    <g aria-hidden="true" className={styles.anatomyPinLabels} opacity={opacity} fill="#f4f7fa" fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace" fontSize="12" fontWeight="800" pointerEvents="none">
      {DEMO_ASIC_SCENE.pins.filter((pin) => pin.displayName !== null && pin.role !== 'power').map((pin) => {
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
  const [selectedObjectKey, setSelectedObjectKey] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cellsReveal = phase(progress, 0.1, 0.16);
  const labels = phase(progress, LABEL_REVEAL.start, LABEL_REVEAL.duration);
  const progressLabel = progress < 0.24 ? 'Reveal standard-cell placements' : progress < 0.68 ? 'Lift conductors and adjacent-layer via cuts' : 'Separate LI1 through MET5';
  const selectedObject = sceneObjectsAtProgress(progress).find((object) => object.key === selectedObjectKey) ?? null;
  const sceneCenterX = (DEMO_ASIC_SCENE.bounds.xMin + DEMO_ASIC_SCENE.bounds.xMax) / 2;
  const swapPanels = selectedObject !== null && (selectedObject.box.xMin + selectedObject.box.xMax) / 2 < sceneCenterX;

  useEffect(() => {
    if (!selectedObjectKey) return;
    const closeOutside = (event: PointerEvent): void => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(`.${styles.anatomyCellInspector}`) || target.closest(`.${styles.anatomyObjectTarget}`)) return;
      setSelectedObjectKey(null);
    };
    const closeOnEscape = (event: KeyboardEvent): void => { if (event.key === 'Escape') setSelectedObjectKey(null); };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeOnEscape); };
  }, [selectedObjectKey]);

  return (
    <DiagramFrame label="ASIC anatomy" status="" corner="SCHEMATIC · NOT TO SCALE" headingLayout="stacked">
      <div ref={stageRef} className={`${styles.anatomyStage} ${selectedObject ? styles.anatomyStageSelected : ''} ${swapPanels ? styles.anatomyStageSwapPanels : ''}`}>
        <div className={styles.anatomyCanvas}>
          <DiagramSvg width={760} height={620} ariaLabel="A thin ASIC die separates into eight selected SKY130 standard-cell masters, LI1, MET1 through MET5, and local cuts between adjacent routing layers. Each visible object can be inspected directly." className={styles.anatomyDiagram} contentScale={1} progress={progress} progressEnd={LABEL_REVEAL.start + LABEL_REVEAL.duration} progressLabel={progressLabel} showBoard={false}>
            <defs>
              <linearGradient id="silicon-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#70808a" stopOpacity="0.2" /><stop offset="0.42" stopColor="#17242c" stopOpacity="0.08" /><stop offset="1" stopColor="#83949d" stopOpacity="0.16" /></linearGradient>
              <linearGradient id="anatomy-selection-tint" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff9fbe" stopOpacity="0.15" /><stop offset="0.48" stopColor="#fb4e7c" stopOpacity="0.08" /><stop offset="1" stopColor="#7d2948" stopOpacity="0.025" /></linearGradient>
            </defs>
            <g className={styles.anatomyChipScene}>
              <DeviceRegion reveal={cellsReveal} interactive={cellsReveal > 0.72} selectedObjectKey={selectedObjectKey} onSelect={(object) => setSelectedObjectKey(object.key)} />
              <ConductorLayers progress={progress} interactive={cellsReveal > 0.72} selectedObjectKey={selectedObjectKey} onSelect={(object) => setSelectedObjectKey(object.key)} />
              <ContactCuts progress={progress} interactive={cellsReveal > 0.72} selectedObjectKey={selectedObjectKey} onSelect={(object) => setSelectedObjectKey(object.key)} />
              <PinLabels opacity={phase(progress, 0.24, 0.12)} progress={progress} />
              {selectedObject && <SelectedObjectOutline object={selectedObject} />}
            </g>

            <LayerLabels opacity={labels} />
          </DiagramSvg>
        </div>
        {selectedObject && cellsReveal > 0.5 && <SceneObjectInspector object={selectedObject} onClose={() => setSelectedObjectKey(null)} />}
        <MobileLegend />
        <div className={styles.anatomyMobileProgress}><DiagramProgress progress={progress} progressEnd={LABEL_REVEAL.start + LABEL_REVEAL.duration} label={progressLabel} /></div>
      </div>
    </DiagramFrame>
  );
}
