'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import type { ScribbleRenderProps } from 'scribble-render';
import 'scribble-render/dist/index.css';
import styles from './blog.module.css';

interface ScribbleMarkdownProps {
  markdown: string;
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

export default function ScribbleMarkdown({ markdown }: ScribbleMarkdownProps): JSX.Element {
  return <ScribbleRender content={markdown} theme={theme} codeTheme="material-theme-darker" loadMermaid={false} />;
}
