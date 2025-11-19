export interface Assignee {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  name: string;
  statu
  status: 'todo' | 'done';
  assignees: Assignee[];
}

export interface StatusOption {
  value: 'todo' | 'done';
  label: string;
  color?: string;
}

export interface TaskListProps {
  projectName: string;
  tasks: Task[];
  loading: boolean;
  onRefresh?: () => void;
  statusOptions?: StatusOption[];
  activeStatusFilter?: string | null;
  onChangeStatusFilter?: (status: string | null) => void;
  locale?: 'en' | 'zh';
  t?: (key: string) => string;
}

export interface TaskCardProps {
  task: Task;
  locale?: 'en' | 'zh';
  t?: (key: string) => string;
  onClickTask?: (id: string) => void;
  statusOptions?: StatusOption[];
  onUpdateStatus?: (id: string, status: 'todo' | 'done') => void;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  locale?: 'en' | 'zh';
  t?: (key: string) => string;
}

export interface SkeletonListProps {
  count?: number;
}

export const DEFAULT_STATUS_MAP: Record<'todo' | 'done', string> = {
  todo: '#9397a1',
  done: '#00b42a',
};

export const DEFAULT_ALL_STATUSES: Array<'todo' | 'done'> = ['todo', 'done'];
