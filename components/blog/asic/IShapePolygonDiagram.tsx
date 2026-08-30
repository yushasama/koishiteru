'use client';

import React from 'react';
import { DiagramFrame, DiagramSvg, type ScrollDiagramProps } from './DiagramPrimitives';
import { I_SHAPE_RTREE_SCENE, type IShapeBox } from './iShapeRTreeScene';
import styles from './asic.module.css';

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const mix = (start: number, end: number, amount: number): number => start + (end - start) * amount;
const RECTANGLE_COLORS = ['#79ddff', '#f6cf68', '#87eab2'] as const;
const RECTANGLE_TINTS = [{ start: '#8be2ff', middle: '#3a9dca', end: '#163e50' }, { start: '#ffe5a6', middle: '#c58e24', end: '#4d3910' }, { start: '#adf7cb', middle: '#359f68', end: '#153f2a' }] as const;

function outlinePath(centerX: number, centerY: number, scale: number): string {
  return I_SHAPE_RTREE_SCENE.outline.map((point, index) => `${index ? 'L' : 'M'}${centerX + point.x * scale} ${centerY + point.y * scale}`).join(' ') + ' Z';
}

function svgBox(box: IShapeBox, centerX: number, centerY: number, scale: number): { x: number; y: number; width: number; height: number } {
  return { x: centerX + box.xMin * scale, y: centerY + box.yMin * scale, width: (box.xMax - box.xMin) * scale, height: (box.yMax - box.yMin) * scale };
}

function IShapeGeometry({ centerX, centerY, scale, cut, color, opacity, gradientIdPrefix }: { centerX: number; centerY: number; scale: number; cut: number; color: number; opacity: number; gradientIdPrefix: string }): JSX.Element {
  const middle = I_SHAPE_RTREE_SCENE.rectangles[1].box;
  return <g opacity={opacity}>
    <defs>{RECTANGLE_TINTS.map((tint, index) => <linearGradient key={RECTANGLE_COLORS[index]} id={`${gradientIdPrefix}-${index}`} x1="0" y1="0" x2="0.92" y2="0.35"><stop stopColor={tint.start} stopOpacity="0.36" /><stop offset="0.44" stopColor={tint.middle} stopOpacity="0.19" /><stop offset="1" stopColor={tint.end} stopOpacity="0.08" /></linearGradient>)}</defs>
    <path d={outlinePath(centerX, centerY, scale)} fill="#d8d8d8" fillOpacity="0.1" stroke="#e6e6e6" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    <path d={`M${centerX + middle.xMin * scale} ${centerY + middle.yMin * scale}H${centerX + middle.xMax * scale}M${centerX + middle.xMin * scale} ${centerY + middle.yMax * scale}H${centerX + middle.xMax * scale}`} fill="none" stroke="#fff" strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - cut} vectorEffect="non-scaling-stroke" />
    <g opacity={color}>{I_SHAPE_RTREE_SCENE.rectangles.map((rectangle, index) => { const box = svgBox(rectangle.box, centerX, centerY, scale); return <g key={rectangle.id}><rect {...box} fill={`url(#${gradientIdPrefix}-${index})`} stroke={RECTANGLE_COLORS[index]} strokeOpacity="0.92" strokeWidth="1.8" vectorEffect="non-scaling-stroke" /><text x={index === 1 ? box.x + box.width / 2 : box.x + 16} y={box.y + box.height / 2 + 5} textAnchor={index === 1 ? 'middle' : 'start'} fill={RECTANGLE_COLORS[index]} fontFamily="monospace" fontSize={scale < 70 ? 12 : 14} fontWeight="700">{rectangle.label}</text></g>; })}</g>
  </g>;
}

