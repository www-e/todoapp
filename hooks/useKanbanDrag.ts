import { useState, useCallback } from 'react';
import {
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { Task } from '@/types/task';
import type { ColumnType } from '@/types/task';
import { COLUMN_IDS } from '@/lib/constants';
import { findColumnOfTask } from '@/lib/taskHelpers';

interface UseKanbanDragProps {
  tasks: Task[];
  onReorder: (id: number, newOrder: number, newColumn?: string) => void;
}

interface DragHandlers {
  handleDragStart: (event: DragStartEvent) => void;
  handleDragMove: (event: DragMoveEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

interface UseKanbanDragReturn {
  sensors: ReturnType<typeof useSensors>;
  handlers: DragHandlers;
  activeTask: Task | null;
  activeDragColumn: string | null;
  DragOverlayComponent: typeof DragOverlay;
}

export function useKanbanDrag({
  tasks,
  onReorder,
}: UseKanbanDragProps): UseKanbanDragReturn {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeDragColumn, setActiveDragColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
      setActiveDragColumn(task.column);
    }
  }, [tasks]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { over } = event;
    if (!over) {
      setActiveDragColumn(null);
      return;
    }

    const overId = over.id as string;

    if (typeof overId === 'string' && COLUMN_IDS.includes(overId as ColumnType)) {
      setActiveDragColumn(overId);
    } else if (typeof overId === 'number') {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        setActiveDragColumn(overTask.column);
      }
    }
  }, [tasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setActiveDragColumn(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as string | number;

    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    const tasksByColumn = {
      backlog: tasks.filter((t) => t.column === 'backlog').sort((a, b) => a.order - b.order),
      in_progress: tasks.filter((t) => t.column === 'in_progress').sort((a, b) => a.order - b.order),
      review: tasks.filter((t) => t.column === 'review').sort((a, b) => a.order - b.order),
      done: tasks.filter((t) => t.column === 'done').sort((a, b) => a.order - b.order),
    };

    if (typeof overId === 'string' && COLUMN_IDS.includes(overId as ColumnType)) {
      if (task.column === overId) return;

      const targetTasks = tasksByColumn[overId as keyof typeof tasksByColumn];
      const newOrder = targetTasks.length;
      onReorder(activeId, newOrder, overId);
      return;
    }

    if (typeof overId === 'number') {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;

      const activeColumn = findColumnOfTask(activeId, tasksByColumn);
      const overColumn = findColumnOfTask(overId, tasksByColumn);

      if (!activeColumn || !overColumn) return;

      if (activeColumn === overColumn) {
        const columnTasks = tasksByColumn[activeColumn as keyof typeof tasksByColumn];
        const oldIndex = columnTasks.findIndex((t: Task) => t.id === activeId);
        const newIndex = columnTasks.findIndex((t: Task) => t.id === overId);

        if (oldIndex === newIndex) return;

        onReorder(activeId, newIndex);
        return;
      }

      const targetTasks = tasksByColumn[overColumn as keyof typeof tasksByColumn];
      const overIndex = targetTasks.findIndex((t: Task) => t.id === overId);

      onReorder(activeId, overIndex, overColumn);
    }
  }, [tasks, onReorder]);

  return {
    sensors,
    handlers: {
      handleDragStart,
      handleDragMove,
      handleDragEnd,
    },
    activeTask,
    activeDragColumn,
    DragOverlayComponent: DragOverlay,
  };
}
