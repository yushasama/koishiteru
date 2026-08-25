export const BLOG_ARTICLE_NAVIGATION_EVENT = 'koishite:blog-article-navigation';

export interface BlogArticleNavigationDetail {
  href: string;
  title: string;
  category: string;
  thumbnail: string;
  requiresAccess?: boolean;
}

export function isBlogArticleNavigationDetail(value: unknown): value is BlogArticleNavigationDetail {
  if (typeof value !== 'object' || value === null) return false;
  const detail = value as Partial<BlogArticleNavigationDetail>;
  return typeof detail.href === 'string' && detail.href.startsWith('/blog/') && typeof detail.title === 'string' && typeof detail.category === 'string' && typeof detail.thumbnail === 'string' && detail.thumbnail.startsWith('/') && (detail.requiresAccess === undefined || typeof detail.requiresAccess === 'boolean');
}

export function requestBlogArticleNavigation(detail: BlogArticleNavigationDetail): void {
  window.dispatchEvent(new CustomEvent<BlogArticleNavigationDetail>(BLOG_ARTICLE_NAVIGATION_EVENT, { detail }));
}
