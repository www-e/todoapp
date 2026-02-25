import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { COLUMN_IDS } from '@/lib/constants';

async function setInitialOrder() {
  console.log('Setting initial order for existing tasks...');

  for (const column of COLUMN_IDS) {
    const columnTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.column, column))
      .orderBy(tasks.createdAt);

    console.log(`\nProcessing column "${column}": ${columnTasks.length} tasks`);

    for (let i = 0; i < columnTasks.length; i++) {
      const task = columnTasks[i]!;
      await db
        .update(tasks)
        .set({ order: i })
        .where(eq(tasks.id, task.id));

      console.log(`  - Task "${task.title}" -> order: ${i}`);
    }
  }

  console.log('\n Initial order set for all tasks!');
}

setInitialOrder();
