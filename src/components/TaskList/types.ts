export interface Assignee {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  name: string;
  status: string;
  assignees: Assignee[];
}

export interface StatusOption {
  value: string;
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
  onUpdateStatus?: (id: string, status: string) => void;
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

export const DEFAULT_STATUS_MAP: Record<string, string> = {
  todo: '#9397a1',
  doing: '#3370ff',
  done: '#00b42a',
  blocked: '#f53f3f',
  on_hold: '#ff7d00',
};

export const DEFAULT_ALL_STATUSES: string[] = ['todo', 'doing', 'done', 'blocked', 'on_hold'];