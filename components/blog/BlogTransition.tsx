'use client';

import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { blogPosts } from '../../lib/blog/posts';
import { BLOG_ARTICLE_NAVIGATION_EVENT, type BlogArticleNavigationDetail, isBlogArticleNavigationDetail } from './blogNavigation';
import styles from './blog.module.css';

interface BlogTransitionProps {
  children: ReactNode;
}

type TransitionPhase = 'covering' | 'waiting' | 'revealing';

interface ArticleTransitionState {
  detail: BlogArticleNavigationDetail;
  phase: TransitionPhase;
  progress: number;
  direct: boolean;
}

function getArticleDetail(pathname: string): BlogArticleNavigationDetail | null {
  const slug = pathname.startsWith('/blog/') ? pathname.slice('/blog/'.length) : '';
  const post = blogPosts.find((candidate) => candidate.slug === slug);
  if (!post) return null;
  return { href: `/blog/${post.slug}`, title: post.title, category: post.category, thumbnail: post.thumbnail, requiresAccess: post.requiresAccess };
}

export default function BlogTransition({ children }: BlogTransitionProps): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [transition, setTransition] = useState<ArticleTransitionState | null>(() => {
    const detail = getArticleDetail(pathname);
    return detail ? { detail, phase: 'waiting', progress: 0, direct: true } : null;
  });
  const transitionRef = useRef(transition);
  transitionRef.current = transition;
  const transitionActive = transition !== null;
  const transitionPhase = transition?.phase ?? null;
  const transitionHref = transition?.detail.href ?? null;

  useEffect(() => {
    const handleNavigation = (event: Event): void => {
      const detail = event instanceof CustomEvent ? event.detail : null;
      if (!isBlogArticleNavigationDetail(detail) || detail.href === pathname || transitionActive) return;
      setTransition({ detail, phase: 'covering', progress: 0, direct: false });
    };

    window.addEventListener(BLOG_ARTICLE_NAVIGATION_EVENT, handleNavigation);
    return () => window.removeEventListener(BLOG_ARTICLE_NAVIGATION_EVENT, handleNavigation);
  }, [pathname, transitionActive]);

  useEffect(() => {
    if (transitionPhase !== 'covering' || !transitionHref) return;

    if (reduceMotion) {
      setTransition((current) => current ? { ...current, phase: 'waiting', progress: 100 } : null);
      router.push(transitionHref);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number): void => {
      const elapsed = Math.min((now - startedAt) / 460, 1);
      const progress = Math.floor((1 - Math.pow(1 - elapsed, 2)) * 72);
      setTransition((current) => current ? { ...current, progress } : null);

      if (elapsed < 1) {
        frame = window.requestAnimationFrame(tick);
        return;
      }

      setTransition((current) => current ? { ...current, phase: 'waiting', progress: 72 } : null);
      router.push(transitionHref);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [reduceMotion, router, transitionHref, transitionPhase]);

  useEffect(() => {
    if (transitionPhase !== 'waiting' || !transitionHref || pathname !== transitionHref) return;

    if (reduceMotion) {
      const reducedTimer = window.setTimeout(() => setTransition((current) => current ? { ...current, phase: 'revealing', progress: 100 } : null), 80);
      return () => window.clearTimeout(reducedTimer);
    }

    let frame = 0;
    let revealTimer = 0;
    const startedAt = performance.now();
    const startProgress = transitionRef.current?.progress ?? 0;
    const duration = transitionRef.current?.direct ? 760 : 240;
    const tick = (now: number): void => {
      const elapsed = Math.min((now - startedAt) / duration, 1);
      const progress = Math.floor(startProgress + (100 - startProgress) * (1 - Math.pow(1 - elapsed, 3)));
      setTransition((current) => current ? { ...current, progress } : null);

      if (elapsed < 1) {
        frame = window.requestAnimationFrame(tick);
        return;
      }

      revealTimer = window.setTimeout(() => setTransition((current) => current ? { ...current, phase: 'revealing', progress: 100 } : null), 120);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(revealTimer);
    };
  }, [pathname, reduceMotion, transitionHref, transitionPhase]);

  useEffect(() => {
    if (transitionPhase !== 'revealing') return;
    const doneTimer = window.setTimeout(() => setTransition(null), reduceMotion ? 220 : 1250);
    return () => window.clearTimeout(doneTimer);
  }, [reduceMotion, transitionPhase]);

  const articleEntering = transition?.phase === 'revealing' && pathname === transition.detail.href;
  const phaseClass = transition?.phase === 'covering' ? styles.routeTransitionCovering : transition?.phase === 'waiting' ? styles.routeTransitionWaiting : styles.routeTransitionRevealing;

  return (
    <>
      <div className={articleEntering ? styles.articleContentEntering : undefined}>{children}</div>
      {transition && (
        <div className={`${styles.routeTransition} ${phaseClass}`} aria-hidden="true">
          <div className={styles.routeTransitionMedia}>{transition.detail.requiresAccess ? <div className={styles.lockedTransition} aria-hidden="true"><span>JSC / ASIC</span><strong>PRIVATE BUILD</strong></div> : <Image src={transition.detail.thumbnail} alt="" fill sizes="min(460px, calc(100vw - 32px))" priority />}</div>
          <div className={styles.routeTransitionCenter}>
            <span className={styles.routeTransitionMark}>{`${transition.detail.category} / loading article`}</span>
            <strong className={styles.routeTransitionCounter}>{String(transition.progress).padStart(2, '0')}%</strong>
            <span className={styles.routeTransitionTitle}>{transition.detail.title}</span>
          </div>
          <div className={styles.routeTransitionTrack}><span style={{ transform: `scaleX(${transition.progress / 100})` }} /></div>
        </div>
      )}
    </>
  );
}
