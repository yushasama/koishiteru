import React, { type ReactNode } from 'react';
import Image from 'next/image';
import type { BlogPost } from '../../lib/blog/posts';
import ReadingProgress from './ReadingProgress';
import styles from './blog.module.css';

interface ArticleShellProps {
  post: BlogPost;
  children: ReactNode;
}

export default function ArticleShell({ post, children }: ArticleShellProps): JSX.Element {
  const heroVisualClass = post.visualStory === 'asic-reverse-engineering' ? styles.articleHeroAsic : post.visualStory === 'systems-optimization' ? styles.articleHeroSystems : '';

  return (
    <main className={styles.articlePage}>
      <header className={`${styles.articleHero} ${heroVisualClass}`}>
        {post.visualStory === 'systems-optimization' && <div className={styles.articleHeroSystemsArtwork}><Image src={post.heroImage ?? post.thumbnail} alt="" fill priority quality={95} sizes="100vw" className={styles.articleHeroSystemsImage} /></div>}
        <div className={styles.articleHeroInner}>
          <p className={styles.articleCategory}>{post.category}</p>
          <h1>{post.title}</h1>
          <p className={styles.articleExcerpt}>{post.excerpt}</p>
          <div className={styles.articleMeta}><time dateTime={post.publishedAt}>{post.displayDate}</time><span>{post.readingMinutes} min read</span></div>
        </div>
      </header>
      <div className={`${styles.articleGrid} ${post.visualStory ? styles.articleGridVisual : ''}`}>
        <ReadingProgress sections={post.sections} />
        {children}
      </div>
      <footer className={styles.blogFooter}>© 2026 Leon Do ・ 恋してる</footer>
    </main>
  );
}
