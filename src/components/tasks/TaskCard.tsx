import React from 'react';
import { Task } from '@/lib/api/taskService';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

type Props = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
};

export const TaskCard: React.FC<Props> = ({ task, onEdit, onDelete, onToggleComplete }) => {
  return (
    <div className="border rounded-md p-4 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{task.title}</h3>
          <p className="text-sm text-muted-foreground">{task.description}</p>
          <div className="mt-2 text-sm">
            <span className="mr-2">Priority: <strong>{task.priority}</strong></span>
            <span>Status: <strong>{task.status}</strong></span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {task.due_date && <div className="text-sm text-gray-500">Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</div>}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(task)}>Edit</Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>Delete</Button>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Button size="sm" onClick={() => onToggleComplete(task)}>
          {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
        </Button>
      </div>
    </div>
  );
};
