'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { Task } from '@/types/task';
import { Button } from './ui/Button';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onCreateTask: () => void;
  isActiveDrop?: boolean;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onEditTask,
  onDeleteTask,
  onCreateTask,
  isActiveDrop = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      className={`flex flex-col w-full bg-[#ebf0f0] rounded-lg p-4 transition-all duration-200 ${
        isOver || isActiveDrop
          ? 'bg-blue-100 ring-4 ring-blue-400 shadow-xl scale-[1.02]'
          : 'shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-semibold text-lg transition-colors ${isOver || isActiveDrop ? 'text-blue-700' : 'text-gray-800'}`}>
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium transition-colors ${isOver || isActiveDrop ? 'text-blue-600' : 'text-gray-600'}`}>
            {tasks.length}
          </span>
          <Button
            onClick={onCreateTask}
            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-50 space-y-3 transition-colors rounded-lg p-2 -m-2 ${
          isOver || isActiveDrop ? 'bg-blue-200/50' : ''
        }`}
      >
        {tasks.length === 0 ? (
          <div className={`h-full flex items-center justify-center text-center py-8 text-sm transition-colors ${isOver || isActiveDrop ? 'text-blue-500' : 'text-gray-500'}`}>
            {isOver || isActiveDrop ? 'Drop task here' : 'No tasks yet'}
          </div>
        ) : (
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
