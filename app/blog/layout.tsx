import React, { type ReactNode } from 'react';
import BlogTransition from '../../components/blog/BlogTransition';

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps): JSX.Element {
  return <BlogTransition>{children}</BlogTransition>;
}
