'use client';

import React, { useMemo } from 'react';
import ScribbleMarkdown from '../ScribbleMarkdown';
import { AsicInlineVisual, AsicStickyStory, type AsicVisualKey } from './AsicVisuals';
import styles from './asic.module.css';

interface AsicArticleBodyProps {
  markdown: string;
}

interface MarkdownPart {
  kind: 'markdown';
  markdown: string;
}

interface VisualPart {
  kind: 'sticky' | 'visual';
  visualKey: AsicVisualKey;
  markdown: string;
}

type ArticlePart = MarkdownPart | VisualPart;

const visualPattern = /<!--\s*(sticky|visual):([a-z0-9-]+)\s*-->([\s\S]*?)<!--\s*\/\1\s*-->/g;

function parseArticle(markdown: string): ArticlePart[] {
  const parts: ArticlePart[] = [];
  let cursor = 0;
  visualPattern.lastIndex = 0;
  let match = visualPattern.exec(markdown);
  while (match) {
    const index = match.index;
    if (index > cursor) parts.push({ kind: 'markdown', markdown: markdown.slice(cursor, index) });
    parts.push({ kind: match[1] as VisualPart['kind'], visualKey: match[2] as AsicVisualKey, markdown: match[3].trim() });
    cursor = index + match[0].length;
    match = visualPattern.exec(markdown);
  }
  if (cursor < markdown.length) parts.push({ kind: 'markdown', markdown: markdown.slice(cursor) });
  return parts;
}

export default function AsicArticleBody({ markdown }: AsicArticleBodyProps): JSX.Element {
  const parts = useMemo(() => parseArticle(markdown), [markdown]);

  return (
    <div className={styles.asicArticle}>
      {parts.map((part, index) => {
        if (part.kind === 'markdown') return <ScribbleMarkdown key={`markdown-${index}`} markdown={part.markdown} />;
        if (part.kind === 'sticky') return <AsicStickyStory key={`${part.visualKey}-${index}`} visualKey={part.visualKey}><ScribbleMarkdown markdown={part.markdown} /></AsicStickyStory>;
        return <AsicInlineVisual key={`${part.visualKey}-${index}`} visualKey={part.visualKey} />;
      })}
    </div>
  );
}
