'use client';

import { useReducedMotion } from 'framer-motion';
import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './asic.module.css';
import { getDiagramProgress } from './diagramProgress';

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
}

interface DiagramSvgProps {
  width: number;
  height: number;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  boardBottomInset?: number;
  contentScale?: number;
  inset?: number;
  progress?: number;
  progressEnd?: number;
  progressLabel?: string;
  showBoard?: boolean;
  showProgress?: boolean;
}

interface DiagramProgressProps {
  progress: number;
  progressEnd?: number;
  label?: string;
}

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const MOBILE_BREAKPOINT = '(max-width: 720px)';
const MOBILE_START_HOLD_RATIO = 0.12;
const MOBILE_START_HOLD_VIEWPORT_RATIO = 0.1;
const MOBILE_END_HOLD_RATIO = 0.18;
const MOBILE_END_HOLD_VIEWPORT_RATIO = 0.16;

export function useScrollDiagramState(startDelay = 0): { ref: React.RefObject<HTMLDivElement>; scrollState: ScrollDiagramState } {
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
      const rect = element.getBoundingClientRect();
      const visual = element.querySelector<HTMLElement>('[data-sticky-visual]');
      if (!visual) {
        frame = 0;
        return;
      }
      const visualHeight = visual.getBoundingClientRect().height;
      const sectionStyle = window.getComputedStyle(element);
      const visualStyle = window.getComputedStyle(visual);
      const sectionPaddingTop = Number.parseFloat(sectionStyle.paddingTop) || 0;
      const sectionPaddingBottom = Number.parseFloat(sectionStyle.paddingBottom) || 0;
      const parsedStickyTop = Number.parseFloat(visualStyle.top);
      const stickyTop = Number.isFinite(parsedStickyTop) ? parsedStickyTop : 0;
      const stickyStart = rect.top + sectionPaddingTop;
      const stickyTravel = Math.max(1, rect.height - sectionPaddingTop - sectionPaddingBottom - visualHeight);
      // The paired sticky markers own this section. Advance frames only while
      // the board is pinned, never while the board itself enters or exits.
      const isMobile = window.matchMedia(MOBILE_BREAKPOINT).matches;
      const mobileStartHold = isMobile ? Math.min(stickyTravel * MOBILE_START_HOLD_RATIO, window.innerHeight * MOBILE_START_HOLD_VIEWPORT_RATIO) : 0;
      const mobileEndHold = isMobile ? Math.min(stickyTravel * MOBILE_END_HOLD_RATIO, window.innerHeight * MOBILE_END_HOLD_VIEWPORT_RATIO) : 0;
      const delayedStart = stickyStart + mobileStartHold + (stickyTravel - mobileStartHold - mobileEndHold) * clamp(startDelay);
      const animationTravel = Math.max(1, stickyTravel - (delayedStart - stickyStart) - mobileEndHold);
      const next = clamp((stickyTop - delayedStart) / animationTravel);
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
  }, [reduceMotion, startDelay]);

  return { ref, scrollState: { progress, atStart: progress <= 0.001, atEnd: progress >= 0.999 } };
}

export function scrollRevealStyle(progress: number, start: number, duration = 0.14, travel = 10): CSSProperties {
  const amount = clamp((progress - start) / duration);
  return { opacity: 0.12 + amount * 0.88, transform: `translate3d(0, ${(1 - amount) * travel}px, 0)` };
}

export function DiagramFrame({ label, status, children, corner, headingLayout = 'split' }: DiagramFrameProps): JSX.Element {
  return <figure className={styles.diagramFrame} aria-label={status ? `${label}: ${status}` : label}><figcaption data-heading-layout={headingLayout}><span>{label}</span>{status && <strong>{status}</strong>}{corner && <small className={styles.diagramCorner} aria-hidden="true">{corner}</small>}</figcaption><div className={styles.diagramViewport}>{children}</div></figure>;
}

export function DiagramProgress({ progress, progressEnd = 1, label }: DiagramProgressProps): JSX.Element {
  return <div className={styles.diagramProgress} aria-hidden="true">{label && <strong>{label}</strong>}<span><i style={{ transform: `scaleX(${getDiagramProgress(progress, progressEnd)})` }} /></span></div>;
}

export function DiagramSvg({ width, height, ariaLabel, children, className, boardBottomInset, contentScale = 0.94, inset = 14, progress, progressEnd = 1, progressLabel, showBoard = true, showProgress = true }: DiagramSvgProps): JSX.Element {
  const offsetX = width * (1 - contentScale) / 2;
  const offsetY = height * (1 - contentScale) / 2;
  const svgClassName = className ? `${styles.diagramSvg} ${className}` : styles.diagramSvg;
  const bottomInset = boardBottomInset ?? inset;
  const progressX = inset + 14;
  const progressWidth = width - (inset + 14) * 2;
  const progressY = height - bottomInset - 12;
  return <svg className={svgClassName} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>{showBoard && <rect className={styles.diagramBoard} x={inset} y={inset} width={width - inset * 2} height={height - inset - bottomInset} />}<g transform={`translate(${offsetX} ${offsetY}) scale(${contentScale})`}>{children}</g>{progress !== undefined && showProgress && <g className={styles.diagramSvgProgress} aria-hidden="true">{progressLabel && <text x={progressX} y={progressY - 12}>{progressLabel}</text>}<rect x={progressX} y={progressY} width={progressWidth} height="3" /><rect className={styles.diagramSvgProgressFill} x={progressX} y={progressY} width={progressWidth * getDiagramProgress(progress, progressEnd)} height="3" /></g>}</svg>;
}
