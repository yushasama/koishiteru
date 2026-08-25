import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import ArticleShell from '../../../components/blog/ArticleShell';
import AsicArticleBody from '../../../components/blog/asic/AsicArticleBody';
import styles from '../../../components/blog/blog.module.css';
import { ASIC_ARTICLE_SLUG } from '../../../lib/asic-access/config';
import { getBlogPost, getBlogPostContentPath } from '../../../lib/blog/posts';

const post = getBlogPost(ASIC_ARTICLE_SLUG);

export const metadata: Metadata = post ? { title: `${post.title} | 恋してる`, description: post.excerpt, robots: { follow: false, index: false, noarchive: true, nocache: true, nosnippet: true } } : {};

export default async function AsicArticlePage(): Promise<JSX.Element> {
  if (!post) notFound();
  const markdown = await readFile(path.join(process.cwd(), getBlogPostContentPath(post)), 'utf8');
  return <ArticleShell post={post}><div className={`${styles.articleProse} ${styles.articleProseVisual}`} data-article-content><AsicArticleBody markdown={markdown} /></div></ArticleShell>;
}
