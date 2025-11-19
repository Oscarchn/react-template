import { bitable } from '@lark-base-open/js-sdk';
import type { Task, Assignee } from '../components/TaskList/types';

const PROJECT_TABLE_NAME = 'project';
const TASK_TABLE_NAME = 'tasks';
const PROJECT_TASKS_FIELD_NAME = 'tasks';
const TASK_NAME_FIELD_NAME = 'name';
const TASK_STATUS_FIELD_NAME = 'status';
const TASK_USER_FIELD_NAME = 'User';

export async function getCurrentSelection() {
  try {
    const sel = await bitable.base.getSelection();
    console.log('selection', sel);
    return sel;
  } catch (e) {
    console.log('selection_error', e);
    return {} as any;
  }
}

async function getTableByNameSafe(name: string) {
  try {
    const t = await bitable.base.getTableByName(name);
    return t;
  } catch (e) {
    return null;
  }
}

async function getTaskTable() {
  const t1 = await getTableByNameSafe(TASK_TABLE_NAME);
  if (t1) return t1;
  const t2 = await getTableByNameSafe('task');
  return t2;
}

export async function getLinkedTaskRecordIds(projectRecordId: string): Promise<{ recordIds: string[]; tableId?: string }> {
  const projectTable = await getTableByNameSafe(PROJECT_TABLE_NAME);
  if (!projectTable) return { recordIds: [] };

  // Try field by name
  let tasksField: any = null;
  try {
    tasksField = await (projectTable as any).getFieldByName?.(PROJECT_TASKS_FIELD_NAME);
  } catch {}

  // Attempt to read via field APIs
  try {
    if (tasksField) {
      if (typeof tasksField.getLinkedRecordIds === 'function') {
        const ids = await tasksField.getLinkedRecordIds(projectRecordId);
        console.log('linked_task_ids_by_field_api', ids);
        if (Array.isArray(ids)) return { recordIds: ids };
      }
      if (typeof tasksField.getCell === 'function') {
        const cell = await tasksField.getCell(projectRecordId);
        const val = await cell?.getValue?.();
        const norm = normalizeLinkValue(val);
        console.log('linked_task_ids_by_cell_value', norm);
        if (norm.recordIds.length) return norm;
      }
    }
  } catch {}

  // Fallback: try generic table API
  try {
    const fieldId = await tasksField?.getId?.();
    if (fieldId && typeof (projectTable as any).getCell === 'function') {
      const cell = await (projectTable as any).getCell(projectRecordId, fieldId);
      const val = await cell?.getValue?.();
      const norm = normalizeLinkValue(val);
      console.log('linked_task_ids_by_table_cell', norm);
      if (norm.recordIds.length) return norm;
    }
  } catch {}

  try {
    const norm = await scanLinkFieldsForRecordIds(projectTable, projectRecordId);
    if (norm.recordIds.length) {
      console.log('linked_task_ids_by_scan', norm);
      return norm;
    }
  } catch {}

  return { recordIds: [] };
}

async function scanLinkFieldsForRecordIds(projectTable: any, recordId: string): Promise<{ recordIds: string[]; tableId?: string }> {
  const out: string[] = [];
  let tableId: string | undefined;
  let metas: any[] = [];
  try {
    if (typeof projectTable.getFieldMetaList === 'function') {
      metas = await projectTable.getFieldMetaList();
    } else if (typeof projectTable.getFieldList === 'function') {
      metas = await projectTable.getFieldList();
    }
  } catch {}
  const candidates = metas && metas.length ? metas : [];
  for (const m of candidates) {
    try {
      const field = m?.id ? await projectTable.getField?.(m.id) : m;
      if (!field) continue;
      if (typeof field.getCell === 'function') {
        const cell = await field.getCell(recordId);
        const val = await cell?.getValue?.();
        const norm = normalizeLinkValue(val);
        if (norm.recordIds.length) {
          out.push(...norm.recordIds);
          tableId = norm.tableId;
          break;
        }
      }
    } catch {}
  }
  return { recordIds: out, tableId };
}

export async function getProjectDisplayName(recordId: string): Promise<string> {
  const projectTable = await getTableByNameSafe(PROJECT_TABLE_NAME);
  if (!projectTable) return 'Project';
  try {
    const nameField = await (projectTable as any).getFieldByName?.('name');
    if (nameField && typeof nameField.getCell === 'function') {
      const c = await nameField.getCell(recordId);
      const val = await c?.getValue?.();
      const s = parseTextCellValue(val);
      if (s) return s;
    }
  } catch {}
  try {
    const metas = typeof projectTable.getFieldMetaList === 'function' ? await projectTable.getFieldMetaList() : [];
    for (const m of metas) {
      try {
        const f = await projectTable.getField?.(m.id);
        const cell = await f?.getCell?.(recordId);
        const val = await cell?.getValue?.();
        const s = parseTextCellValue(val);
        if (s) return s;
      } catch {}
    }
  } catch {}
  return `Project ${recordId}`;
}

function parseTextCellValue(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    const first = val[0];
    if (first && typeof first.text === 'string') return first.text;
  }
  return String(val);
}

function parseUserCellValue(val: any): Assignee[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((u: any) => ({ id: u.id || '', name: u.name || '', avatarUrl: u.avatar_url })) as Assignee[];
  }
  return [];
}

const taskCache = new Map<string, Task>();

