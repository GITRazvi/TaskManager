// File responsibility: Renders the task detail modal, metadata editing controls, comments, attachments, and mention helpers.
import {
  CalendarDays,
  Circle,
  Clock,
  Download,
  FolderKanban,
  History,
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
import { type ClipboardEvent, type FormEvent, type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import { downloadTaskCommentAttachment } from "../../api/tasks";
import { useAddTaskComment, useDownloadTaskCommentAttachment, useUpdateTask, useUpdateTaskStatus } from "../../hooks/useTasks";
import { useAuthStore } from "../../store/authStore";
import type { Sprint, Task, TaskComment, TaskPriority, TaskStatus, User } from "../../types";
import { canAssignTaskTo, canEditTask, canSetTaskMetadata } from "../../utils/permissions";
import { taskStatusLabels, taskStatusOptions } from "../../utils/taskStatus";

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent"
};

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

type ActiveMention = {
  start: number;
  end: number;
  query: string;
};

/**
 * Formats an API timestamp for display in comment and history rows.
 * value stores an ISO date/time string from the backend.
 */
function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

/**
 * Formats attachment byte counts into compact labels.
 * size stores the attachment size in bytes, when the backend provides it.
 */
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

/**
 * Checks whether a comment attachment can be previewed inline.
 * comment stores attachment metadata from the task response.
 */
function isImageAttachment(comment: TaskComment) {
  return comment.attachmentContentType?.toLowerCase().startsWith("image/");
}

/**
 * Converts the selected task into editable string form state.
 * task stores the source task response; numeric fields become strings so empty inputs stay editable.
 */
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

/**
 * Builds one user list for assignment, reviewer, and mention suggestions.
 * users stores global visible users; sprints and sprint store participant lists that may include additional users.
 */
function mergeUsers(users: User[], sprints: Sprint[], sprint?: Sprint) {
  const usersById = new Map(users.map((user) => [user.id, user]));

  for (const currentSprint of sprint ? [sprint, ...sprints] : sprints) {
    for (const participant of currentSprint.participants ?? []) {
      usersById.set(participant.id, participant);
    }
  }

  return Array.from(usersById.values());
}

/**
 * Chooses the text inserted after @ when a suggestion is selected.
 * user stores username, name, and email fields used as fallback labels.
 */
function mentionLabel(user: User) {
  return user.username || user.fullName?.split(/\s+/)[0] || user.email.split("@")[0];
}

/**
 * Builds searchable mention keys for a user.
 * user stores username, first name, and email local-part candidates, allowing @Razvi or @username.
 */
function mentionNames(user: User) {
  return [user.username, user.fullName?.split(/\s+/)[0], user.email.split("@")[0]]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.toLowerCase());
}

/**
 * Finds the mention token currently being typed before the caret.
 * value stores the full textarea content; caret stores the current cursor index.
 */
function findActiveMention(value: string, caret: number): ActiveMention | null {
  const beforeCaret = value.slice(0, caret);
  const match = /(^|\s)@([\w.-]*)$/.exec(beforeCaret);
  if (!match) {
    return null;
  }

  return {
    start: beforeCaret.length - match[2].length - 1,
    end: caret,
    query: match[2]
  };
}

/**
 * Splits comment text into plain text and highlighted mention nodes.
 * content stores the saved comment body; mentionNamesByKey stores lowercase mention names that map to known users.
 */
function renderCommentContent(content: string, mentionNamesByKey: Set<string>) {
  const nodes: ReactNode[] = [];
  const mentionPattern = /@([\w.-]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionPattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index));
    }

    const mentionText = match[0];
    const mentionKey = match[1].toLowerCase();
    nodes.push(
      mentionNamesByKey.has(mentionKey) ? (
        <span className="comment-mention" key={`${mentionText}-${match.index}`}>
          {mentionText}
        </span>
      ) : (
        mentionText
      )
    );
    lastIndex = match.index + mentionText.length;
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }

  return nodes;
}

/**
 * Downloads and previews an image attachment for a comment.
 * taskId stores the parent task id; comment stores attachment metadata and comment id.
 */
