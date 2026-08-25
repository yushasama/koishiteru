'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { type KeyboardEvent, type MouseEvent } from 'react';
import type { BlogPost } from '../../lib/blog/posts';
import { requestBlogArticleNavigation } from './blogNavigation';
import styles from './blog.module.css';
import SystemsThumbnail from './systems/SystemsThumbnail';

interface PostRowProps {
  post: BlogPost;
  receded: boolean;
  onFocus: () => void;
  onHover: () => void;
}

export default function PostRow({ post, receded, onFocus, onHover }: PostRowProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const href = `/blog/${post.slug}`;

  const navigateToArticle = (): void => {
    requestBlogArticleNavigation({ href, title: post.title, category: post.category, thumbnail: post.thumbnail, requiresAccess: post.requiresAccess });
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateToArticle();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>): void => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    navigateToArticle();
  };

  return (
    <motion.div animate={{ opacity: receded ? 0.58 : 1 }} transition={{ duration: reduceMotion ? 0 : 0.28 }} className={styles.postRowWrap}>
      <Link href={href} prefetch={!post.requiresAccess} className={styles.postRow} onClick={handleClick} onKeyDown={handleKeyDown} onFocus={onFocus} onMouseEnter={onHover}>
        <div className={styles.thumbnail}>
          {post.requiresAccess
            ? <div className={styles.lockedThumbnail} aria-label="Password required"><span>PRIVATE</span><i>ASIC</i></div>
            : post.visualStory === 'systems-optimization'
            ? <SystemsThumbnail />
            : <Image src={post.thumbnail} alt={post.thumbnailAlt} fill sizes="(max-width: 767px) calc(100vw - 40px), 160px" />}
        </div>
        <div className={styles.postMain}>
          <span className={styles.postCategory}>{post.category}</span>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </div>
        <div className={styles.postMeta}>
          <span><time dateTime={post.publishedAt}>{post.displayDate}</time><br />{post.readingMinutes} min read</span>
          <span className={styles.postArrow} aria-hidden="true">↗</span>
        </div>
      </Link>
    </motion.div>
  );
}
