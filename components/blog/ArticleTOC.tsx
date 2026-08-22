'use client';

import React, { useEffect, useState } from 'react';
import type { BlogSection } from '../../lib/blog/posts';
import styles from './blog.module.css';

interface ArticleTOCProps {
  sections: readonly BlogSection[];
}

export default function ArticleTOC({ sections }: ArticleTOCProps): JSX.Element {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    let headingObserver: IntersectionObserver | null = null;
    const connect = (): boolean => {
      const headings = sections.map((section) => document.getElementById(section.id)).filter((heading): heading is HTMLElement => heading !== null);
      if (headings.length < sections.length) return false;

      headingObserver = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });
      headings.forEach((heading) => headingObserver?.observe(heading));
      return true;
    };

    if (connect()) return () => headingObserver?.disconnect();
    const contentObserver = new MutationObserver(() => { if (connect()) contentObserver.disconnect(); });
    contentObserver.observe(document.body, { childList: true, subtree: true });
    return () => {
      contentObserver.disconnect();
      headingObserver?.disconnect();
    };
  }, [sections]);

  return (
    <aside className={styles.toc} aria-label="Table of contents">
      <strong>On this page</strong>
      <nav>
        {sections.map((section) => <a key={section.id} href={`#${section.id}`} aria-current={activeId === section.id ? 'location' : undefined}>{section.title}</a>)}
      </nav>
    </aside>
  );
}
