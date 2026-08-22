'use client';

import React, { useState } from 'react';
import type { BlogPost } from '../../lib/blog/posts';
import PostRow from './PostRow';
import styles from './blog.module.css';

interface PostListProps {
  posts: readonly BlogPost[];
}

export default function PostList({ posts }: PostListProps): JSX.Element {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <div className={styles.postList} onMouseLeave={() => setActiveSlug(null)}>
      {posts.map((post) => <PostRow key={post.slug} post={post} receded={activeSlug !== null && activeSlug !== post.slug} onFocus={() => setActiveSlug(post.slug)} onHover={() => setActiveSlug(post.slug)} />)}
    </div>
  );
}
