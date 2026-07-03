import { getApiErrorMessage } from "../../api/client";
import { useSprintBoard } from "../../hooks/useSprints";
import { useUpdateTaskStatus } from "../../hooks/useTasks";
import type { Task, TaskStatus } from "../../types";
import { Loading } from "../Common/Loading";
import { TaskCard } from "../Tasks/TaskCard";

const columns: Array<{ key: "todo" | "inProgress" | "done"; label: string; status: TaskStatus }> = [
  { key: "todo", label: "To do", status: "TODO" },
  { key: "inProgress", label: "In progress", status: "IN_PROGRESS" },
  { key: "done", label: "Done", status: "DONE" }
];

export function SprintBoard({ sprintId }: { sprintId?: string }) {
  const board = useSprintBoard(sprintId);
  const updateStatus = useUpdateTaskStatus();

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
    <div className="board">
      {columns.map((column) => {
        const tasks = (board.data?.[column.key] ?? []) as Task[];
        return (
          <section className="board-column" key={column.key}>
            <div className="board-column-header">
              <h2>{column.label}</h2>
              <span>{tasks.length}</span>
            </div>
            <div className="board-column-list">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={(status) => updateStatus.mutate({ id: task.id, status })}
                />
              ))}
              {tasks.length === 0 && <p className="empty-state">No tasks</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
