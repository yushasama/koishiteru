'use client';

import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import styles from './access.module.css';

export default function PasswordInput(): JSX.Element {
  const [password, setPassword] = useState('');
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={styles.passwordField}>
      <input id="asic-password" name="password" type={revealed ? 'text' : 'password'} value={password} autoComplete="current-password" minLength={1} maxLength={1024} required aria-describedby="access-status" onChange={(event) => setPassword(event.currentTarget.value)} />
      <button className={styles.revealButton} type="button" aria-label={revealed ? 'Hide password' : 'Show password'} aria-pressed={revealed} onClick={() => setRevealed((current) => !current)}>
        {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    </div>
  );
}
