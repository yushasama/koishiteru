import { ASIC_ARTICLE_PATH } from './config';

export type ProtectedRequestKind = 'asset' | 'document';

export const ASIC_PUBLIC_ASSET_PREFIX = '/blog/asic-reverse-engineering';
export const ASIC_PUBLIC_THUMBNAIL_PATH = `${ASIC_PUBLIC_ASSET_PREFIX}/thumbnail-microscope.webp`;
export const ASIC_ROUTE_CHUNK_PREFIX = `/_next/static/chunks/app/blog/${ASIC_ARTICLE_PATH.slice('/blog/'.length)}`;

function normalizedPath(pathname: string): string {
  try {
    return decodeURIComponent(pathname).replace(/\\/g, '/').toLowerCase();
  } catch {
    return pathname.replace(/\\/g, '/').toLowerCase();
  }
}

function pathMatchesRoot(pathname: string, root: string): boolean {
  const path = normalizedPath(pathname);
  return path === root || path.startsWith(`${root}/`);
}

function isProtectedAssetPath(pathname: string): boolean {
  const path = normalizedPath(pathname);
  if (path === ASIC_PUBLIC_THUMBNAIL_PATH) return false;
  return pathMatchesRoot(path, ASIC_PUBLIC_ASSET_PREFIX) || pathMatchesRoot(path, ASIC_ROUTE_CHUNK_PREFIX);
}

export function protectedRequestKind(url: URL): ProtectedRequestKind | null {
  if (pathMatchesRoot(url.pathname, ASIC_ARTICLE_PATH)) return 'document';
  if (isProtectedAssetPath(url.pathname)) return 'asset';
  if (normalizedPath(url.pathname) !== '/_next/image') return null;

  const source = url.searchParams.get('url');
  return source && isProtectedAssetPath(source) ? 'asset' : null;
}
