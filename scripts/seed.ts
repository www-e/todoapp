import { db } from '@/db';
import { tasks } from '@/db/schema';

async function seed() {
  console.log('Seeding database...');

  await db.delete(tasks);
  console.log('Cleared existing tasks...');

  const sampleTasks = [
    { title: 'Design homepage', description: 'Include hero section', column: 'backlog', priority: 'high' as const, order: 0 },
    { title: 'Setup database', description: 'Configure Neon connection', column: 'done', priority: 'high' as const, order: 0 },
    { title: 'Create API routes', description: 'Implement CRUD endpoints', column: 'in_progress', priority: 'medium' as const, order: 0 },
    { title: 'Write unit tests', description: 'Test core functionality', column: 'backlog', priority: 'low' as const, order: 1 },
    { title: 'Design user profile', description: 'Create profile page layout', column: 'backlog', priority: 'medium' as const, order: 2 },
    { title: 'Implement authentication', description: 'Add login/register', column: 'in_progress', priority: 'high' as const, order: 1 },
    { title: 'Code review PR #123', description: 'Review and provide feedback', column: 'review', priority: 'medium' as const, order: 0 },
    { title: 'Update documentation', description: 'Add API docs', column: 'done', priority: 'low' as const, order: 1 },
    { title: 'Fix navigation bug', description: 'Mobile menu not closing', column: 'backlog', priority: 'high' as const, order: 3 },
    { title: 'Optimize images', description: 'Compress and lazy load', column: 'backlog', priority: 'low' as const, order: 4 },
    { title: 'Setup CI/CD', description: 'Configure GitHub Actions', column: 'in_progress', priority: 'medium' as const, order: 2 },
    { title: 'Review analytics', description: 'Check user metrics', column: 'review', priority: 'low' as const, order: 1 },
    { title: 'Design email templates', description: 'Create welcome email', column: 'backlog', priority: 'medium' as const, order: 5 },
    { title: 'Deploy to staging', description: 'Test staging environment', column: 'done', priority: 'high' as const, order: 2 },
    { title: 'User feedback session', description: 'Gather user feedback', column: 'review', priority: 'medium' as const, order: 2 },
  ];

  try {
    await db.delete(tasks);
    console.log('Cleared existing tasks...');

    await db.insert(tasks).values(sampleTasks);
    console.log(` Seed completed successfully! Added ${sampleTasks.length} tasks.`);
  } catch (error) {
    console.error(' Seed failed:', error);
  }
}

seed();
