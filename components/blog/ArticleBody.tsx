'use client';

import React from 'react';
import type { BlogPost, BlogSection } from '../../lib/blog/posts';
import ScribbleMarkdown from './ScribbleMarkdown';
import SystemsArticleBody from './systems/SystemsArticleBody';
import { useArticleHeadingIds } from './useArticleHeadingIds';
import styles from './blog.module.css';

interface ArticleBodyProps {
  markdown: string;
  sections: readonly BlogSection[];
  visualStory?: BlogPost['visualStory'];
}

export default function ArticleBody({ markdown, sections, visualStory }: ArticleBodyProps): JSX.Element {
  const contentRef = useArticleHeadingIds(markdown, sections);

  return (
    <div ref={contentRef} className={`${styles.articleProse} ${visualStory ? styles.articleProseVisual : ''}`} data-article-content>
      {visualStory === 'systems-optimization' && <SystemsArticleBody markdown={markdown} />}
      {visualStory !== 'systems-optimization' && <ScribbleMarkdown markdown={markdown} />}
    </div>
  );
}
