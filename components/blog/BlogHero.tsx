import Image from 'next/image';
import React from 'react';
import styles from './blog.module.css';

export default function BlogHero(): JSX.Element {
  return (
    <header className={styles.hero}>
      <Image src="/blog/asic-reverse-engineering/thumbnail-microscope-small.webp" alt="" fill priority sizes="100vw" className={styles.heroImage} />
      <div className={styles.heroShade} />
      <div className={styles.heroContent}>
        <p className={styles.eyebrow}>koishite.ru / blog</p>
        <h1>Cache Me<br /><span>If You Can.</span></h1>
        <p className={styles.heroDek}>Infrastructure, systems, optimization &amp; whatever else was interesting enough to write down.</p>
      </div>
    </header>
  );
}
