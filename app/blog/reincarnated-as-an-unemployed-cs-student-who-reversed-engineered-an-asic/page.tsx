import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import ArticleShell from '../../../components/blog/ArticleShell';
import AsicArticleBody from '../../../components/blog/asic/AsicArticleBody';
import styles from '../../../components/blog/blog.module.css';
import { ASIC_ARTICLE_SLUG } from '../../../lib/asic-access/config';
import { readBlogPostMarkdown } from '../../../lib/blog/content';
import { getBlogPost } from '../../../lib/blog/posts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const post = getBlogPost(ASIC_ARTICLE_SLUG);

export const metadata: Metadata = post ? { title: `${post.title} | 恋してる`, description: post.excerpt, robots: { follow: false, index: false, noarchive: true, nocache: true, nosnippet: true } } : {};

export default async function AsicArticlePage(): Promise<JSX.Element> {
  if (!post) notFound();
  const markdown = await readBlogPostMarkdown(post);
  return <ArticleShell post={post}><div className={`${styles.articleProse} ${styles.articleProseVisual}`} data-article-content><AsicArticleBody markdown={markdown} sections={post.sections} /></div></ArticleShell>;
}
