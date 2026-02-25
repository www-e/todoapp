'use client';

import { useEffect, useCallback } from 'react';
import { useForm, type UseFormRegister, type UseFormHandleSubmit, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskInput } from '@/lib/validations';
import { Task } from '@/types/task';
import type { ColumnType } from '@/types/task';

export interface UseTaskFormProps {
  task?: Task;
  defaultColumn?: ColumnType;
  isOpen: boolean;
}

export interface UseTaskFormReturn {
  register: UseFormRegister<TaskInput>;
  handleSubmit: UseFormHandleSubmit<TaskInput>;
  errors: FieldErrors<TaskInput>;

  handleFormSubmit: (onSubmit: (data: TaskInput) => void | Promise<void>) => (data: TaskInput) => Promise<void>;
  handleClose: (onClose: () => void, isSubmitting?: boolean) => () => void;
}

export function useTaskForm({ task, defaultColumn, isOpen }: UseTaskFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || '',
          column: task.column,
          priority: task.priority,
        }
      : {
          column: defaultColumn || 'backlog',
          priority: 'low',
          title: '',
          description: '',
        },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        column: task.column,
        priority: task.priority,
      });
    } else {
      reset({
        column: defaultColumn || 'backlog',
        priority: 'low',
        title: '',
        description: '',
      });
    }
  }, [task, defaultColumn, isOpen, reset]);

  const handleFormSubmit = useCallback((onSubmit: (data: TaskInput) => void | Promise<void>) => {
    return async (data: TaskInput) => {
      await onSubmit(data);
      reset();
    };
  }, [reset]);

  const handleClose = useCallback((onClose: () => void, isSubmitting = false) => {
    return () => {
      if (!isSubmitting) {
        onClose();
      }
    };
  }, []);

  return {
    register,
    handleSubmit,
    errors,
    handleFormSubmit,
    handleClose,
  };
}
