'use client';

import React from 'react';
import { DiagramFrame, DiagramSvg, type ScrollDiagramProps } from './DiagramPrimitives';
import { DEMO_ASIC_SCENE, type NetId, type SceneBox } from './demoAsicScene';
import styles from './asic.module.css';

const SIGNAL_NETS = ['sig_a', 'sig_b', 'sig_y'] as const satisfies readonly NetId[];
const SIGNAL_COLORS: Readonly<Record<(typeof SIGNAL_NETS)[number], string>> = { sig_a: '#63d6ff', sig_b: '#f0c557', sig_y: '#7ce5a8' };
const NET_ROWS = [
  { net: 'sig_a', display: 'A', source: 'U0 · A', sink: 'U6 · A_SINK' },
  { net: 'sig_b', display: 'B', source: 'U1 · B', sink: 'U6 · B_SINK' },
  { net: 'sig_y', display: 'Y', source: 'U3 · Y_SOURCE', sink: 'U7 · Y' },
] as const;

interface LayoutViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

function mapBox(box: SceneBox, viewport: LayoutViewport): { x: number; y: number; width: number; height: number } {
  const bounds = DEMO_ASIC_SCENE.bounds;
  const scaleX = viewport.width / (bounds.xMax - bounds.xMin);
  const scaleY = viewport.height / (bounds.yMax - bounds.yMin);
  return { x: viewport.x + (box.xMin - bounds.xMin) * scaleX, y: viewport.y + viewport.height - (box.yMax - bounds.yMin) * scaleY, width: (box.xMax - box.xMin) * scaleX, height: (box.yMax - box.yMin) * scaleY };
}

function DemoLayout({ viewport }: { viewport: LayoutViewport }): JSX.Element {
  return (
    <g>
      <rect x={viewport.x} y={viewport.y} width={viewport.width} height={viewport.height} fill="#080808" stroke="#3a3a3a" />
      {DEMO_ASIC_SCENE.cells.map((cell) => {
        const box = mapBox({ xMin: cell.x, yMin: cell.y, xMax: cell.x + cell.width, yMax: cell.y + cell.height }, viewport);
        return <g key={cell.id}><rect {...box} fill="none" stroke="#303030" /><text x={box.x + box.width / 2} y={viewport.y + viewport.height - 8} textAnchor="middle" fill="#a0a0a0" fontFamily="monospace" fontSize="12">{cell.id}</text></g>;
      })}
      {DEMO_ASIC_SCENE.shapes.filter((shape) => SIGNAL_NETS.includes(shape.net as (typeof SIGNAL_NETS)[number])).map((shape) => {
        const box = mapBox(shape.box, viewport);
        const color = SIGNAL_COLORS[shape.net as (typeof SIGNAL_NETS)[number]];
        return <rect key={shape.id} {...box} fill={color} fillOpacity={shape.layer === 'met3' ? 0.32 : 0.16} stroke={color} strokeWidth={shape.layer === 'met3' ? 1.4 : 0.9} vectorEffect="non-scaling-stroke" />;
      })}
      {DEMO_ASIC_SCENE.contacts.filter((contact) => SIGNAL_NETS.includes(contact.net as (typeof SIGNAL_NETS)[number])).map((contact) => {
        const box = mapBox(contact.box, viewport);
        return <rect key={contact.id} {...box} fill="#f8dc7a" stroke="#fff0ae" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />;
      })}
      {DEMO_ASIC_SCENE.pins.filter((pin) => SIGNAL_NETS.includes(pin.net as (typeof SIGNAL_NETS)[number])).map((pin) => {
        const box = mapBox(pin.box, viewport);
        return <text key={pin.id} x={box.x + box.width / 2} y={box.y - 5} textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="12" fontWeight="760">{pin.name}</text>;
      })}
    </g>
  );
}

