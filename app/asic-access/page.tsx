import type { Metadata } from 'next';
import React from 'react';
import { ASIC_ACCESS_ENDPOINT } from '../../lib/asic-access/config';
import { ASIC_PUBLIC_THUMBNAIL_PATH } from '../../lib/asic-access/routes';
import { createBlogImageMetadata } from '../../lib/blog/metadata';
import styles from './access.module.css';
import PasswordInput from './PasswordInput';

export const metadata: Metadata = {
  ...createBlogImageMetadata(ASIC_PUBLIC_THUMBNAIL_PATH),
  title: 'Password protected blog | 恋してる',
  description: 'This blog will be publicly released after September 4.',
  robots: { follow: false, index: false, noarchive: true, nocache: true, nosnippet: true },
};

interface AsicAccessPageProps {
  searchParams?: Promise<{ error?: string }>;
}

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  invalid: 'Incorrect password.',
  unavailable: 'Password access is temporarily unavailable.',
};

export default async function AsicAccessPage({ searchParams }: AsicAccessPageProps): Promise<JSX.Element> {
  const { error } = searchParams ? await searchParams : {};
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

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
            <PasswordInput />
            <button className={styles.submitButton} type="submit">Continue</button>
          </div>
          <div className={styles.status} id="access-status" aria-live="polite">{errorMessage}</div>
        </form>
      </section>
    </main>
  );
}
