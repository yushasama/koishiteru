import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import ArticleBody from '../../../components/blog/ArticleBody';
import ArticleShell from '../../../components/blog/ArticleShell';
import { ASIC_ARTICLE_SLUG } from '../../../lib/asic-access/config';
import { blogPosts, getBlogPost, getBlogPostContentPath } from '../../../lib/blog/posts';

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): Array<{ slug: string }> {
  return blogPosts.filter((post) => post.slug !== ASIC_ARTICLE_SLUG).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return { title: `${post.title} | 恋してる`, description: post.excerpt };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const markdown = await readFile(path.join(process.cwd(), getBlogPostContentPath(post)), 'utf8');
  return <ArticleShell post={post}><ArticleBody markdown={markdown} sections={post.sections} visualStory={post.visualStory} /></ArticleShell>;
}
