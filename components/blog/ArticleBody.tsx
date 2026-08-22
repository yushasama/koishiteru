'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useRef } from 'react';
import type { ScribbleRenderProps } from 'scribble-render';
import 'scribble-render/dist/index.css';
import type { BlogSection } from '../../lib/blog/posts';
import styles from './blog.module.css';

interface ArticleBodyProps {
  markdown: string;
  sections: readonly BlogSection[];
}

const theme: NonNullable<ScribbleRenderProps['theme']> = {
  name: 'Koishite Blog',
  background: 'transparent',
  text: '#d4d4d4',
  accent: '#fb4e7c',
  codeBackground: '#0d0d0d',
  codeText: '#e5e5e5',
  border: '#333333',
  shadow: 'rgba(0, 0, 0, 0.28)',
};

const ScribbleRender = dynamic(() => import('scribble-render').then((module) => module.ScribbleRender), { ssr: false, loading: () => <p className={styles.articleLoading}>Rendering article…</p> });

export default function ArticleBody({ markdown, sections }: ArticleBodyProps): JSX.Element {
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
    <div ref={contentRef} className={styles.articleProse} data-article-content>
      <ScribbleRender content={markdown} theme={theme} codeTheme="material-theme-darker" loadMermaid={false} />
    </div>
  );
}
