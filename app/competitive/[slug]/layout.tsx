'use client';

import React, { useEffect } from 'react';

export default function WriteupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide nav bars
    const navElements = document.querySelectorAll('nav');
    navElements.forEach(nav => {
      (nav as HTMLElement).style.display = 'none';
    });

    // Restore nav bars on unmount
    return () => {
      navElements.forEach(nav => {
        (nav as HTMLElement).style.display = '';
      });
    };
  }, []);

  return <>{children}</>;
}

