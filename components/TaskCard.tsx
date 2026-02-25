'use client';

import { Task } from '@/types/task';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getPriorityLabel, getPriorityColorClasses } from '@/lib/taskHelpers';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    animateLayoutChanges: () => true,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms ease',
    opacity: isDragging ? 0.4 : 1,
    scale: isDragging ? 1.02 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const colors = getPriorityColorClasses(task.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 relative group cursor-grab active:cursor-grabbing touch-none select-none ${
        isDragging ? 'shadow-2xl rotate-2' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 text-gray-400 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 pointer-events-none">{task.title}</h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2 pointer-events-none">
              {task.description}
            </p>
          )}

          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} pointer-events-none`}
          >
            {getPriorityLabel(task.priority)}
          </span>
        </div>
      </div>
    </div>
  );
}
