import type { Task } from '@/types/task';
import type { ColumnType, Priority } from '@/lib/constants';
import { getPriorityColor } from './constants';

export function findColumnOfTask(
  taskId: number,
  tasksByColumn: Record<string, Task[]>
): string | null {
  for (const [columnId, tasks] of Object.entries(tasksByColumn)) {
    if (tasks.some((t: Task) => t.id === taskId)) {
      return columnId;
    }
  }
  return null;
}

export function getPriorityLabel(priority: Priority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getPriorityColorClasses(priority: Priority) {
  return getPriorityColor(priority);
}

export function sortTasksByOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.order - b.order);
}

export function filterTasksByColumn(tasks: Task[], column: ColumnType): Task[] {
  return tasks.filter((t) => t.column === column);
}

export function groupTasksByColumn(tasks: Task[]): Record<string, Task[]> {
  return {
    backlog: sortTasksByOrder(filterTasksByColumn(tasks, 'backlog')),
    in_progress: sortTasksByOrder(filterTasksByColumn(tasks, 'in_progress')),
    review: sortTasksByOrder(filterTasksByColumn(tasks, 'review')),
    done: sortTasksByOrder(filterTasksByColumn(tasks, 'done')),
  };
}
