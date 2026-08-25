'use client';

import React from 'react';
import VisualMarkdownArticle from '../VisualMarkdownArticle';
import { AsicInlineVisual, AsicStickyStory, type AsicVisualKey } from './AsicVisuals';
import styles from './asic.module.css';

interface AsicArticleBodyProps {
  markdown: string;
}

const asicVisualKeys: readonly AsicVisualKey[] = [
  'challenge-pipeline',
  'and-gate',
  'layer-stack',
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

export default function AsicArticleBody({ markdown }: AsicArticleBodyProps): JSX.Element {
  return (
    <VisualMarkdownArticle
      className={styles.asicArticle}
      markdown={markdown}
      markerMode="paired"
      visualKeys={asicVisualKeys}
      renderVisual={(visualKey) => <AsicInlineVisual visualKey={visualKey} />}
      renderStickyVisual={(visualKey, children) => <AsicStickyStory visualKey={visualKey}>{children}</AsicStickyStory>}
    />
  );
}
