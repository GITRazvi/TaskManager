import {
  CalendarDays,
  Circle,
  Clock,
  Download,
  FolderKanban,
  MessageSquare,
  Paperclip,
  Pencil,
  Save,
  Send,
  Star,
  Timer,
  UserRound,
  X
} from "lucide-react";
import { type ClipboardEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import { useAddTaskComment, useDownloadTaskCommentAttachment, useUpdateTask } from "../../hooks/useTasks";
import type { Sprint, Task, TaskComment, TaskPriority, TaskStatus, User } from "../../types";

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done"
};

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent"
};

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const priorityOptions: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

type DetailsFormState = {
  status: TaskStatus;
  priority: TaskPriority;
  sprintId: string;
  assignedToId: string;
  reviewerId: string;
  dueDate: string;
  storyPoints: string;
  estimatedHours: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatFileSize(size?: number | null) {
  if (!size) {
    return "";
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formStateFromTask(task: Task): DetailsFormState {
  return {
    status: task.status,
    priority: task.priority ?? "MEDIUM",
    sprintId: task.sprintId ?? "",
    assignedToId: task.assignedToId ?? "",
    reviewerId: task.reviewerId ?? "",
    dueDate: task.dueDate ?? "",
    storyPoints: task.storyPoints == null ? "" : String(task.storyPoints),
    estimatedHours: task.estimatedHours == null ? "" : String(task.estimatedHours)
  };
}

function mergeUsers(users: User[], sprints: Sprint[], sprint?: Sprint) {
  const usersById = new Map(users.map((user) => [user.id, user]));

  for (const currentSprint of sprint ? [sprint, ...sprints] : sprints) {
    for (const participant of currentSprint.participants ?? []) {
      usersById.set(participant.id, participant);
    }
  }

  return Array.from(usersById.values());
}

export function TaskDetails({
  task,
  assignee,
  reviewer,
  sprint,
  sprints = [],
  users = [],
  onClose,
  onEdit,
  onTaskUpdated
}: {
  task: Task;
  assignee?: User;
  reviewer?: User;
  sprint?: Sprint;
  sprints?: Sprint[];
  users?: User[];
  onClose: () => void;
  onEdit?: () => void;
  onTaskUpdated?: (task: Task) => void;
}) {
  const updateTask = useUpdateTask();
  const addComment = useAddTaskComment();
  const downloadAttachment = useDownloadTaskCommentAttachment();
  const [form, setForm] = useState<DetailsFormState>(() => formStateFromTask(task));
  const [newComment, setNewComment] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const allUsers = useMemo(() => mergeUsers(users, sprints, sprint), [sprint, sprints, users]);
  const usersById = useMemo(() => new Map(allUsers.map((user) => [user.id, user])), [allUsers]);
  const selectedSprint = useMemo(
    () => sprints.find((currentSprint) => currentSprint.id === form.sprintId) ?? (sprint?.id === form.sprintId ? sprint : undefined),
    [form.sprintId, sprint, sprints]
  );
  const reviewerOptions = selectedSprint?.participants?.length ? selectedSprint.participants : allUsers;
  const assigneeName = assignee?.fullName || assignee?.username || usersById.get(form.assignedToId)?.fullName || usersById.get(form.assignedToId)?.username || (form.assignedToId ? "Assigned user" : "Unassigned");
  const reviewerName = reviewer?.fullName || reviewer?.username || usersById.get(form.reviewerId)?.fullName || usersById.get(form.reviewerId)?.username || (form.reviewerId ? "Assigned reviewer" : "No reviewer");
  const projectId = selectedSprint?.projectId || task.projectId || sprint?.projectId;
  const projectName = selectedSprint?.projectName || task.projectName || sprint?.projectName;
  const parsedStoryPoints = Number(form.storyPoints);
  const storyPointsInvalid =
    form.storyPoints !== "" && (!Number.isInteger(parsedStoryPoints) || parsedStoryPoints < 0);
  const parsedEstimatedHours = Number(form.estimatedHours);
  const estimatedHoursInvalid =
    form.estimatedHours !== "" && (!Number.isFinite(parsedEstimatedHours) || parsedEstimatedHours < 0);
  const canSave = !updateTask.isLoading && !storyPointsInvalid && !estimatedHoursInvalid;
  const comments = Array.isArray(task.comments) ? task.comments : [];
  const canAddComment = (newComment.trim().length > 0 || selectedAttachment !== null) && !addComment.isLoading;

  useEffect(() => {
    setForm(formStateFromTask(task));
    setNewComment("");
    setSelectedAttachment(null);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  }, [
    task.id,
    task.status,
    task.priority,
    task.sprintId,
    task.assignedToId,
    task.reviewerId,
    task.dueDate,
    task.storyPoints,
    task.estimatedHours
  ]);

  const reviewerOptionExists = !form.reviewerId || reviewerOptions.some((user) => user.id === form.reviewerId);

  const updateField = <K extends keyof DetailsFormState>(key: K, value: DetailsFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveTaskDetails = () => {
    if (!canSave) {
      return;
    }

    updateTask.mutate(
      {
        id: task.id,
        payload: {
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          sprintId: form.sprintId || undefined,
          assignedToId: form.assignedToId || undefined,
          reviewerId: form.reviewerId || undefined,
          storyPoints: form.storyPoints ? parsedStoryPoints : undefined,
          estimatedHours: form.estimatedHours ? parsedEstimatedHours : undefined
        }
      },
      {
        onSuccess: (updatedTask) => {
          onTaskUpdated?.(updatedTask);
          setForm(formStateFromTask(updatedTask));
        }
      }
    );
  };

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canAddComment) {
      return;
    }

    addComment.mutate(
      { id: task.id, payload: { content: newComment, attachment: selectedAttachment ?? undefined } },
      {
        onSuccess: (comment) => {
          onTaskUpdated?.({
            ...task,
            comments: [...comments, comment],
            updatedAt: comment.updatedAt ?? task.updatedAt
          });
          setNewComment("");
          setSelectedAttachment(null);
          if (attachmentInputRef.current) {
            attachmentInputRef.current.value = "";
          }
        }
      }
    );
  };

  const pasteAttachment = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(event.clipboardData.files).find((item) => item.size > 0);
    if (file) {
      setSelectedAttachment(file);
    }
  };

  const saveAttachment = (comment: TaskComment) => {
    if (!comment.attachmentFileName) {
      return;
    }

    downloadAttachment.mutate(
      { taskId: task.id, commentId: comment.id },
      {
        onSuccess: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = comment.attachmentFileName || "attachment";
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
        }
      }
    );
  };

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        aria-labelledby="task-details-title"
        aria-modal="true"
        className="task-details-dialog"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="task-details-header">
          <div>
            <p className="eyebrow">Task details</p>
            <h2 id="task-details-title">{task.title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close task details">
            <X aria-hidden="true" />
          </button>
        </div>

        <p className="task-details-description">{task.description || "No description provided."}</p>

        <dl className="task-details-grid">
          <div>
            <dt>
              <Circle aria-hidden="true" />
              Status
            </dt>
            <dd>
              <select
                aria-label={`Status for ${task.title}`}
                value={form.status}
                onChange={(event) => updateField("status", event.target.value as TaskStatus)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>
              <select
                aria-label={`Priority for ${task.title}`}
                value={form.priority}
                onChange={(event) => updateField("priority", event.target.value as TaskPriority)}
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabels[priority]}
                  </option>
                ))}
              </select>
            </dd>
          </div>
          <div>
            <dt>
              <UserRound aria-hidden="true" />
              Assignee
            </dt>
            <dd>
              <select
                aria-label={`Assignee for ${task.title}`}
                value={form.assignedToId}
                onChange={(event) => updateField("assignedToId", event.target.value)}
              >
                <option value="">Unassigned</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.username}
                  </option>
                ))}
              </select>
              <span className="task-field-hint">{assigneeName}</span>
            </dd>
          </div>
          <div>
            <dt>
              <UserRound aria-hidden="true" />
              Reviewer
            </dt>
            <dd>
              <select
                aria-label={`Reviewer for ${task.title}`}
                value={form.reviewerId}
                onChange={(event) => updateField("reviewerId", event.target.value)}
              >
                <option value="">No reviewer</option>
                {!reviewerOptionExists && <option value={form.reviewerId}>{reviewerName}</option>}
                {reviewerOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.username}
                  </option>
                ))}
              </select>
              <span className="task-field-hint">{reviewerName}</span>
            </dd>
          </div>
          <div>
            <dt>
              <Star aria-hidden="true" />
              Story points
            </dt>
            <dd>
              <input
                aria-label={`Story points for ${task.title}`}
                min="0"
                step="1"
                type="number"
                value={form.storyPoints}
                onChange={(event) => updateField("storyPoints", event.target.value)}
              />
              {form.storyPoints === "" && <span className="task-field-hint">Not estimated</span>}
              {storyPointsInvalid && <small>Use a whole number, 0 or higher.</small>}
            </dd>
          </div>
          <div>
            <dt>
              <Timer aria-hidden="true" />
              Estimated hours
            </dt>
            <dd>
              <input
                aria-label={`Estimated hours for ${task.title}`}
                min="0"
                step="0.25"
                type="number"
                value={form.estimatedHours}
                onChange={(event) => updateField("estimatedHours", event.target.value)}
              />
              {form.estimatedHours === "" && <span className="task-field-hint">No hours logged</span>}
              {estimatedHoursInvalid && <small>Use 0 or higher.</small>}
            </dd>
          </div>
          <div>
            <dt>Sprint</dt>
            <dd>
              <select
                aria-label={`Sprint for ${task.title}`}
                value={form.sprintId}
                onChange={(event) => updateField("sprintId", event.target.value)}
              >
                <option value="">Backlog</option>
                {sprints.map((currentSprint) => (
                  <option key={currentSprint.id} value={currentSprint.id}>
                    {currentSprint.name}
                  </option>
                ))}
                {sprint && !sprints.some((currentSprint) => currentSprint.id === sprint.id) && (
                  <option value={sprint.id}>{sprint.name}</option>
                )}
              </select>
            </dd>
          </div>
          <div>
            <dt>
              <FolderKanban aria-hidden="true" />
              Parent
            </dt>
            <dd>
              {projectId && projectName ? (
                <Link className="text-link" to={`/projects?project=${projectId}`}>
                  {projectName}
                </Link>
              ) : (
                "No project"
              )}
            </dd>
          </div>
          <div>
            <dt>
              <CalendarDays aria-hidden="true" />
              Due date
            </dt>
            <dd>
              <input
                aria-label={`Due date for ${task.title}`}
                type="date"
                value={form.dueDate}
                onChange={(event) => updateField("dueDate", event.target.value)}
              />
            </dd>
          </div>
          <div>
            <dt>
              <Clock aria-hidden="true" />
              Created
            </dt>
            <dd>{formatDateTime(task.createdAt)}</dd>
          </div>
          <div>
            <dt>
              <Clock aria-hidden="true" />
              Updated
            </dt>
            <dd>{formatDateTime(task.updatedAt)}</dd>
          </div>
        </dl>

        <section className="task-details-comments">
          <h3>
            <MessageSquare aria-hidden="true" />
            Comments
          </h3>
          <form className="task-comment-form" onSubmit={submitComment}>
            <textarea
              aria-label={`Add comment for ${task.title}`}
              rows={3}
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              onPaste={pasteAttachment}
            />
            <div className="task-comment-attachment-row">
              <label className="attachment-picker">
                <Paperclip aria-hidden="true" />
                <span>{selectedAttachment ? selectedAttachment.name : "Attach file"}</span>
                <input
                  ref={attachmentInputRef}
                  aria-label={`Attach file for ${task.title}`}
                  type="file"
                  onChange={(event) => setSelectedAttachment(event.target.files?.[0] ?? null)}
                />
              </label>
              {selectedAttachment && (
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => {
                    setSelectedAttachment(null);
                    if (attachmentInputRef.current) {
                      attachmentInputRef.current.value = "";
                    }
                  }}
                  aria-label="Remove attachment"
                >
                  <X aria-hidden="true" />
                </button>
              )}
            </div>
            <button className="secondary-button" type="submit" disabled={!canAddComment}>
              <Send aria-hidden="true" />
              {addComment.isLoading ? "Adding" : "Add comment"}
            </button>
          </form>
          <div className="task-comments-list">
            {comments.length === 0 ? (
              <p className="task-comments-empty">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <article className="task-comment" key={comment.id}>
                  <div className="task-comment-header">
                    <strong>{comment.authorName || "Unknown user"}</strong>
                    <time dateTime={comment.createdAt}>{formatDateTime(comment.createdAt)}</time>
                  </div>
                  {comment.content && <p>{comment.content}</p>}
                  {comment.attachmentFileName && (
                    <button
                      className="comment-attachment"
                      type="button"
                      onClick={() => saveAttachment(comment)}
                      disabled={downloadAttachment.isLoading}
                    >
                      <Paperclip aria-hidden="true" />
                      <span>
                        {comment.attachmentFileName}
                        {comment.attachmentSize ? ` (${formatFileSize(comment.attachmentSize)})` : ""}
                      </span>
                      <Download aria-hidden="true" />
                    </button>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        {updateTask.isError && <p className="form-error">{getApiErrorMessage(updateTask.error)}</p>}
        {addComment.isError && <p className="form-error">{getApiErrorMessage(addComment.error)}</p>}

        <div className="task-details-actions">
          {onEdit && (
            <button className="secondary-button" type="button" onClick={onEdit}>
              <Pencil aria-hidden="true" />
              Edit title
            </button>
          )}
          <button className="primary-button" type="button" disabled={!canSave} onClick={saveTaskDetails}>
            <Save aria-hidden="true" />
            {updateTask.isLoading ? "Saving" : "Save changes"}
          </button>
        </div>
      </section>
    </div>
  );
}
