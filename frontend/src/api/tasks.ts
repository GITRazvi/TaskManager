// File responsibility: Wraps task API calls for filtering, metrics, CRUD, comments, attachments, and status changes.
import { apiClient, unwrapResponse } from "./client";
import { normalizeTask, normalizeTaskListResponse } from "./normalizers";
import type {
  Task,
  TaskComment,
  TaskCommentCreateRequest,
  TaskCreateRequest,
  TaskFilters,
  TaskListResponse,
  TaskStatsResponse,
  TaskStatus,
  TaskUpdateRequest
} from "../types";

/**
 * Removes empty filter values before sending them as query params.
 * filters stores the current task-list filter state from the UI.
 */
function compactParams(filters: TaskFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== "")
  );
}

/**
 * Loads a paginated task list from the backend.
 * filters stores optional status, priority, assignee, date, page, and size values.
 */
export function getTasks(filters: TaskFilters = {}) {
  return unwrapResponse<TaskListResponse>(
    apiClient.get("/tasks", {
      params: compactParams({ page: 0, size: 20, ...filters })
    })
  ).then(normalizeTaskListResponse);
}

/**
 * Loads project-wide task metrics for every project visible to the signed-in user.
 */
export function getTaskStats() {
  return unwrapResponse<TaskStatsResponse[]>(apiClient.get("/tasks/stats"));
}

/**
 * Creates a task from the form payload.
 * payload stores title, description, sprint, assignee, reviewer, priority, dates, points, hours, and comments.
 */
export function createTask(payload: TaskCreateRequest) {
  return unwrapResponse<Task>(apiClient.post("/tasks", payload)).then(normalizeTask);
}

/**
 * Applies a partial task update.
 * id stores the target task id; payload stores only fields the user changed.
 */
export function updateTask(id: string, payload: TaskUpdateRequest) {
  return unwrapResponse<Task>(apiClient.put(`/tasks/${id}`, payload)).then(normalizeTask);
}

/**
 * Updates only the workflow status of a task.
 * id stores the target task id; status stores the new workflow column value.
 */
export function updateTaskStatus(id: string, status: TaskStatus) {
  return unwrapResponse<Task>(apiClient.patch(`/tasks/${id}/status`, { status })).then(normalizeTask);
}

/**
 * Adds a text comment and optional attachment to a task.
 * id stores the target task id; payload stores comment text and an optional File for multipart upload.
 */
export function addTaskComment(id: string, payload: TaskCommentCreateRequest) {
  if (payload.attachment) {
    const formData = new FormData();
    if (payload.content) {
      formData.append("content", payload.content);
    }
    formData.append("attachment", payload.attachment);

    return unwrapResponse<TaskComment>(
      apiClient.post(`/tasks/${id}/comments`, formData)
    );
  }

  return unwrapResponse<TaskComment>(apiClient.post(`/tasks/${id}/comments`, payload));
}

/**
 * Downloads an attachment blob for a task comment.
 * taskId stores the parent task id; commentId stores the comment whose attachment should be fetched.
 */
export async function downloadTaskCommentAttachment(taskId: string, commentId: string) {
  const response = await apiClient.get<Blob>(`/tasks/${taskId}/comments/${commentId}/attachment`, {
    responseType: "blob"
  });
  return response.data;
}

/**
 * Deletes the selected task.
 * id stores the backend UUID of the task to remove.
 */
export async function deleteTask(id: string) {
  await apiClient.delete(`/tasks/${id}`);
}
