'use client';

import React, { useEffect, useState } from 'react';
import type { BlogSection } from '../../lib/blog/posts';
import styles from './blog.module.css';

interface ArticleTOCProps {
  sections: readonly BlogSection[];
  progress: number;
}

export default function ArticleTOC({ sections, progress }: ArticleTOCProps): JSX.Element {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    let headings: HTMLElement[] = [];
    let frame = 0;
    const updateActiveSection = (): void => {
      const threshold = Math.min(180, window.innerHeight * 0.24);
      let nextActiveId = headings[0]?.id ?? '';
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > threshold) break;
        nextActiveId = heading.id;
      }
      setActiveId((currentId) => currentId === nextActiveId ? currentId : nextActiveId);
      frame = 0;
    };
    const scheduleUpdate = (): void => {
      if (frame || headings.length === 0) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };
    const connect = (): boolean => {
      headings = sections.map((section) => document.getElementById(section.id)).filter((heading): heading is HTMLElement => heading !== null);
      if (headings.length < sections.length) return false;
      scheduleUpdate();
      return true;
    };

    const contentObserver = new MutationObserver(() => { if (connect()) contentObserver.disconnect(); });
    if (!connect()) contentObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      contentObserver.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [sections]);

  return (
    <aside className={styles.toc} aria-label="Table of contents">
      <div className={styles.tocHeader}><strong>On this page</strong><span aria-hidden="true">{progress}% read</span></div>
      <div className={styles.tocProgressTrack} aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
      <nav>
        {sections.map((section) => <a key={section.id} href={`#${section.id}`} aria-current={activeId === section.id ? 'location' : undefined}>{section.title}</a>)}
      </nav>
    </aside>
  );
}
