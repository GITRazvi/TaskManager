// File responsibility: Renders a compact clickable task summary card.
import { CalendarDays, Check, Circle, Pencil, Trash2, UserRound } from "lucide-react";
import type { DragEventHandler, KeyboardEventHandler, MouseEventHandler } from "react";
import type { Task, TaskStatus, User } from "../../types";
import { taskStatusLabels, taskStatusOptions } from "../../utils/taskStatus";

/**
 * Renders one task summary with drag, open, edit, delete, and status-change callbacks.
 * task stores the card data; assignee stores display identity; callbacks pass user actions back to the parent board/list.
 */
export function TaskCard({
  task,
  assignee,
  draggable,
  isDragging,
  onDragStart,
  onDragEnd,
  onStatusChange,
  canChangeStatus = true,
  onOpen,
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
  canChangeStatus?: boolean;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const assigneeName = assignee?.fullName || assignee?.username;
  const interactiveProps = onOpen
    ? ({
        role: "button",
        tabIndex: 0,
        onClick: onOpen,
        onKeyDown: ((event) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }

          event.preventDefault();
          onOpen();
        }) as KeyboardEventHandler<HTMLElement>
      } satisfies {
        role: "button";
        tabIndex: number;
        onClick: () => void;
        onKeyDown: KeyboardEventHandler<HTMLElement>;
      })
    : {};
  const stopOpen: MouseEventHandler = (event) => event.stopPropagation();

  return (
    <article
      className={`task-card${isDragging ? " task-card-dragging" : ""}${onOpen ? " task-card-clickable" : ""}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      {...interactiveProps}
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
          {taskStatusLabels[task.status]}
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
      <div className="task-actions" onClick={stopOpen}>
        <select
          aria-label={`Status for ${task.title}`}
          value={task.status}
          disabled={!canChangeStatus}
          onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
        >
          {taskStatusOptions.map((status) => (
            <option key={status} value={status}>
              {taskStatusLabels[status]}
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
