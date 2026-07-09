// File responsibility: Renders the sprint task board, filtered columns, and task detail modal.
import { useMemo, useState } from "react";
import { getApiErrorMessage } from "../../api/client";
import { useSprintBoard } from "../../hooks/useSprints";
import { useUpdateTaskStatus } from "../../hooks/useTasks";
import type { Sprint, Task, TaskStatus, User } from "../../types";
import { taskStatusLabels } from "../../utils/taskStatus";
import { Loading } from "../Common/Loading";
import { TaskCard } from "../Tasks/TaskCard";
import { TaskDetails } from "../Tasks/TaskDetails";
import type { SprintBoardFilterState } from "./SprintBoardFilters";
import { unassignedValue } from "./SprintBoardFilters";

const columns: Array<{ key: "todo" | "inProgress" | "review" | "done"; label: string; status: TaskStatus }> = [
  { key: "todo", label: taskStatusLabels.TODO, status: "TODO" },
  { key: "inProgress", label: taskStatusLabels.IN_PROGRESS, status: "IN_PROGRESS" },
  { key: "review", label: taskStatusLabels.REVIEW, status: "REVIEW" },
  { key: "done", label: taskStatusLabels.DONE, status: "DONE" }
];

/**
 * Checks whether a task user field satisfies a board user filter.
 * taskUserId stores the task assignee/reviewer id; filterUserId stores the selected user id or unassigned marker.
 */
function matchesUserFilter(taskUserId: string | null | undefined, filterUserId: string | undefined) {
  if (!filterUserId) {
    return true;
  }

  if (filterUserId === unassignedValue) {
    return !taskUserId;
  }

  return taskUserId === filterUserId;
}

/**
 * Applies all board filters to one task.
 * task stores the candidate task; filters stores status, priority, project, user, and due-date filter values.
 */
function taskMatchesFilters(task: Task, filters: SprintBoardFilterState) {
  if (filters.status && task.status !== filters.status) {
    return false;
  }
  if (filters.priority && (task.priority ?? "MEDIUM") !== filters.priority) {
    return false;
  }
  if (filters.projectId && task.projectId !== filters.projectId) {
    return false;
  }
  if (!matchesUserFilter(task.assignedToId, filters.assigneeId)) {
    return false;
  }
  if (!matchesUserFilter(task.reviewerId, filters.reviewerId)) {
    return false;
  }
  if (filters.dueFrom && (!task.dueDate || task.dueDate < filters.dueFrom)) {
    return false;
  }
  if (filters.dueUntil && (!task.dueDate || task.dueDate > filters.dueUntil)) {
    return false;
  }

  return true;
}

/**
 * Renders a drag-and-drop sprint board and opens task details.
 * sprintId stores the selected sprint; sprint/users provide participant context; filters stores active board filters.
 */
export function SprintBoard({
  sprintId,
  sprint,
  users,
  filters = {}
}: {
  sprintId?: string;
  sprint?: Sprint;
  users: User[];
  filters?: SprintBoardFilterState;
}) {
  const board = useSprintBoard(sprintId);
  const updateStatus = useUpdateTaskStatus();
  const [draggedTask, setDraggedTask] = useState<{ id: string; status: TaskStatus } | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const usersById = useMemo(() => {
    const nextUsersById = new Map(users.map((user) => [user.id, user]));
    for (const participant of sprint?.participants ?? []) {
      nextUsersById.set(participant.id, participant);
    }
    return nextUsersById;
  }, [sprint, users]);

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask || draggedTask.status === status || updateStatus.isLoading) {
      setDraggedTask(null);
      setDropTarget(null);
      return;
    }

    updateStatus.mutate({ id: draggedTask.id, status });
    setDraggedTask(null);
    setDropTarget(null);
  };

  if (!sprintId) {
    return <p className="empty-state">Create or select a sprint to open the board.</p>;
  }

  if (board.isLoading) {
    return <Loading label="Loading board" />;
  }

  if (board.isError) {
    return <p className="form-error">{getApiErrorMessage(board.error)}</p>;
  }

  const boardTasks = columns.flatMap((column) => (board.data?.[column.key] ?? []) as Task[]);
  const visibleTaskCount = boardTasks.filter((task) => taskMatchesFilters(task, filters)).length;

  return (
    <>
      <p className="board-results-summary">
        Showing {visibleTaskCount} of {boardTasks.length} tasks
      </p>
      <div className="board">
        {columns.map((column) => {
          const tasks = ((board.data?.[column.key] ?? []) as Task[]).filter((task) =>
            taskMatchesFilters(task, filters)
          );
          return (
            <section
              className={`board-column${dropTarget === column.status ? " board-column-drop-target" : ""}`}
              key={column.key}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setDropTarget(column.status);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setDropTarget(null);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(column.status);
              }}
            >
              <div className="board-column-header">
                <h2>{column.label}</h2>
                <span>{tasks.length}</span>
              </div>
              <div className="board-column-list">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignee={task.assignedToId ? usersById.get(task.assignedToId) : undefined}
                    draggable
                    isDragging={draggedTask?.id === task.id}
                    onOpen={() => setSelectedTask(task)}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", task.id);
                      setDraggedTask({ id: task.id, status: task.status });
                    }}
                    onDragEnd={() => {
                      setDraggedTask(null);
                      setDropTarget(null);
                    }}
                    onStatusChange={(status) => updateStatus.mutate({ id: task.id, status })}
                  />
                ))}
                {tasks.length === 0 && <p className="empty-state">No tasks</p>}
              </div>
            </section>
          );
        })}
      </div>
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          assignee={selectedTask.assignedToId ? usersById.get(selectedTask.assignedToId) : undefined}
          reviewer={selectedTask.reviewerId ? usersById.get(selectedTask.reviewerId) : undefined}
          sprint={sprint}
          sprints={sprint ? [sprint] : []}
          users={users}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={setSelectedTask}
        />
      )}
    </>
  );
}
