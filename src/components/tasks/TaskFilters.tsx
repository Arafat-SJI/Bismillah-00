import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Props = {
  search: string;
  setSearch: (v: string) => void;
  status: string | null;
  setStatus: (s: string | null) => void;
  priority: string | null;
  setPriority: (p: string | null) => void;
  sort: string;
  setSort: (s: string) => void;
  onCreate: () => void;
};

export const TaskFilters: React.FC<Props> = ({ search, setSearch, status, setStatus, priority, setPriority, sort, setSort, onCreate }) => {
  return (
    <div className="space-y-3 md:flex md:items-end md:space-x-4 md:space-y-0">
      <div className="flex-1">
        <Label htmlFor="search">Search</Label>
        <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or description" />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <select id="status" value={status ?? ''} onChange={(e) => setStatus(e.target.value || null)} className="rounded-md border px-3 py-2">
          <option value="">All</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <select id="priority" value={priority ?? ''} onChange={(e) => setPriority(e.target.value || null)} className="rounded-md border px-3 py-2">
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <Label htmlFor="sort">Sort</Label>
        <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border px-3 py-2">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="due">Due Date</option>
        </select>
      </div>

      <div className="md:ml-auto">
        <Button onClick={onCreate}>Create Task</Button>
      </div>
    </div>
  );
};
