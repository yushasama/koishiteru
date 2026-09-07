import type { Metadata } from 'next';
import React from 'react';
import BlogHero from '../../components/blog/BlogHero';
import PostList from '../../components/blog/PostList';
import styles from '../../components/blog/blog.module.css';
import { getBlogPosts } from '../../lib/blog/posts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Blog | 恋してる',
  description: 'Infrastructure, systems, optimization, and whatever else was interesting enough to write down.',
};

export default function BlogPage(): JSX.Element {
  const posts = getBlogPosts();

  return (
    <main className={styles.blogPage}>
      <BlogHero />
      <section className={styles.blogSection} aria-labelledby="latest-writing">
        <div className={styles.sectionHeader}>
          <h2 id="latest-writing">Latest writing</h2>
          <span>{String(posts.length).padStart(2, '0')} {posts.length === 1 ? 'entry' : 'entries'}</span>
        </div>
        <PostList posts={posts} />
      </section>
      <footer className={styles.blogFooter}>© 2026 Leon Do ・ 恋してる</footer>
    </main>
  );
}
