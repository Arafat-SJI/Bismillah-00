import React from 'react';
import { Task } from '@/lib/api/taskService';
import { TaskCard } from './TaskCard';

type Props = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
};

export const TaskList: React.FC<Props> = ({ tasks, onEdit, onDelete, onToggleComplete }) => {
  return (
    <div className="grid gap-4">
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onToggleComplete={onToggleComplete} />
      ))}
    </div>
  );
};
