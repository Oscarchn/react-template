import { Tag, Avatar, Select } from '@douyinfe/semi-ui';
import { TaskCardProps, DEFAULT_STATUS_MAP } from './types';
import styles from './TaskList.module.css';

export const TaskCard = ({ task, locale = 'en', t = (key) => key, onClickTask, statusOptions = [], onUpdateStatus }: TaskCardProps) => {
  const getStatusColor = (status: string): string => {
    return DEFAULT_STATUS_MAP[status.toLowerCase()] || DEFAULT_STATUS_MAP.todo;
  };

  const handleClick = () => {
    if (onClickTask) onClickTask(task.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const visibleAssignees = task.assignees.slice(0, 3);
  const remainingCount = task.assignees.length - 3;
  const assigneeNames = task.assignees.map(a => a.name).join(locale === 'zh' ? '、' : ', ');

  return (
    <div
      className={`${styles['task-card']} ${styles['fade-in']}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${t('task')}: ${task.name}`}
    >
      <div className={styles['task-card-header']}>
        <h3 className={styles['task-card-name']}>{task.name}</h3>
        <div className={styles['task-card-status']}>
          <Select value={task.status} onChange={(v) => onUpdateStatus && onUpdateStatus(task.id, String(v))} style={{ minWidth: 140 }}>
            {statusOptions.length === 0 ? (
              <Select.Option value={task.status}>{t(`status.${task.status}`)}</Select.Option>
            ) : (
              statusOptions.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
              ))
            )}
          </Select>
        </div>
      </div>

      {task.assignees.length > 0 && (
        <div className={styles['task-card-assignees']}>
          <div className={styles['task-assignee-avatars']}>
            {visibleAssignees.map((assignee, index) => (
              <div
                key={assignee.id}
                className={styles['task-avatar-item']}
                style={{ zIndex: visibleAssignees.length - index }}
              >
                <Avatar size="small" alt={assignee.name} src={assignee.avatarUrl || undefined} color={assignee.avatarUrl ? undefined : 'blue'}>
                  {assignee.avatarUrl ? null : assignee.name.charAt(0).toUpperCase()}
                </Avatar>
              </div>
            ))}
            {remainingCount > 0 && (
              <div className={styles['task-avatar-item']} style={{ zIndex: 0 }}>
                <Avatar size="small" color="grey">+{remainingCount}</Avatar>
              </div>
            )}
          </div>
          <span className={styles['task-assignee-names']} title={assigneeNames}>{assigneeNames}</span>
        </div>
      )}
    </div>
  );
};