'use client';

import { useReducedMotion } from 'framer-motion';
import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './asic.module.css';

export interface ScrollDiagramProps {
  progress: number;
}

export interface ScrollDiagramState {
  progress: number;
  atStart: boolean;
  atEnd: boolean;
}

interface DiagramFrameProps {
  label: string;
  status: string;
  children: ReactNode;
  corner?: string;
  headingLayout?: 'split' | 'stacked';
  progress?: number;
}

interface DiagramSvgProps {
  width: number;
  height: number;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  contentScale?: number;
  inset?: number;
}

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const SCROLL_WINDOW_PADDING = 0.075;
const scrollWindowProgress = (progress: number): number => clamp((progress - SCROLL_WINDOW_PADDING) / (1 - SCROLL_WINDOW_PADDING * 2));

export function useScrollDiagramState(): { ref: React.RefObject<HTMLDivElement>; scrollState: ScrollDiagramState } {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(reduceMotion ? 1 : 0);

  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion) {
      setProgress(1);
      return;
    }

    let frame = 0;
    const update = (): void => {
      if (window.matchMedia('(max-width: 720px)').matches) {
        setProgress(1);
        frame = 0;
        return;
      }
      const rect = element.getBoundingClientRect();
      const visual = element.querySelector<HTMLElement>('[data-sticky-visual]');
      if (!visual) {
        frame = 0;
        return;
      }
      const visualHeight = visual.getBoundingClientRect().height;
      const sectionPaddingTop = Number.parseFloat(window.getComputedStyle(element).paddingTop) || 0;
      const start = (window.innerHeight - visualHeight) / 2 - sectionPaddingTop;
      const travel = Math.max(1, rect.height - visualHeight);
      const next = scrollWindowProgress(clamp((start - rect.top) / travel));
      setProgress((current) => Math.abs(current - next) < 0.002 ? current : next);
      frame = 0;
    };
    const schedule = (): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [reduceMotion]);

  return { ref, scrollState: { progress, atStart: progress <= 0.001, atEnd: progress >= 0.999 } };
}

export function scrollRevealStyle(progress: number, start: number, duration = 0.14, travel = 10): CSSProperties {
  const amount = clamp((progress - start) / duration);
  return { opacity: 0.12 + amount * 0.88, transform: `translate3d(0, ${(1 - amount) * travel}px, 0)` };
}

export function DiagramFrame({ label, status, children, corner, headingLayout = 'split', progress }: DiagramFrameProps): JSX.Element {
  return <figure className={styles.diagramFrame} aria-label={status ? `${label}: ${status}` : label}><figcaption data-heading-layout={headingLayout}><span>{label}</span>{status && <strong>{status}</strong>}</figcaption><div className={styles.diagramViewport}>{children}{corner && <div className={styles.diagramCorner} aria-hidden="true">{corner}</div>}{progress !== undefined && <div className={styles.diagramProgress} aria-hidden="true"><i style={{ transform: `scaleX(${clamp(progress)})` }} /></div>}</div></figure>;
}

export function DiagramSvg({ width, height, ariaLabel, children, className, contentScale = 0.94, inset = 26 }: DiagramSvgProps): JSX.Element {
  const offsetX = width * (1 - contentScale) / 2;
  const offsetY = height * (1 - contentScale) / 2;
  const svgClassName = className ? `${styles.diagramSvg} ${className}` : styles.diagramSvg;
  return <svg className={svgClassName} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}><rect className={styles.diagramBoard} x={inset} y={inset} width={width - inset * 2} height={height - inset * 2} /><g transform={`translate(${offsetX} ${offsetY}) scale(${contentScale})`}>{children}</g></svg>;
}
