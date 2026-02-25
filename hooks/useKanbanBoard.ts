'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useReorderTask } from './useTasks';
import { useKanbanDrag } from './useKanbanDrag';
import type { Task, NewTask, ColumnType } from '@/types/task';

export interface UseKanbanBoardReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFormOpen: boolean;
  editingTask: Task | undefined;
  defaultColumn: ColumnType;
  deleteDialogOpen: boolean;
  activeTask: Task | null;
  activeDragColumn: string | null;

  tasksByColumn: Record<string, Task[]>;
  isLoading: boolean;
  isSubmitting: boolean;

  sensors: ReturnType<typeof useKanbanDrag>['sensors'];
  dragHandlers: {
    handleDragStart: (event: Parameters<NonNullable<ReturnType<typeof useKanbanDrag>['handlers']['handleDragStart']>>[0]) => void;
    handleDragMove: (event: Parameters<NonNullable<ReturnType<typeof useKanbanDrag>['handlers']['handleDragMove']>>[0]) => void;
    handleDragEnd: (event: Parameters<NonNullable<ReturnType<typeof useKanbanDrag>['handlers']['handleDragEnd']>>[0]) => void;
  };

  handleSubmitForm: (data: NewTask) => void;
  handleDeleteTask: (id: number) => void;
  confirmDelete: () => void;
  handleEditTask: (task: Task) => void;
  handleOpenCreateForm: (columnId: ColumnType) => void;
  closeForm: () => void;
  closeDeleteDialog: () => void;
}

export function useKanbanBoard(): UseKanbanBoardReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [defaultColumn, setDefaultColumn] = useState<ColumnType>('backlog');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const { data: allTasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const reorderTask = useReorderTask();

  const { sensors, handlers, activeTask, activeDragColumn } = useKanbanDrag({
    tasks: allTasks,
    onReorder: (id, newOrder, newColumn) => reorderTask.mutate({ id, newOrder, newColumn }),
  });

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTasks;
    }

    const query = searchQuery.toLowerCase();
    return allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description?.toLowerCase().includes(query) ?? false)
    );
  }, [allTasks, searchQuery]);

  const tasksByColumn = useMemo(() => ({
    backlog: filteredTasks.filter((t) => t.column === 'backlog').sort((a, b) => a.order - b.order),
    in_progress: filteredTasks.filter((t) => t.column === 'in_progress').sort((a, b) => a.order - b.order),
    review: filteredTasks.filter((t) => t.column === 'review').sort((a, b) => a.order - b.order),
    done: filteredTasks.filter((t) => t.column === 'done').sort((a, b) => a.order - b.order),
  }), [filteredTasks]);

  const handleSubmitForm = useCallback((data: NewTask) => {
    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, data },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingTask(undefined);
          },
        }
      );
    } else {
      createTask.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingTask(undefined);
        },
      });
    }
  }, [editingTask, createTask, updateTask]);

  const handleDeleteTask = useCallback((id: number) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (taskToDelete !== null) {
      deleteTask.mutate(taskToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        },
        onError: () => {
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        }
      });
    }
  }, [taskToDelete, deleteTask]);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  const handleOpenCreateForm = useCallback((columnId: ColumnType) => {
    setDefaultColumn(columnId);
    setEditingTask(undefined);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (!deleteTask.isPending) {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  }, [deleteTask.isPending]);

  return {
    searchQuery,
    setSearchQuery,
    isFormOpen,
    editingTask,
    defaultColumn,
    deleteDialogOpen,
    activeTask,
    activeDragColumn,

    tasksByColumn,
    isLoading,
    isSubmitting: createTask.isPending || updateTask.isPending,

    sensors,
    dragHandlers: handlers,

    handleSubmitForm,
    handleDeleteTask,
    confirmDelete,
    handleEditTask,
    handleOpenCreateForm,
    closeForm,
    closeDeleteDialog,
  };
}
