'use client';

import React from 'react';

export default function WriteupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide main site nav immediately with CSS - no wait for JS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .main-site-nav {
          display: none !important;
        }
      ` }} />
      {children}
    </>
  );
}

