'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const DocumentViewer = dynamic(() => import('../../../components/DocumentViewer'), {
  ssr: false,
});

export default function WriteupPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarkdown() {
      try {
        const response = await fetch(`/comp/writeups_md/${slug}.md`);
        if (!response.ok) {
          throw new Error('Writeup not found');
        }
        const markdown = await response.text();
        setMarkdownContent(markdown);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load writeup');
      }
    }

    loadMarkdown();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return <DocumentViewer markdownContent={markdownContent} slug={slug} />;
}

