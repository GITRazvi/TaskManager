import { CalendarDays, Check, Circle, Pencil, Trash2, UserRound } from "lucide-react";
import type { DragEventHandler } from "react";
import type { Task, TaskStatus, User } from "../../types";

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done"
};

export function TaskCard({
  task,
  assignee,
  draggable,
  isDragging,
  onDragStart,
  onDragEnd,
  onStatusChange,
  onEdit,
  onDelete
}: {
  task: Task;
  assignee?: User;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  onStatusChange: (status: TaskStatus) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const assigneeName = assignee?.fullName || assignee?.username;

  return (
    <article
      className={`task-card${isDragging ? " task-card-dragging" : ""}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
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
        {assigneeName && (
          <span>
            <UserRound aria-hidden="true" />
            {assigneeName}
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
