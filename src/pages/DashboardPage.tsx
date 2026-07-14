import React, { useEffect, useMemo, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useProfile } from '@/hooks/useTasks';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const DashboardPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [sort, setSort] = useState<'newest' | 'oldest' | 'due'>('newest');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const params = useMemo(() => ({ search, status, priority, sort, page, pageSize: 20 }), [search, status, priority, sort, page]);
  const { data, isLoading, isError, error } = useTasks(params);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [counts, setCounts] = useState({ total: 0, todo: 0, in_progress: 0, completed: 0 });

  // current user id for profile
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      setCurrentUserId(sessionData.user?.id ?? null);
    })();
  }, []);

  const profileQuery = useProfile(currentUserId);

  useEffect(() => {
    if (data?.data) {
      const list = data.data;
      const total = data.count ?? list.length;
      const todo = list.filter((t) => t.status === 'todo').length;
      const in_progress = list.filter((t) => t.status === 'in_progress').length;
      const completed = list.filter((t) => t.status === 'completed').length;
      setCounts({ total, todo, in_progress, completed });
    } else {
      setCounts({ total: 0, todo: 0, in_progress: 0, completed: 0 });
    }
  }, [data]);

  const handleCreate = async (values: any) => {
    try {
      await createTask.mutateAsync(values);
      toast.success('Task created');
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create task');
    }
  };

  const handleEdit = (task: any) => {
    setEditing(task);
  };

  const handleUpdate = async (values: any) => {
    try {
      await updateTask.mutateAsync({ id: editing.id, updates: values });
      toast.success('Task updated');
      setEditing(null);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask.mutateAsync(id);
      toast.success('Task deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete task');
    }
  };

  const handleToggleComplete = async (task: any) => {
    try {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      await updateTask.mutateAsync({ id: task.id, updates: { status: newStatus } });
      toast.success(task.status === 'completed' ? 'Marked incomplete' : 'Marked complete');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update status');
    }
  };

  return (
    <PageLayout>
      <PageLayout.Header>
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div>Total: <strong>{counts.total}</strong></div>
              <div>Completed: <strong>{counts.completed}</strong></div>
              <div>Pending: <strong>{counts.todo}</strong></div>
              <div>In Progress: <strong>{counts.in_progress}</strong></div>
            </div>
            <Button onClick={() => setShowCreate((s) => !s)}>New Task</Button>
          </div>
        </div>
      </PageLayout.Header>

      <PageLayout.Content>
        <div className="space-y-6">
          <TaskFilters
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            priority={priority}
            setPriority={setPriority}
            sort={sort}
            setSort={(s) => setSort(s as any)}
            onCreate={() => setShowCreate(true)}
          />

          {isLoading && <div className="text-center">Loading tasks...</div>}
          {isError && <div className="text-red-600">Error loading tasks: {String((error as any)?.message)}</div>}

          {!isLoading && data && data.data.length === 0 && (
            <div className="p-8 border rounded-md text-center">
              No tasks yet — create your first task.
            </div>
          )}

          {!isLoading && data && data.data.length > 0 && (
            <TaskList
              tasks={data.data}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          )}

          <div className="flex items-center justify-between mt-4">
            <div>
              Page {page} {data?.count ? `of ${Math.ceil((data.count ?? 0) / 20)}` : ''}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>

          {showCreate && (
            <div className="p-4 border rounded-md bg-gray-50">
              <h3 className="font-semibold mb-2">Create Task</h3>
              <TaskForm onSubmit={handleCreate} submitLabel="Create" loading={createTask.isLoading} />
            </div>
          )}

          {editing && (
            <div className="p-4 border rounded-md bg-gray-50">
              <h3 className="font-semibold mb-2">Edit Task</h3>
              <TaskForm initial={editing} onSubmit={handleUpdate} submitLabel="Save" loading={updateTask.isLoading} />
              <div className="mt-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </PageLayout.Content>
    </PageLayout>
  );
};
