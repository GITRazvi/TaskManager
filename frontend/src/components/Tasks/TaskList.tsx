import { useMemo, useState } from "react";
import { getApiErrorMessage } from "../../api/client";
import { useDeleteTask, useTasks, useUpdateTaskStatus } from "../../hooks/useTasks";
import type { Task, TaskFilters as Filters, User } from "../../types";
import { Loading } from "../Common/Loading";
import { TaskCard } from "./TaskCard";
import { TaskFilters } from "./TaskFilters";

export function TaskList({ users, onEdit }: { users: User[]; onEdit: (task: Task) => void }) {
  const [filters, setFilters] = useState<Filters>({ page: 0, size: 20 });
  const tasks = useTasks(filters);
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>Tasks</h2>
          <p>{tasks.data ? `${tasks.data.totalElements} total` : "Current workspace"}</p>
        </div>
      </div>
      <TaskFilters filters={filters} onChange={setFilters} />
      {tasks.isLoading && <Loading label="Loading tasks" />}
      {tasks.isError && <p className="form-error">{getApiErrorMessage(tasks.error)}</p>}
      {tasks.data?.tasks.length === 0 && <p className="empty-state">No tasks match the current view.</p>}
      <div className="task-list">
        {tasks.data?.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            assignee={task.assignedToId ? usersById.get(task.assignedToId) : undefined}
            onEdit={() => onEdit(task)}
            onDelete={() => deleteTask.mutate(task.id)}
            onStatusChange={(status) => updateStatus.mutate({ id: task.id, status })}
          />
        ))}
      </div>
      {tasks.data && tasks.data.totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={(filters.page ?? 0) <= 0}
            onClick={() => setFilters((current) => ({ ...current, page: Math.max((current.page ?? 0) - 1, 0) }))}
          >
            Previous
          </button>
          <span>
            Page {(filters.page ?? 0) + 1} of {tasks.data.totalPages}
          </span>
          <button
            type="button"
            disabled={(filters.page ?? 0) + 1 >= tasks.data.totalPages}
            onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 0) + 1 }))}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
