// File responsibility: Renders the filterable task list, task actions, and task detail modal.
import { useMemo, useState } from "react";
import { getApiErrorMessage } from "../../api/client";
import { useTasks, useUpdateTaskStatus } from "../../hooks/useTasks";
import type { Sprint, Task, TaskFilters as Filters, User } from "../../types";
import { Loading } from "../Common/Loading";
import { TaskCard } from "./TaskCard";
import { TaskDetails } from "./TaskDetails";
import { TaskFilters } from "./TaskFilters";

/**
 * Renders a paginated task list with filters, task actions, and detail/edit modals.
 * sprints and users store selector context; assignedToId stores an optional forced assignee filter.
 */
export function TaskList({ sprints, users, assignedToId }: { sprints: Sprint[]; users: User[]; assignedToId?: string }) {
  const [filters, setFilters] = useState<Filters>({ page: 0, size: 20 });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const tasks = useTasks({ ...filters, assignedToId }, { enabled: assignedToId === undefined || Boolean(assignedToId) });
  const updateStatus = useUpdateTaskStatus();
  const usersById = useMemo(() => {
    const nextUsersById = new Map(users.map((user) => [user.id, user]));
    for (const sprint of sprints) {
      for (const participant of sprint.participants ?? []) {
        nextUsersById.set(participant.id, participant);
      }
    }
    return nextUsersById;
  }, [sprints, users]);
  const sprintsById = useMemo(() => new Map(sprints.map((sprint) => [sprint.id, sprint])), [sprints]);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>Tasks</h2>
          <p>{tasks.data ? `${tasks.data.totalElements} total` : "Current workspace"}</p>
        </div>
      </div>
      <TaskFilters filters={filters} onChange={setFilters} />
      {(!assignedToId || tasks.isLoading) && <Loading label="Loading tasks" />}
      {tasks.isError && <p className="form-error">{getApiErrorMessage(tasks.error)}</p>}
      {tasks.data?.tasks.length === 0 && <p className="empty-state">No tasks match the current view.</p>}
      <div className="task-list">
        {tasks.data?.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            assignee={task.assignedToId ? usersById.get(task.assignedToId) : undefined}
            onOpen={() => setSelectedTask(task)}
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
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          assignee={selectedTask.assignedToId ? usersById.get(selectedTask.assignedToId) : undefined}
          reviewer={selectedTask.reviewerId ? usersById.get(selectedTask.reviewerId) : undefined}
          sprint={selectedTask.sprintId ? sprintsById.get(selectedTask.sprintId) : undefined}
          sprints={sprints}
          users={users}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={setSelectedTask}
        />
      )}
    </section>
  );
}
