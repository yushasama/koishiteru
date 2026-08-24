'use client';

import React, { useMemo } from 'react';
import ScribbleMarkdown from '../ScribbleMarkdown';
import { SystemsInlineVisual, type SystemsVisualKey } from './SystemsVisuals';
import styles from './systems.module.css';

interface SystemsArticleBodyProps {
  markdown: string;
}

interface MarkdownPart {
  kind: 'markdown';
  markdown: string;
}

interface VisualPart {
  kind: 'visual';
  visualKey: SystemsVisualKey;
}

type ArticlePart = MarkdownPart | VisualPart;

const visualPattern = /<!--\s*visual:([a-z0-9-]+)\s*-->/g;
const visualKeys: readonly SystemsVisualKey[] = ['arena-allocator', 'cache-lines', 'simd-mask'];

function isSystemsVisualKey(value: string): value is SystemsVisualKey {
  return visualKeys.some((key) => key === value);
}

function parseArticle(markdown: string): ArticlePart[] {
  const parts: ArticlePart[] = [];
  let cursor = 0;
  visualPattern.lastIndex = 0;
  let match = visualPattern.exec(markdown);
  while (match) {
    if (match.index > cursor) parts.push({ kind: 'markdown', markdown: markdown.slice(cursor, match.index) });
    if (isSystemsVisualKey(match[1])) parts.push({ kind: 'visual', visualKey: match[1] });
    cursor = match.index + match[0].length;
    match = visualPattern.exec(markdown);
  }
  if (cursor < markdown.length) parts.push({ kind: 'markdown', markdown: markdown.slice(cursor) });
  return parts;
}

export default function SystemsArticleBody({ markdown }: SystemsArticleBodyProps): JSX.Element {
  const parts = useMemo(() => parseArticle(markdown), [markdown]);
  return <div className={styles.systemsArticle}>{parts.map((part, index) => part.kind === 'markdown' ? <ScribbleMarkdown key={`markdown-${index}`} markdown={part.markdown} /> : <SystemsInlineVisual key={`${part.visualKey}-${index}`} visualKey={part.visualKey} />)}</div>;
}
