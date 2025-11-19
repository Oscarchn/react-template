import { Empty, Typography } from '@douyinfe/semi-ui';
import { IllustrationNoContent, IllustrationNoContentDark } from '@douyinfe/semi-illustrations';
import { EmptyStateProps } from './types';
import styles from './TaskList.module.css';

const { Text } = Typography;

export const EmptyState = ({ title, description, locale = 'en', t = (key) => key }: EmptyStateProps) => {
  return (
    <div className={`${styles['task-empty-state']} ${styles['fade-in']}`}>
      <Empty
        image={<IllustrationNoContent style={{ width: 150, height: 150 }} />}
        darkModeImage={<IllustrationNoContentDark style={{ width: 150, height: 150 }} />}
        title={
          <Text strong style={{ fontSize: 16, color: 'var(--gray-8)' }}>
            {title}
          </Text>
        }
        description={
          description && (
            <Text type="tertiary" style={{ fontSize: 14 }}>
              {description}
            </Text>
          )
        }
      />
    </div>
  );
};