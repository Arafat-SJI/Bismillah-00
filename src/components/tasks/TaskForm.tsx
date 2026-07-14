import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  due_date: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  initial?: Partial<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
};

export const TaskForm: React.FC<Props> = ({ initial = {}, onSubmit, submitLabel = 'Save', loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initial.title ?? '',
      description: initial.description ?? '',
      due_date: initial.due_date ?? '',
      priority: initial.priority ?? 'medium',
      status: initial.status ?? 'todo',
    },
  });

  const submit = async (data: FormValues) => {
    try {
      await onSubmit(data);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save task');
      throw err;
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea id="description" {...register('description')} className="w-full rounded-md border px-3 py-2" />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="due_date">Due Date</Label>
        <Input id="due_date" type="date" {...register('due_date')} />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <select id="priority" {...register('priority')} className="w-full rounded-md border px-3 py-2">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <select id="status" {...register('status')} className="w-full rounded-md border px-3 py-2">
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : submitLabel}</Button>
      </div>
    </form>
  );
};
