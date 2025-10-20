'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DocumentViewer from '../../../components/DocumentViewer';

export default function WriteupPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHTML() {
      try {
        const response = await fetch(`/comp/writeups/${slug}.html`);
        if (!response.ok) {
          // Try without .html extension in case file doesn't have it
          const altResponse = await fetch(`/comp/writeups/${slug}`);
          if (!altResponse.ok) {
            throw new Error('Writeup not found');
          }
          const html = await altResponse.text();
          setHtmlContent(html);
        } else {
          const html = await response.text();
          setHtmlContent(html);
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load writeup');
        setLoading(false);
      }
    }

    loadHTML();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return <DocumentViewer htmlContent={htmlContent} slug={slug} />;
}