function DesktopLayoutToNets({ progress }: ScrollDiagramProps): JSX.Element {
  const netsVisible = clamp((progress - 0.2) / 0.3);
  const pinsVisible = clamp((progress - 0.55) / 0.3);
  return (
    <DiagramSvg className={styles.layoutNetsDesktop} width={900} height={600} ariaLabel="The actual LI1 through MET3 conductor rectangles and via cuts from the demo ASIC resolve into signal nets A, B, and Y and their source and destination pins" progress={progress} progressLabel={progress < 0.35 ? 'Trace same-layer conductor rectangles' : progress < 0.7 ? 'Merge touching rectangles through via cuts' : 'Resolve connected components into named nets'} showBoard={false}>
      <text x="40" y="42" fill="#c0c0c0" fontFamily="monospace" fontSize="14" fontWeight="760">ACTUAL DEMO GDS FOOTPRINTS · LI1–MET3 + VIA CUTS</text>
      <DemoLayout viewport={{ x: 40, y: 62, width: 510, height: 215 }} />
      <g transform="translate(580 62)">
        <rect width="280" height="215" fill="#0d0d0d" stroke="#303030" />
        <text x="18" y="28" fill="#eee" fontFamily="monospace" fontSize="14" fontWeight="760">LEGEND</text>
        <text x="18" y="56" fill="#ccc" fontFamily="monospace" fontSize="12.5">U0–U7</text><text x="88" y="56" fill="#fff" fontFamily="monospace" fontSize="12.5">placed demo cells</text>
        <text x="18" y="82" fill="#ccc" fontFamily="monospace" fontSize="12.5">A / B</text><text x="88" y="82" fill="#fff" fontFamily="monospace" fontSize="12.5">input pins</text>
        <text x="18" y="108" fill="#ccc" fontFamily="monospace" fontSize="12.5">Y</text><text x="88" y="108" fill="#fff" fontFamily="monospace" fontSize="12.5">output pin</text>
        <text x="18" y="134" fill="#ccc" fontFamily="monospace" fontSize="12.5">A_SINK</text><text x="88" y="134" fill="#fff" fontFamily="monospace" fontSize="12.5">internal destination</text>
        <text x="18" y="158" fill="#ccc" fontFamily="monospace" fontSize="12.5">B_SINK</text><text x="88" y="158" fill="#fff" fontFamily="monospace" fontSize="12.5">internal destination</text>
        <text x="18" y="182" fill="#ccc" fontFamily="monospace" fontSize="12.5">Y_SOURCE</text><text x="88" y="182" fill="#fff" fontFamily="monospace" fontSize="12.5">internal source</text>
        <rect x="18" y="197" width="9" height="9" fill="#f8dc7a" /><text x="38" y="206" fill="#ccc" fontFamily="monospace" fontSize="12">via / contact cut</text>
      </g>
      <g opacity={netsVisible} transform={`translate(0 ${12 * (1 - netsVisible)})`}>
        <text x="40" y="320" fill="#c0c0c0" fontFamily="monospace" fontSize="15" fontWeight="760">CONNECTED RECTANGLES BECOME ELECTRICAL NETS</text>
        {NET_ROWS.map((row, index) => {
          const color = SIGNAL_COLORS[row.net];
          const y = 346 + index * 58;
          return <g key={row.net}><rect x="40" y={y} width="820" height="44" rx="4" fill="#0e0e0e" stroke={color} strokeOpacity="0.55" /><text x="160" y={y + 28} textAnchor="middle" fill={color} fontFamily="monospace" fontSize="14" fontWeight="760">{row.net}</text><g opacity={pinsVisible}><text x="430" y={y + 29} textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14">{row.source}</text><text x="700" y={y + 29} textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14">{row.sink}</text></g></g>;
        })}
      </g>
    </DiagramSvg>
  );
}

function MobileLayoutToNets({ progress }: ScrollDiagramProps): JSX.Element {
  return (
    <DiagramSvg className={styles.layoutNetsMobile} width={360} height={700} ariaLabel="The actual demo ASIC conductor footprints resolve into three electrical nets and their source and destination pins" contentScale={1} inset={12} progress={progress} progressLabel="Resolve connected rectangles into nets" showBoard={false}>
      <text x="22" y="34" fill="#c0c0c0" fontFamily="monospace" fontSize="12" fontWeight="760">ACTUAL LI1–MET3 RECTANGLES + VIA CUTS</text>
      <DemoLayout viewport={{ x: 22, y: 52, width: 316, height: 134 }} />
      <text x="22" y="218" fill="#eee" fontFamily="monospace" fontSize="13" fontWeight="760">LEGEND</text>
      <text x="22" y="242" fill="#bbb" fontFamily="monospace" fontSize="10.5">U0–U7</text><text x="94" y="242" fill="#fff" fontFamily="monospace" fontSize="10.5">placed demo cells</text>
      <text x="22" y="264" fill="#bbb" fontFamily="monospace" fontSize="10.5">A / B / Y</text><text x="94" y="264" fill="#fff" fontFamily="monospace" fontSize="10.5">input / output pins</text>
      <text x="22" y="286" fill="#bbb" fontFamily="monospace" fontSize="10.5">*_SINK</text><text x="94" y="286" fill="#fff" fontFamily="monospace" fontSize="10.5">internal destination</text>
      <text x="22" y="308" fill="#bbb" fontFamily="monospace" fontSize="10.5">Y_SOURCE</text><text x="94" y="308" fill="#fff" fontFamily="monospace" fontSize="10.5">internal source</text>
      <rect x="267" y="299" width="10" height="10" fill="#f8dc7a" /><text x="284" y="308" fill="#bbb" fontFamily="monospace" fontSize="10">via cut</text>
      <text x="22" y="352" fill="#c0c0c0" fontFamily="monospace" fontSize="12" fontWeight="760">CONNECTED FOOTPRINTS → NETS + PINS</text>
      {NET_ROWS.map((row, index) => {
        const color = SIGNAL_COLORS[row.net];
        const y = 374 + index * 84;
        return <g key={row.net}><rect x="22" y={y} width="316" height="68" rx="4" fill="#0e0e0e" stroke={color} strokeOpacity="0.58" /><text x="36" y={y + 24} fill={color} fontFamily="monospace" fontSize="13" fontWeight="760">{row.net}</text><text x="110" y={y + 52} textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="12">{row.source}</text><text x="260" y={y + 52} textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="12">{row.sink}</text></g>;
      })}
    </DiagramSvg>
  );
}

export function LayoutToNetsDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  return <DiagramFrame label="From layout to electrical nets" status=""><DesktopLayoutToNets progress={progress} /><MobileLayoutToNets progress={progress} /></DiagramFrame>;
}
