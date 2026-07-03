import { CalendarDays, Check, Circle, Pencil, Trash2 } from "lucide-react";
import type { Task, TaskStatus } from "../../types";

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done"
};

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete
}: {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="task-card">
      <div className="task-card-header">
        <div>
          <p className="task-title">{task.title}</p>
          {task.description && <p className="muted">{task.description}</p>}
        </div>
        <span className={`priority priority-${(task.priority ?? "MEDIUM").toLowerCase()}`}>
          {task.priority ?? "MEDIUM"}
        </span>
      </div>
      <div className="task-meta">
        <span>
          <Circle aria-hidden="true" />
          {statusLabels[task.status]}
        </span>
        {task.dueDate && (
          <span>
            <CalendarDays aria-hidden="true" />
            {task.dueDate}
          </span>
        )}
      </div>
      <div className="task-actions">
        <select
          aria-label={`Status for ${task.title}`}
          value={task.status}
          onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        {onEdit && (
          <button className="icon-button" type="button" onClick={onEdit} aria-label={`Edit ${task.title}`}>
            <Pencil aria-hidden="true" />
          </button>
        )}
        {onDelete && (
          <button className="icon-button danger" type="button" onClick={onDelete} aria-label={`Delete ${task.title}`}>
            <Trash2 aria-hidden="true" />
          </button>
        )}
        {task.status === "DONE" && <Check className="done-icon" aria-hidden="true" />}
      </div>
    </article>
  );
}
