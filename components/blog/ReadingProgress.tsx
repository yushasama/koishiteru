'use client';

import Link from 'next/link';
import React, { type CSSProperties, useEffect, useState } from 'react';
import type { BlogSection } from '../../lib/blog/posts';
import ArticleTOC from './ArticleTOC';
import styles from './blog.module.css';

interface ReadingProgressProps {
  sections: readonly BlogSection[];
}

type ReadingProgressStyle = CSSProperties & { '--reading-progress': string };

export default function ReadingProgress({ sections }: ReadingProgressProps): JSX.Element {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>('[data-article-content]');
    if (!article) return;

    let frame = 0;
    const update = (): void => {
      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      const start = articleTop - window.innerHeight * 0.22;
      const end = articleTop + article.offsetHeight - window.innerHeight * 0.72;
      const value = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
      const nextProgress = Math.round(value * 100);
      setProgress((currentProgress) => currentProgress === nextProgress ? currentProgress : nextProgress);
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

  const ringStyle: ReadingProgressStyle = { '--reading-progress': `${progress * 3.6}deg` };

  return (
    <div className={styles.articleRail}>
      <Link href="/blog" className={styles.articleBackControl} aria-label="Back to all writing">
        <span className={styles.articleBackArrow}>←</span>
        <span className={styles.articleBackCopy}><small>Return to</small><strong>All writing</strong></span>
        <span className={styles.articleProgressRing} aria-hidden="true"><span className={styles.articleProgressRingValue} style={ringStyle} /><span className={styles.articleProgressRingLabel}>{progress}<small>%</small></span></span>
      </Link>
      <ArticleTOC sections={sections} progress={progress} />
    </div>
  );
}