export async function loadTasksByRecordIds(taskRecordIds: string[], tableId?: string): Promise<Task[]> {
  const taskTable = tableId ? await (async () => { try { return await bitable.base.getTableById(tableId); } catch { return await getTaskTable(); } })() : await getTaskTable();
  if (!taskTable) return [];

  const out: Task[] = [];
  for (const rid of taskRecordIds) {
    try {
      if (taskCache.has(rid)) {
        out.push(taskCache.get(rid)!);
        continue;
      }
      const nameField = await resolveFieldByNames(taskTable, [TASK_NAME_FIELD_NAME]);
      const statusField = await resolveFieldByNames(taskTable, [TASK_STATUS_FIELD_NAME]);
      let userField = await resolveFieldByNames(taskTable, [TASK_USER_FIELD_NAME, 'Assignee', '负责人', '执行人', 'Owner']);

      let nameVal: any = '';
      let statusVal: any = '';
      let userVal: any = [];

      if (nameField && typeof nameField.getCell === 'function') {
        const c = await nameField.getCell(rid);
        nameVal = await c?.getValue?.();
      }
      if (statusField && typeof statusField.getCell === 'function') {
        const c = await statusField.getCell(rid);
        statusVal = await c?.getValue?.();
      }
      if (userField && typeof userField.getCell === 'function') {
        const c = await userField.getCell(rid);
        userVal = await c?.getValue?.();
      }
      if ((!userVal || (Array.isArray(userVal) && userVal.length === 0)) && typeof taskTable.getFieldMetaList === 'function') {
        // Fallback: scan fields to find first cell that parses into assignees
        try {
          const metas = await taskTable.getFieldMetaList();
          for (const m of metas) {
            try {
              const f = await taskTable.getField(m.id);
              if (typeof f.getCell === 'function') {
                const c = await f.getCell(rid);
                const v = await c?.getValue?.();
                const parsed = parseUserCellValue(v);
                if (parsed && parsed.length) { userField = f; userVal = v; break; }
              }
            } catch {}
          }
        } catch {}
      }

      const task: Task = {
        id: rid,
        name: parseTextCellValue(nameVal) || rid,
        status: sanitizeStatus(statusVal),
        assignees: parseUserCellValue(userVal),
      };
      taskCache.set(rid, task);
      out.push(task);
    } catch {}
  }
  console.log('loaded_tasks', out);
  return out;
}

function normalizeLinkValue(val: any): { recordIds: string[]; tableId?: string } {
  if (!val) return { recordIds: [] };
  if (Array.isArray(val)) {
    if (!val.length) return { recordIds: [] };
    const first = val[0];
    if (first && typeof first === 'object') {
      if (Array.isArray(first.link_record_ids)) return { recordIds: first.link_record_ids, tableId: first.table_id || first.tableId };
      if (Array.isArray(first.record_ids)) return { recordIds: first.record_ids, tableId: first.table_id || first.tableId };
      if (Array.isArray(first.recordIds)) return { recordIds: first.recordIds, tableId: first.table_id || first.tableId };
    }
    if (typeof first === 'string') return { recordIds: val as string[] };
  }
  if (typeof val === 'object') {
    if (Array.isArray(val.link_record_ids)) return { recordIds: val.link_record_ids, tableId: val.table_id || val.tableId };
    if (Array.isArray(val.record_ids)) return { recordIds: val.record_ids, tableId: val.table_id || val.tableId };
    if (Array.isArray(val.recordIds)) return { recordIds: val.recordIds, tableId: val.table_id || val.tableId };
  }
  return { recordIds: [] };
}

export async function updateTaskStatus(recordId: string, status: 'todo' | 'done', tableId?: string): Promise<boolean> {
  try {
    const taskTable = tableId ? await bitable.base.getTableById(tableId) : await getTaskTable();
    const statusField = await resolveFieldByNames(taskTable, [TASK_STATUS_FIELD_NAME]);
    const cell = await statusField.getCell(recordId);
    if (!(ALLOWED_STATUSES as string[]).includes(String(status))) return false;
    const current = sanitizeStatus(await cell.getValue?.());
    if (current === 'done' && status === 'todo') {
      return false;
    }
    await cell.setValue(status);
    return true;
  } catch (e) {
    return false;
  }
}

async function resolveFieldByNames(table: any, names: string[]): Promise<any | null> {
  // Try direct byName if available
  for (const nm of names) {
    try {
      const f = await table.getFieldByName?.(nm);
      if (f) return f;
    } catch {}
  }

  // Scan metas to match by name (case-insensitive)
  let metas: any[] = [];
  try {
    metas = typeof table.getFieldMetaList === 'function' ? await table.getFieldMetaList() : [];
  } catch {}
  const lower = names.map(n => String(n).toLowerCase());
  const meta = metas.find(m => lower.includes(String(m.name || '').toLowerCase()));
  if (meta && typeof table.getField === 'function') {
    try {
      const f = await table.getField(meta.id);
      if (f) return f;
    } catch {}
  }
  console.log('resolve_field_failed', names);
  return null;
}
const ALLOWED_STATUSES: Array<'todo' | 'done'> = ['todo', 'done'];

function sanitizeStatus(val: any): 'todo' | 'done' {
  const s = String(parseTextCellValue(val) || '').toLowerCase();
  return (ALLOWED_STATUSES as string[]).includes(s) ? (s as 'todo' | 'done') : 'todo';
}