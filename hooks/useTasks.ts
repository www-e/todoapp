'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTasks, createTask, updateTask, deleteTask, reorderTask } from '@/app/actions/tasks';
import type { NewTask, Task, ColumnType } from '@/types/task';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => getTasks(),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewTask) => createTask(data),
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['tasks'] });

      const tempTask = {
        ...newTask,
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        order: newTask.order ?? 0
      } as Task;

      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old;
        return [...old, tempTask];
      });

      return { previousData, tempTask };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, previousTasks]) => {
          queryClient.setQueryData(queryKey, previousTasks);
        });
      }
    },
    onSuccess: (returnedTask, variables, context) => {
      if (context?.tempTask && returnedTask) {
        queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) => {
          if (!old) return old;
          return old.map(task =>
            task.id === context.tempTask.id ? returnedTask : task
          );
        });
      }
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NewTask> }) =>
      updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['tasks'] });

      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old;

        return old.map((task: Task) =>
          task.id === id ? { ...task, ...data, updatedAt: new Date() } : task
        );
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, previousTasks]) => {
          queryClient.setQueryData(queryKey, previousTasks);
        });
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['tasks'] });

      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old;
        return old.filter((task: Task) => task.id !== id);
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, previousTasks]) => {
          queryClient.setQueryData(queryKey, previousTasks);
        });
      }
    },
  });
}

export function useReorderTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newOrder, newColumn }: {
      id: number;
      newOrder: number;
      newColumn?: string;
    }) => reorderTask(id, newOrder, newColumn),
    onMutate: async ({ id, newOrder, newColumn }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['tasks'] });

      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old;

        const taskIndex = old.findIndex(t => t.id === id);
        if (taskIndex === -1) return old;

        const task = old[taskIndex];
        const oldColumn = task.column;
        const targetColumn = (newColumn || task.column) as ColumnType;

        const otherTasks = old.filter(t => t.id !== id);

        const targetColumnTasks = otherTasks
          .filter(t => t.column === targetColumn)
          .sort((a, b) => a.order - b.order);

        const updatedTask = {
          ...task,
          order: newOrder,
          column: targetColumn,
          updatedAt: new Date()
        };

        targetColumnTasks.splice(newOrder, 0, updatedTask);

        targetColumnTasks.forEach((t, idx) => {
          t.order = idx;
        });

        if (oldColumn !== targetColumn) {
          const sourceColumnTasks = otherTasks
            .filter(t => t.column === oldColumn)
            .sort((a, b) => a.order - b.order);

          sourceColumnTasks.forEach((t, idx) => {
            t.order = idx;
          });

          const otherColumnTasks = otherTasks.filter(
            t => t.column !== oldColumn && t.column !== targetColumn
          );

          return [...otherColumnTasks, ...sourceColumnTasks, ...targetColumnTasks];
        }

        const otherColumnTasks = otherTasks.filter(t => t.column !== targetColumn);

        return [...otherColumnTasks, ...targetColumnTasks];
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, previousTasks]) => {
          queryClient.setQueryData(queryKey, previousTasks);
        });
      }
    },
  });
}
