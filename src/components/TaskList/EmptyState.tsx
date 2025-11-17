import styles from './TaskList.module.css';
import { EmptyStateProps } from './types';

export const EmptyState = ({ title, description, locale = 'en', t = (key) => key }: EmptyStateProps) => {
  return (
    <div className={`${styles['task-empty-state']} ${styles['fade-in']}`}>
      <h4 className={styles['task-empty-title']}>{title}</h4>
      {description && (
        <p className={styles['task-empty-description']}>{description}</p>
      )}
    </div>
  );
};