import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import ArticleBody from '../../../components/blog/ArticleBody';
import ArticleShell from '../../../components/blog/ArticleShell';
import { ASIC_ARTICLE_SLUG } from '../../../lib/asic-access/config';
import { readBlogPostMarkdown } from '../../../lib/blog/content';
import { createBlogImageMetadata } from '../../../lib/blog/metadata';
import { blogPosts, getBlogPost } from '../../../lib/blog/posts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  return { title: `${post.title} | 恋してる`, description: post.excerpt, ...createBlogImageMetadata(post.thumbnail) };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const markdown = await readBlogPostMarkdown(post);
  return <ArticleShell post={post}><ArticleBody markdown={markdown} sections={post.sections} visualStory={post.visualStory} /></ArticleShell>;
}
