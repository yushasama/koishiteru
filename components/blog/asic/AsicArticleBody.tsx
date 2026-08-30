'use client';

import React from 'react';
import type { BlogSection } from '../../../lib/blog/posts';
import { useArticleHeadingIds } from '../useArticleHeadingIds';
import VisualMarkdownArticle from '../VisualMarkdownArticle';
import { AsicInlineVisual, AsicStickyStory, type AsicVisualKey } from './AsicVisuals';
import styles from './asic.module.css';

interface AsicArticleBodyProps {
  markdown: string;
  sections: readonly BlogSection[];
}

const asicVisualKeys: readonly AsicVisualKey[] = [
  'challenge-pipeline',
  'and-gate',
  'layer-stack',
  'polygon-decomposition',
  'rtree',
  'cache',
  'circuit-morph',
  'scc-dag',
  'io-stream',
  'sat-basics',
  'sat-timeline',
  'verification',
  'result-decode',
  'showcase-video',
];

export default function AsicArticleBody({ markdown, sections }: AsicArticleBodyProps): JSX.Element {
  const contentRef = useArticleHeadingIds(markdown, sections);
  return (
    <VisualMarkdownArticle
      className={styles.asicArticle}
      markdown={markdown}
      markerMode="paired"
      rootRef={contentRef}
      visualKeys={asicVisualKeys}
      renderVisual={(visualKey) => <AsicInlineVisual visualKey={visualKey} />}
      renderStickyVisual={(visualKey, children) => <AsicStickyStory visualKey={visualKey}>{children}</AsicStickyStory>}
    />
  );
}
