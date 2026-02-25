'use server';

import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Task, NewTask } from '@/types/task';

export async function getTasks(): Promise<Task[]> {
  try {
    const result = await db
      .select()
      .from(tasks)
      .orderBy(tasks.column, tasks.order);

    return result as Task[];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function createTask(data: NewTask): Promise<Task | null> {
  try {
    const [newTask] = await db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description || null,
        column: data.column,
        priority: data.priority || 'low',
        order: data.order ?? 0,
      })
      .returning();

    return newTask as Task;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

export async function updateTask(
  id: number,
  data: Partial<NewTask>
): Promise<Task | null> {
  try {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    return updatedTask as Task;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

export async function deleteTask(id: number): Promise<boolean> {
  try {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

export async function reorderTask(
  id: number,
  newOrder: number,
  newColumn?: string
): Promise<Task | null> {
  try {
    const updateData: { order: number; column?: string; updatedAt: Date } = {
      order: newOrder,
      updatedAt: new Date(),
    };

    if (newColumn) {
      updateData.column = newColumn;
    }

    const [reorderedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    return reorderedTask as Task;
  } catch (error) {
    console.error('Error reordering task:', error);
    return null;
  }
}
