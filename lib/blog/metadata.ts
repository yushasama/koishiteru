import type { Metadata } from 'next';

const BLOG_ORIGIN = 'https://koishite.ru';

export function createBlogImageMetadata(thumbnail: string): Pick<Metadata, 'openGraph' | 'twitter'> {
  const image = new URL(thumbnail, BLOG_ORIGIN).href;
  return { openGraph: { images: [image] }, twitter: { card: 'summary_large_image', images: [image] } };
}