function FinalTree({ opacity, mobile = false }: { opacity: number; mobile?: boolean }): JSX.Element {
  const root = mobile ? { x: 90, y: 58, width: 180, height: 72 } : { x: 270, y: 84, width: 220, height: 80 };
  const entryY = mobile ? 176 : 222;
  const entryWidth = mobile ? 94 : 150;
  const gap = mobile ? 10 : 28;
  const startX = mobile ? 29 : 127;
  return <g opacity={opacity} transform={`translate(0 ${mix(12, 0, opacity)})`}>
    <text x={mobile ? 18 : 44} y={mobile ? 32 : 54} fill="#aaa" fontFamily="monospace" fontSize={mobile ? 12 : 13}>R-TREE · I-SHAPE RECTANGLES ONLY</text>
    <rect {...root} rx="6" fill="#101010" stroke="#d8d8d8" strokeWidth="1.5" />
    <text x={root.x + root.width / 2} y={root.y + 29} textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize={mobile ? 13 : 15} fontWeight="800">ROOT · LEAF</text>
    <text x={root.x + root.width / 2} y={root.y + 54} textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize={mobile ? 11.5 : 12.5}>3 RECTANGLE ENTRIES</text>
    <path d={`M${root.x + root.width / 2} ${root.y + root.height}V${entryY - 26}M${startX + entryWidth / 2} ${entryY - 26}H${startX + (entryWidth + gap) * 2 + entryWidth / 2}`} fill="none" stroke="#696969" strokeWidth="1.4" />
    {I_SHAPE_RTREE_SCENE.rectangles.map((rectangle, index) => { const x = startX + index * (entryWidth + gap); return <g key={rectangle.id}><path d={`M${x + entryWidth / 2} ${entryY - 26}V${entryY}`} stroke="#696969" strokeWidth="1.4" /><rect x={x} y={entryY} width={entryWidth} height={mobile ? 66 : 76} rx="5" fill="#101010" stroke={RECTANGLE_COLORS[index]} strokeWidth="1.6" /><text x={x + entryWidth / 2} y={entryY + (mobile ? 27 : 31)} textAnchor="middle" fill={RECTANGLE_COLORS[index]} fontFamily="monospace" fontSize={mobile ? 13 : 15} fontWeight="800">{rectangle.label}</text><text x={x + entryWidth / 2} y={entryY + (mobile ? 49 : 56)} textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize={mobile ? 10 : 11}>BOUND = RECT</text></g>; })}
    {!mobile && <text x="380" y="382" textAnchor="middle" fill="#aaa" fontFamily="monospace" fontSize="12.5">R0 · R1 · R2 · ONE ROOT LEAF</text>}
  </g>;
}

export function IShapePolygonDiagram({ progress }: ScrollDiagramProps): JSX.Element {
  const cut = clamp((progress - 0.1) / 0.18);
  const color = clamp((progress - 0.28) / 0.18);
  const clear = clamp((progress - 0.52) / 0.16);
  const tree = clamp((progress - 0.66) / 0.24);
  const geometryOpacity = 1 - clear;
  const status = tree > 0.6 ? 'R0 · R1 · R2 indexed' : clear > 0.3 ? 'Insert R0 · R1 · R2' : color > 0.25 ? 'R0 + R1 + R2 exactly cover the polygon' : cut > 0.1 ? 'Draw two clean section lines' : 'Trace the I-shaped outline';
  return <DiagramFrame label="Decomping A Weird Manhattan Polygon" status={status}>
    <DiagramSvg className={styles.polygonDesktop} width={760} height={570} ariaLabel="An I-shaped Manhattan polygon is divided into the exact rectangles R0, R1, and R2, then those same three rectangles are inserted into one R-tree root leaf." contentScale={0.92} progress={progress} progressLabel={status} showBoard={false}>
      <text x="44" y="54" fill="#aaa" fontFamily="monospace" fontSize="13" opacity={geometryOpacity}>I-SHAPED POLYGON</text><IShapeGeometry centerX={380} centerY={258} scale={100} cut={cut} color={color} opacity={geometryOpacity} gradientIdPrefix="decomp-desktop" /><FinalTree opacity={tree} />
    </DiagramSvg>
    <DiagramSvg className={styles.polygonMobile} width={360} height={480} ariaLabel="On mobile, scrolling traces the I-shaped polygon, divides it into R0, R1, and R2, and inserts those same rectangles into one R-tree root leaf." contentScale={1} progress={progress} progressLabel={status} showBoard={false}>
      <text x="18" y="30" fill="#bbb" fontFamily="monospace" fontSize="12.5" fontWeight="800" opacity={geometryOpacity}>I-SHAPED POLYGON</text><IShapeGeometry centerX={180} centerY={164} scale={55} cut={cut} color={color} opacity={geometryOpacity} gradientIdPrefix="decomp-mobile" /><FinalTree opacity={tree} mobile />
    </DiagramSvg>
  </DiagramFrame>;
}
