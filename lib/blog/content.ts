import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { BlogPost } from './posts';

export async function readBlogPostMarkdown(post: Pick<BlogPost, 'contentFile' | 'slug'>): Promise<string> {
  return readFile(path.join(process.cwd(), 'content', 'blog', post.slug, post.contentFile), 'utf8');
}
