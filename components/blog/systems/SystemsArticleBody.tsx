'use client';

import React from 'react';
import VisualMarkdownArticle from '../VisualMarkdownArticle';
import { SystemsInlineVisual, type SystemsVisualKey } from './SystemsVisuals';
import styles from './systems.module.css';

interface SystemsArticleBodyProps {
  markdown: string;
}

const visualKeys: readonly SystemsVisualKey[] = ['arena-allocator', 'cache-lines', 'simd-mask'];

export default function SystemsArticleBody({ markdown }: SystemsArticleBodyProps): JSX.Element {
  return (
    <VisualMarkdownArticle
      className={styles.systemsArticle}
      markdown={markdown}
      markerMode="inline"
      visualKeys={visualKeys}
      renderVisual={(visualKey) => <SystemsInlineVisual visualKey={visualKey} />}
    />
  );
}
