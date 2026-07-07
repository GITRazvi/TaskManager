import { useMemo, useState } from "react";
import { getApiErrorMessage } from "../../api/client";
import { useSprintBoard } from "../../hooks/useSprints";
import { useUpdateTaskStatus } from "../../hooks/useTasks";
import type { Sprint, Task, TaskStatus, User } from "../../types";
import { Loading } from "../Common/Loading";
import { TaskCard } from "../Tasks/TaskCard";
import { TaskDetails } from "../Tasks/TaskDetails";

const columns: Array<{ key: "todo" | "inProgress" | "done"; label: string; status: TaskStatus }> = [
  { key: "todo", label: "To do", status: "TODO" },
  { key: "inProgress", label: "In progress", status: "IN_PROGRESS" },
  { key: "done", label: "Done", status: "DONE" }
];

export function SprintBoard({ sprintId, sprint, users }: { sprintId?: string; sprint?: Sprint; users: User[] }) {
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

  return (
    <>
      <div className="board">
        {columns.map((column) => {
          const tasks = (board.data?.[column.key] ?? []) as Task[];
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
