import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  fetchProfile,
  upsertProfile,
  Task,
  GetTasksParams,
} from '@/lib/api/taskService';

export function useTasks(params: GetTasksParams) {
  return useQuery(['tasks', params], () => fetchTasks(params), {
    keepPreviousData: true,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation(createTask, {
    onSuccess: () => qc.invalidateQueries(['tasks']),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation(({ id, updates }: { id: string; updates: Partial<Task> }) => updateTask(id, updates), {
    onSuccess: () => qc.invalidateQueries(['tasks']),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation((id: string) => deleteTask(id), {
    onSuccess: () => qc.invalidateQueries(['tasks']),
  });
}

export function useProfile(userId?: string | null) {
  return useQuery(['profile', userId], () => {
    if (!userId) throw new Error('No user id');
    return fetchProfile(userId);
  }, {
    enabled: !!userId,
  });
}

export function useUpsertProfile() {
  const qc = useQueryClient();
  return useMutation((payload: Parameters<typeof upsertProfile>[0]) => upsertProfile(payload), {
    onSuccess: (_data, variables) => qc.invalidateQueries(['profile', variables.id]),
  });
}
