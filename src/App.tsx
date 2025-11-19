import './App.css';
import { bitable, ITableMeta } from "@lark-base-open/js-sdk";
import { Button, Form, Typography } from '@douyinfe/semi-ui';
import { BaseFormApi } from '@douyinfe/semi-foundation/lib/es/form/interface';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TaskList } from './components/TaskList';
import type { Task, StatusOption } from './components/TaskList/types';
import { DEFAULT_ALL_STATUSES } from './components/TaskList/types';
import { getCurrentSelection, getLinkedTaskRecordIds, loadTasksByRecordIds, getProjectDisplayName, updateTaskStatus } from './services/taskQuery';
import { useTranslation } from 'react-i18next';

export default function App() {
  const [tableMetaList, setTableMetaList] = useState<ITableMeta[]>();
  const formApi = useRef<BaseFormApi>();
  const [projectName, setProjectName] = useState<string>('Project');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'todo' | 'done' | null>(null);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const { t, i18n } = useTranslation();
  const [tasksTableId, setTasksTableId] = useState<string | undefined>(undefined);

  const addRecord = useCallback(async ({ table: tableId }: { table: string }) => {
    if (tableId) {
      const table = await bitable.base.getTableById(tableId);
      table.addRecord({ fields: {} });
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    try {
      const sel = await getCurrentSelection();
      const recordId = sel?.recordId;
      if (!recordId) {
        setTasks([]);
        setProjectName('Project');
      } else {
        const display = await getProjectDisplayName(recordId);
        setProjectName(display || `Project ${recordId}`);
        const link = await getLinkedTaskRecordIds(recordId);
        console.log('task_ids', link);
        const list = await loadTasksByRecordIds(link.recordIds, link.tableId);
        setTasksTableId(link.tableId);
        console.log('task_list_len', list.length);
        setTasks(list);
        const all = DEFAULT_ALL_STATUSES;
        setStatusOptions(all.map(v => ({ value: v, label: t(`status.${v}`) })));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([bitable.base.getTableMetaList(), bitable.base.getSelection()])
      .then(([metaList, selection]) => {
        setTableMetaList(metaList);
        formApi.current?.setValues({ table: selection.tableId });
      });
    refreshTasks();
    try {
      (bitable.base as any).onSelectionChange?.(() => {
        refreshTasks();
      });
    } catch {}
  }, [refreshTasks]);

  return (
    <main className="main">
      <div className="app-header">
        <Typography.Title heading={5} style={{ margin: 0, fontWeight: 600 }}>
          Project-Task Booster
        </Typography.Title>
      </div>
      
      <TaskList
        projectName={projectName}
        tasks={tasks}
        loading={loading}
        onRefresh={refreshTasks}
        statusOptions={statusOptions}
        activeStatusFilter={activeStatusFilter}
        onChangeStatusFilter={setActiveStatusFilter}
        locale={i18n.language === 'zh' ? 'zh' : 'en'}
        t={t}
        onUpdateStatus={async (id: string, status: 'todo' | 'done') => {
          const ok = await updateTaskStatus(id, status, tasksTableId);
          if (ok) {
            setTasks(prev => prev.map(item => item.id === id ? { ...item, status } : item));
          }
        }}
      />
    </main>
  )
}