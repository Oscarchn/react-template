import { Card, Tag, Avatar, Select, Typography, Tooltip } from '@douyinfe/semi-ui';
import { IconUser } from '@douyinfe/semi-icons';
import { TaskCardProps, DEFAULT_STATUS_MAP } from './types';
import styles from './TaskList.module.css';

const { Paragraph } = Typography;

export const TaskCard = ({ task, locale = 'en', t = (key) => key, onClickTask, statusOptions = [], onUpdateStatus }: TaskCardProps) => {
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      '未开始': 'grey',
      '进行中': 'blue',
      '已完成': 'green',
      '已阻塞': 'red',
      'Not Started': 'grey',
      'In Progress': 'blue',
      'Completed': 'green',
      'Blocked': 'red',
    };
    return map[status] || 'grey';
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

  return (
    <Card
      className={`${styles['task-card']} ${styles['fade-in']}`}
      bordered={false}
      shadows="hover"
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
      }}
      bodyStyle={{ padding: 'var(--space-lg)' }}
    >
      {/* 任务名称 */}
      <Paragraph 
        strong 
        ellipsis={{ rows: 2, showTooltip: true }}
        style={{ 
          fontSize: 14,
          marginBottom: 'var(--space-md)',
          color: 'var(--gray-9)'
        }}
      >
        {task.name}
      </Paragraph>

      {/* 状态和执行人 */}
      <div className={styles['task-card-footer']}>
        <Select
          value={task.status}
          onChange={(v) => onUpdateStatus && onUpdateStatus(task.id, String(v))}
          size="small"
          style={{ width: 120 }}
          renderSelectedItem={(option) => (
            <Tag 
              color={getStatusColor(option.label)} 
              size="small"
              style={{ 
                borderRadius: 'var(--radius-full)',
                fontWeight: 500 
              }}
            >
              {option.label}
            </Tag>
          )}
        >
          {statusOptions.length === 0 ? (
            <Select.Option value={task.status}>{t(`status.${task.status}`)}</Select.Option>
          ) : (
            statusOptions.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
            ))
          )}
        </Select>

        {task.assignees && task.assignees.length > 0 && (
          <Avatar.Group 
            maxCount={3}
            size="small"
            style={{ marginLeft: 'auto' }}
          >
            {task.assignees.map((assignee, idx) => (
              <Tooltip 
                key={idx} 
                content={assignee.name || assignee.en_name}
                position="top"
              >
                <Avatar 
                  src={assignee.avatarUrl} 
                  size="small"
                  style={{
                    border: '2px solid var(--gray-1)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {assignee.name?.[0] || assignee.en_name?.[0] || <IconUser />}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
        )}
      </div>
    </Card>
  );
};