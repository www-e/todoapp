import type { ColumnType, Priority } from '@/lib/constants';

export type Task = {
  id: number;
  title: string;
  description: string | null;
  column: ColumnType;
  priority: Priority;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type NewTask = {
  title: string;
  description?: string;
  column: ColumnType;
  priority: Priority;
  order?: number;
};

export type { ColumnType, Priority } from '@/lib/constants';
