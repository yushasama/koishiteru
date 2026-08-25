import type { Metadata } from 'next';
import React from 'react';
import { ASIC_ACCESS_ENDPOINT } from '../../lib/asic-access/config';
import styles from './access.module.css';

export const metadata: Metadata = {
  title: 'Password protected blog | 恋してる',
  description: 'This blog will be publicly released after September 4.',
  robots: { follow: false, index: false, noarchive: true, nocache: true, nosnippet: true },
};

interface AsicAccessPageProps {
  searchParams?: { error?: string };
}

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  invalid: 'Incorrect password.',
  unavailable: 'Password access is temporarily unavailable.',
};

export default function AsicAccessPage({ searchParams }: AsicAccessPageProps): JSX.Element {
  const errorMessage = searchParams?.error ? ERROR_MESSAGES[searchParams.error] : undefined;

  return (
    <main className={styles.page} data-asic-access-page>
      <section className={styles.panel} aria-labelledby="access-title">
        <div className={styles.copy}>
          <h1 id="access-title">This blog is password protected.</h1>
          <p>It will be publicly released after September 4.</p>
        </div>
        <form className={styles.form} action={ASIC_ACCESS_ENDPOINT} method="post">
          <label htmlFor="asic-password">Password</label>
          <div className={styles.inputRow}>
            <input id="asic-password" name="password" type="password" autoComplete="current-password" minLength={1} maxLength={1024} required aria-describedby="access-status" />
            <button type="submit">Continue</button>
          </div>
          <div className={styles.status} id="access-status" aria-live="polite">{errorMessage}</div>
        </form>
      </section>
    </main>
  );
}
