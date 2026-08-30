import type { CSSProperties } from 'react';
import { AsicInlineVisual } from '../../components/blog/asic/AsicVisuals';

export default function QaAndGatePage(): JSX.Element {
  const style = { '--asic-accent': '#fb4e7c', '--asic-ease-out': 'cubic-bezier(0.22, 1, 0.36, 1)', minHeight: '100vh', padding: '70px 0 0', background: '#080808' } as CSSProperties;
  return <main style={style}><AsicInlineVisual visualKey="and-gate" /></main>;
}
