import type { Metadata } from 'next';
import React from 'react';
import { ASIC_ACCESS_ENDPOINT } from '../../lib/asic-access/config';
import styles from './access.module.css';

export const metadata: Metadata = {
  title: 'Private ASIC notes | 恋してる',
  description: 'Password required.',
  robots: { follow: false, index: false, noarchive: true, nocache: true, nosnippet: true },
};

interface AsicAccessPageProps {
  searchParams?: { error?: string };
}

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  invalid: 'That password did not unlock the article.',
  unavailable: 'The access gate is temporarily unavailable.',
};

export default function AsicAccessPage({ searchParams }: AsicAccessPageProps): JSX.Element {
  const errorMessage = searchParams?.error ? ERROR_MESSAGES[searchParams.error] : undefined;

  return (
    <main className={styles.page} data-asic-access-page>
      <div className={styles.field} aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <section className={styles.panel} aria-labelledby="access-title">
        <header className={styles.eyebrow}><span>JSC / ASIC</span><strong>RESTRICTED BUILD</strong></header>
        <div className={styles.chip} aria-hidden="true">
          <span className={styles.die}>ACCESS</span>
          {Array.from({ length: 16 }, (_, index) => <i key={index} />)}
        </div>
        <div className={styles.copy}>
          <p>Private engineering notes</p>
          <h1 id="access-title">This layer is locked.</h1>
          <span>The article and every ASIC asset stay behind the server boundary until your session is verified.</span>
        </div>
        <form className={styles.form} action={ASIC_ACCESS_ENDPOINT} method="post">
          <label htmlFor="asic-password">Access password</label>
          <div className={styles.inputRow}>
            <input id="asic-password" name="password" type="password" autoComplete="current-password" minLength={1} maxLength={1024} required aria-describedby="access-status" />
            <button type="submit">Unlock <span aria-hidden="true">→</span></button>
          </div>
          <div className={styles.status} id="access-status" aria-live="polite">{errorMessage ?? 'Encrypted session · expires after 8 hours'}</div>
        </form>
      </section>
      <footer className={styles.footer}><span>NOINDEX</span><span>SERVER VERIFIED</span><span>HTTPONLY SESSION</span></footer>
    </main>
  );
}
