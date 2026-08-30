'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { BlogSection } from '../../lib/blog/posts';

export function useArticleHeadingIds(markdown: string, sections: readonly BlogSection[]): RefObject<HTMLDivElement> {
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

  return contentRef;
}
