import { useMemo } from 'react';
import { Button, Select, Badge } from '@douyinfe/semi-ui';
import { TaskListProps } from './types';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { SkeletonList } from './SkeletonList';
import styles from './TaskList.module.css';

const defaultT = (key: string): string => {
  const dict: Record<string, string> = {
    refresh: 'Refresh',
    'filter.all': 'All Status',
    'filter.placeholder': 'Filter by status',
    'empty.title': 'No tasks found',
    'empty.description': 'There are no tasks associated with this project yet.',
  };
  return dict[key] || key;
};

export const TaskList = ({
  projectName,
  tasks,
  loading,
  onRefresh,
  statusOptions = [],
  activeStatusFilter,
  onChangeStatusFilter,
  locale = 'en',
  t = defaultT,
  onUpdateStatus,
}: TaskListProps & { onUpdateStatus?: (id: string, status: string) => void }) => {
  const filteredTasks = useMemo(() => {
    if (!activeStatusFilter) return tasks;
    return tasks.filter(task => task.status === activeStatusFilter);
  }, [tasks, activeStatusFilter]);

  const handleStatusChange = (value: string) => {
    if (onChangeStatusFilter) onChangeStatusFilter(value === 'all' ? null : value);
  };

  return (
    <div className={styles['task-list-container']}>
      <div className={styles['task-header']}>
        <div className={styles['task-header-top']}>
          <div className={styles['task-header-title']}>
            <h3 className={styles['task-project-name']}>{projectName}</h3>
            <Badge count={filteredTasks.length} className={styles['task-count-badge']} />
          </div>
          <div className={styles['task-header-actions']}>
            {statusOptions.length > 0 && (
              <Select
                value={activeStatusFilter || 'all'}
                onChange={(v) => handleStatusChange(String(v))}
                className={styles['task-filter']}
              >
                <Select.Option value={'all'}>{t('filter.all')}</Select.Option>
                {statusOptions.map(opt => (
                  <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                ))}
              </Select>
            )}
            {onRefresh && (
              <Button onClick={onRefresh} disabled={loading}>{t('refresh')}</Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonList count={6} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState title={t('empty.title')} description={t('empty.description')} locale={locale} t={t} />
      ) : (
        <div className={styles['task-grid']}>
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} locale={locale} t={t} statusOptions={statusOptions} onUpdateStatus={onUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
};