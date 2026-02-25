'use client';

import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { useKanbanBoard } from '@/hooks/useKanbanBoard';
import { KanbanColumn } from './KanbanColumn';
import { TaskForm } from './TaskForm';
import { SearchBar } from './SearchBar';
import { TaskCard } from './TaskCard';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { COLUMN_CONFIG } from '@/lib/constants';

export function KanbanBoard() {
  const {
    searchQuery,
    setSearchQuery,
    isFormOpen,
    editingTask,
    defaultColumn,
    deleteDialogOpen,
    tasksByColumn,
    isLoading,
    isSubmitting,
    sensors,
    dragHandlers,
    activeTask,
    activeDragColumn,
    handleSubmitForm,
    handleDeleteTask,
    confirmDelete,
    handleEditTask,
    handleOpenCreateForm,
    closeForm,
    closeDeleteDialog,
  } = useKanbanBoard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Kanban Board</h1>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={dragHandlers.handleDragStart}
          onDragMove={dragHandlers.handleDragMove}
          onDragEnd={dragHandlers.handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
            {COLUMN_CONFIG.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={tasksByColumn[column.id as keyof typeof tasksByColumn]}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onCreateTask={() => handleOpenCreateForm(column.id)}
                isActiveDrop={activeDragColumn === column.id}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} /> : null}
          </DragOverlay>
        </DndContext>

        <TaskForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={handleSubmitForm}
          task={editingTask}
          defaultColumn={defaultColumn}
          isSubmitting={isSubmitting}
        />

        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          isConfirming={false}
        />
      </div>
    </div>
  );
}