function TaskCommentImagePreview({ taskId, comment }: { taskId: string; comment: TaskComment }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    downloadTaskCommentAttachment(taskId, comment.id)
      .then((blob) => {
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setImageUrl(null);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [comment.id, taskId]);

  if (!imageUrl) {
    return null;
  }

  return (
    <button className="comment-image-preview" type="button" onClick={() => window.open(imageUrl, "_blank", "noopener,noreferrer")}>
      <img src={imageUrl} alt={comment.attachmentFileName || "Comment attachment"} />
    </button>
  );
}

/**
 * Displays task metadata, edit controls, status history, comments, attachments, and mention suggestions.
 * task stores the selected task; users/sprints provide option lists; callbacks notify parent views about edits.
 */
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
  const updateStatus = useUpdateTaskStatus();
  const addComment = useAddTaskComment();
  const downloadAttachment = useDownloadTaskCommentAttachment();
  const currentUser = useAuthStore((state) => state.user);
  const [form, setForm] = useState<DetailsFormState>(() => formStateFromTask(task));
  const [newComment, setNewComment] = useState("");
  const [activeMention, setActiveMention] = useState<ActiveMention | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const allUsers = useMemo(() => mergeUsers(users, sprints, sprint), [sprint, sprints, users]);
  const usersById = useMemo(() => new Map(allUsers.map((user) => [user.id, user])), [allUsers]);
  const mentionNamesByKey = useMemo(() => new Set(allUsers.flatMap(mentionNames)), [allUsers]);
  const mentionSuggestions = useMemo(() => {
    if (!activeMention) {
      return [];
    }
    const query = activeMention.query.toLowerCase();
    return allUsers
      .filter((user) => mentionNames(user).some((name) => name.includes(query)))
      .slice(0, 6);
  }, [activeMention, allUsers]);
  const selectedSprint = useMemo(
    () => sprints.find((currentSprint) => currentSprint.id === form.sprintId) ?? (sprint?.id === form.sprintId ? sprint : undefined),
    [form.sprintId, sprint, sprints]
  );
  const reviewerOptions = selectedSprint?.participants?.length ? selectedSprint.participants : allUsers;
  const canEditDetails = canEditTask(currentUser, task);
  const canSetMetadata = canSetTaskMetadata(currentUser);
  const assigneeOptions = allUsers.filter((user) => canAssignTaskTo(currentUser, user.id) || user.id === form.assignedToId);
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
  const statusChanged = form.status !== task.status;
  const metadataChanged =
    form.priority !== (task.priority ?? "MEDIUM") ||
    form.reviewerId !== (task.reviewerId ?? "") ||
    form.storyPoints !== (task.storyPoints == null ? "" : String(task.storyPoints)) ||
    form.estimatedHours !== (task.estimatedHours == null ? "" : String(task.estimatedHours));
  const canSave =
    !updateTask.isLoading &&
    !updateStatus.isLoading &&
    !storyPointsInvalid &&
    !estimatedHoursInvalid &&
    (canEditDetails || statusChanged || (canSetMetadata && metadataChanged));
  const comments = Array.isArray(task.comments) ? task.comments : [];
  const statusHistory = Array.isArray(task.statusHistory) ? task.statusHistory : [];
  const canAddComment = (newComment.trim().length > 0 || selectedAttachment !== null) && !addComment.isLoading;

  useEffect(() => {
    setForm(formStateFromTask(task));
    setNewComment("");
    setActiveMention(null);
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

    const metadataPayload = canSetMetadata
      ? {
          priority: form.priority,
          reviewerId: form.reviewerId || undefined,
          storyPoints: form.storyPoints ? parsedStoryPoints : undefined,
          estimatedHours: form.estimatedHours ? parsedEstimatedHours : undefined
        }
      : {};

    if (!canEditDetails) {
      if (!statusChanged && (!canSetMetadata || !metadataChanged)) {
        return;
      }

      updateTask.mutate(
        {
          id: task.id,
          payload: {
            ...(statusChanged ? { status: form.status } : {}),
            ...metadataPayload
          }
        },
        {
          onSuccess: (updatedTask) => {
            onTaskUpdated?.(updatedTask);
            setForm(formStateFromTask(updatedTask));
          }
        }
      );
      return;
    }

    updateTask.mutate(
      {
        id: task.id,
        payload: {
          status: form.status,
          dueDate: form.dueDate || undefined,
          assignedToId: canAssignTaskTo(currentUser, form.assignedToId) ? form.assignedToId || undefined : undefined,
          ...(canSetMetadata
            ? {
                sprintId: form.sprintId || undefined,
                ...metadataPayload
              }
            : {})
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
          setActiveMention(null);
          setSelectedAttachment(null);
          if (attachmentInputRef.current) {
            attachmentInputRef.current.value = "";
          }
        }
      }
    );
  };

  const updateNewComment = (value: string, caret: number | null) => {
    setNewComment(value);
    setActiveMention(caret == null ? null : findActiveMention(value, caret));
  };

  const insertMention = (user: User) => {
    if (!activeMention) {
      return;
    }
    const nextMention = `@${mentionLabel(user)} `;
    const nextComment = `${newComment.slice(0, activeMention.start)}${nextMention}${newComment.slice(activeMention.end)}`;
    const nextCaret = activeMention.start + nextMention.length;
    setNewComment(nextComment);
    setActiveMention(null);
    window.requestAnimationFrame(() => {
      commentInputRef.current?.focus();
      commentInputRef.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleCommentKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionSuggestions.length === 0) {
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      insertMention(mentionSuggestions[0]);
    }
    if (event.key === "Escape") {
      setActiveMention(null);
    }
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
                {taskStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {taskStatusLabels[status]}
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
                disabled={!canSetMetadata}
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
                disabled={!canEditDetails}
                onChange={(event) => updateField("assignedToId", event.target.value)}
              >
                <option value="">Unassigned</option>
                {assigneeOptions.map((user) => (
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
                disabled={!canSetMetadata}
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
                disabled={!canSetMetadata}
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
                disabled={!canSetMetadata}
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
                disabled={!canSetMetadata}
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
                disabled={!canEditDetails}
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

        <section className="task-details-history">
          <h3>
            <History aria-hidden="true" />
            Status history
          </h3>
          <div className="task-status-history-list">
            {statusHistory.length === 0 ? (
              <p className="task-status-history-empty">No status changes recorded.</p>
            ) : (
              statusHistory.map((entry, index) => (
                <article className="task-status-history-entry" key={entry.id || `${entry.toStatus}-${entry.createdAt}-${index}`}>
                  <div>
                    <strong>
                      {entry.fromStatus ? taskStatusLabels[entry.fromStatus] : "Created"} to {taskStatusLabels[entry.toStatus]}
                    </strong>
                    <span>{entry.changedByName || "Unknown user"}</span>
                  </div>
                  <time dateTime={entry.createdAt}>{formatDateTime(entry.createdAt)}</time>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="task-details-comments">
          <h3>
            <MessageSquare aria-hidden="true" />
            Comments
          </h3>
          <form className="task-comment-form" onSubmit={submitComment}>
            <textarea
              ref={commentInputRef}
              aria-label={`Add comment for ${task.title}`}
              rows={3}
              value={newComment}
              onChange={(event) => updateNewComment(event.target.value, event.target.selectionStart)}
              onClick={(event) => updateNewComment(event.currentTarget.value, event.currentTarget.selectionStart)}
              onKeyUp={(event) => updateNewComment(event.currentTarget.value, event.currentTarget.selectionStart)}
              onKeyDown={handleCommentKeyDown}
              onPaste={pasteAttachment}
            />
            {mentionSuggestions.length > 0 && (
              <div className="mention-menu">
                {mentionSuggestions.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertMention(user)}
                  >
                    <strong>@{mentionLabel(user)}</strong>
                    <span>{user.fullName || user.email}</span>
                  </button>
                ))}
              </div>
            )}
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
                  {comment.content && <p>{renderCommentContent(comment.content, mentionNamesByKey)}</p>}
                  {isImageAttachment(comment) && <TaskCommentImagePreview taskId={task.id} comment={comment} />}
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
        {updateStatus.isError && <p className="form-error">{getApiErrorMessage(updateStatus.error)}</p>}
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
            {updateTask.isLoading || updateStatus.isLoading ? "Saving" : "Save changes"}
          </button>
        </div>
      </section>
    </div>
  );
}
