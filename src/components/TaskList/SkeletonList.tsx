import styles from './TaskList.module.css';
import { SkeletonListProps } from './types';

export const SkeletonList = ({ count = 6 }: SkeletonListProps) => {
  return (
    <div className={styles['task-grid']}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles['task-skeleton-card']}>
          <div className={styles['task-skeleton-header']}>
            <div className={`${styles['task-skeleton-line']} ${styles['task-skeleton-title']}`} />
            <div className={`${styles['task-skeleton-line']} ${styles['task-skeleton-badge']}`} />
          </div>
          <div className={styles['task-skeleton-avatars']}>
            <div className={`${styles['task-skeleton-line']} ${styles['task-skeleton-avatar']}`} />
            <div className={`${styles['task-skeleton-line']} ${styles['task-skeleton-avatar']}`} />
          </div>
        </div>
      ))}
    </div>
  );
};