import React from 'react';
import styles from './systems.module.css';

const lanes = [true, false, true, true] as const;

export default function SystemsThumbnail(): JSX.Element {
  return (
    <div className={styles.systemsThumbnail} data-systems-thumbnail aria-hidden="true">
      <div className={styles.systemsThumbnailHeader}>
        <code>x² + y² ≤ 1</code>
      </div>

      <div className={styles.systemsThumbnailRegister}>
        {lanes.map((hit, laneIndex) => (
          <div key={laneIndex} data-hit={hit}>
            <small>DART {laneIndex + 1}</small>
            <b>{hit ? 'HIT' : 'MISS'}</b>
          </div>
        ))}
      </div>

    </div>
  );
}
