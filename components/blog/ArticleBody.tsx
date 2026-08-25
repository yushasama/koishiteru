'use client';

import React, { useEffect, useRef } from 'react';
import type { BlogPost, BlogSection } from '../../lib/blog/posts';
import ScribbleMarkdown from './ScribbleMarkdown';
import SystemsArticleBody from './systems/SystemsArticleBody';
import styles from './blog.module.css';

interface ArticleBodyProps {
  markdown: string;
  sections: readonly BlogSection[];
  visualStory?: BlogPost['visualStory'];
}

export default function ArticleBody({ markdown, sections, visualStory }: ArticleBodyProps): JSX.Element {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const assignHeadingIds = (): boolean => {
      const headings = Array.from(root.querySelectorAll('h2'));
      if (headings.length < sections.length) return false;
      sections.forEach((section, index) => { headings[index].id = section.id; });
      return true;
    };

    if (assignHeadingIds()) return;
    const observer = new MutationObserver(() => { if (assignHeadingIds()) observer.disconnect(); });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [markdown, sections]);

  return (
    <div ref={contentRef} className={`${styles.articleProse} ${visualStory ? styles.articleProseVisual : ''}`} data-article-content>
      {visualStory === 'systems-optimization' && <SystemsArticleBody markdown={markdown} />}
      {visualStory !== 'systems-optimization' && <ScribbleMarkdown markdown={markdown} />}
    </div>
  );
}
