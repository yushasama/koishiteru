'use client';

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import styles from './blog.module.css';

export default function ReadingProgress(): JSX.Element {
  const progressRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const dialRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>('[data-article-content]');
    const progress = progressRef.current;
    const progressBar = progressBarRef.current;
    const dial = dialRef.current;
    if (!article || !progress || !progressBar || !dial) return;

    let frame = 0;
    const update = (): void => {
      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      const start = articleTop - window.innerHeight * 0.22;
      const end = articleTop + article.offsetHeight - window.innerHeight * 0.72;
      const value = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
      progressBar.style.transform = `scaleX(${value})`;
      dial.style.transform = `rotate(${value * 360}deg)`;
      progress.setAttribute('aria-valuenow', String(Math.round(value * 100)));
      frame = 0;
    };
    const scheduleUpdate = (): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(article);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    update();
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  return (
    <>
      <div ref={progressRef} className={styles.readingProgress} role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
        <span ref={progressBarRef} />
      </div>
      <Link href="/blog" className={styles.articleBackControl} aria-label="Back to all writing">
        <span className={styles.articleBackArrow}>←</span>
        <span className={styles.articleBackCopy}><small>Return to</small><strong>All writing</strong></span>
        <span className={styles.articleProgressRing} aria-hidden="true"><span ref={dialRef} className={styles.articleProgressRingValue} /></span>
      </Link>
    </>
  );
}
