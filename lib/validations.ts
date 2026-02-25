import { z } from 'zod';
import { COLUMN_IDS, PRIORITY_VALUES } from './constants';

export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  column: z.enum(COLUMN_IDS),
  priority: z.enum(PRIORITY_VALUES),
});

export type TaskInput = z.infer<typeof taskSchema>;
