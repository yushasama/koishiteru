'use client';

import React, { type ReactNode, type Ref, useMemo } from 'react';
import ScribbleMarkdown from './ScribbleMarkdown';

type MarkerMode = 'inline' | 'paired';
type VisualMarker = 'visual' | 'sticky';

interface MarkdownPart {
  kind: 'markdown';
  markdown: string;
}

interface VisualPart<VisualKey extends string> {
  kind: 'visual';
  marker: VisualMarker;
  visualKey: VisualKey;
  markdown: string;
}

type ArticlePart<VisualKey extends string> = MarkdownPart | VisualPart<VisualKey>;

interface VisualMarkdownArticleProps<VisualKey extends string> {
  className: string;
  markdown: string;
  markerMode: MarkerMode;
  visualKeys: readonly VisualKey[];
  renderVisual: (visualKey: VisualKey) => ReactNode;
  renderStickyVisual?: (visualKey: VisualKey, children: ReactNode) => ReactNode;
  rootRef?: Ref<HTMLDivElement>;
}

const inlineVisualPattern = /<!--\s*visual:([a-z0-9-]+)\s*-->/g;
const pairedVisualPattern = /<!--\s*(sticky|visual):([a-z0-9-]+)\s*-->([\s\S]*?)<!--\s*\/\1\s*-->/g;

function isVisualKey<VisualKey extends string>(visualKeys: readonly VisualKey[], value: string): value is VisualKey {
  return visualKeys.some((visualKey) => visualKey === value);
}

function parseInlineArticle<VisualKey extends string>(markdown: string, visualKeys: readonly VisualKey[]): ArticlePart<VisualKey>[] {
  const parts: ArticlePart<VisualKey>[] = [];
  let cursor = 0;
  inlineVisualPattern.lastIndex = 0;

  let match = inlineVisualPattern.exec(markdown);
  while (match) {
    if (match.index > cursor) parts.push({ kind: 'markdown', markdown: markdown.slice(cursor, match.index) });
    if (isVisualKey(visualKeys, match[1])) {
      parts.push({ kind: 'visual', marker: 'visual', visualKey: match[1], markdown: '' });
    }
    cursor = match.index + match[0].length;
    match = inlineVisualPattern.exec(markdown);
  }

  if (cursor < markdown.length) parts.push({ kind: 'markdown', markdown: markdown.slice(cursor) });
  return parts;
}

function parsePairedArticle<VisualKey extends string>(markdown: string, visualKeys: readonly VisualKey[]): ArticlePart<VisualKey>[] {
  const parts: ArticlePart<VisualKey>[] = [];
  let cursor = 0;
  pairedVisualPattern.lastIndex = 0;

  let match = pairedVisualPattern.exec(markdown);
  while (match) {
    if (match.index > cursor) parts.push({ kind: 'markdown', markdown: markdown.slice(cursor, match.index) });
    if (isVisualKey(visualKeys, match[2])) {
      parts.push({ kind: 'visual', marker: match[1] as VisualMarker, visualKey: match[2], markdown: match[3].trim() });
    } else {
      parts.push({ kind: 'markdown', markdown: match[0] });
    }
    cursor = match.index + match[0].length;
    match = pairedVisualPattern.exec(markdown);
  }

  if (cursor < markdown.length) parts.push({ kind: 'markdown', markdown: markdown.slice(cursor) });
  return parts;
}

function parseArticle<VisualKey extends string>(markdown: string, markerMode: MarkerMode, visualKeys: readonly VisualKey[]): ArticlePart<VisualKey>[] {
  return markerMode === 'paired' ? parsePairedArticle(markdown, visualKeys) : parseInlineArticle(markdown, visualKeys);
}

export default function VisualMarkdownArticle<VisualKey extends string>({
  className,
  markdown,
  markerMode,
  visualKeys,
  renderVisual,
  renderStickyVisual,
  rootRef,
}: VisualMarkdownArticleProps<VisualKey>): JSX.Element {
  const parts = useMemo(() => parseArticle(markdown, markerMode, visualKeys), [markdown, markerMode, visualKeys]);

  return (
    <div ref={rootRef} className={className}>
      {parts.map((part, index) => {
        if (part.kind === 'markdown') return <ScribbleMarkdown key={`markdown-${index}`} markdown={part.markdown} />;
        if (part.marker === 'sticky' && renderStickyVisual) {
          return <React.Fragment key={`${part.marker}-${part.visualKey}-${index}`}>{renderStickyVisual(part.visualKey, <ScribbleMarkdown markdown={part.markdown} />)}</React.Fragment>;
        }
        return <React.Fragment key={`${part.marker}-${part.visualKey}-${index}`}>{renderVisual(part.visualKey)}</React.Fragment>;
      })}
    </div>
  );
}
