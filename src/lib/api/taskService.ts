import { supabase } from '@/integrations/supabase/client';

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type GetTasksParams = {
  search?: string;
  status?: string | null;
  priority?: string | null;
  sort?: 'newest' | 'oldest' | 'due';
  page?: number;
  pageSize?: number;
};

export async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

export async function fetchTasks(params: GetTasksParams = {}) {
  const {
    search,
    status,
    priority,
    sort = 'newest',
    page = 1,
    pageSize = 20,
  } = params;

  let query = supabase
    .from<Task>('tasks')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: sort === 'oldest' });

  // sort by due date if requested
  if (sort === 'due') {
    query = query.order('due_date', { ascending: true, nulls: 'last' });
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (priority) {
    query = query.eq('priority', priority);
  }

  if (search) {
    // search title OR description
    // Use or(...) with ilike
    const pattern = `%${search}%`;
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const res = await query;
  if (res.error) throw res.error;
  return { data: res.data ?? [], count: res.count ?? 0 };
}

export async function createTask(payload: {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: 'low' | 'medium' | 'high';
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from<Task>('tasks')
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from<Task>('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { data, error } = await supabase.from<Task>('tasks').delete().eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function upsertProfile(payload: {
  id: string;
  name?: string | null;
  avatar_url?: string | null;
}) {
  const { data, error } = await supabase.from('profiles').upsert(payload).select().single();
  if (error) throw error;
  return data;
}
