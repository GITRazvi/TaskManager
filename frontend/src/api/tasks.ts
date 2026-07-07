import { apiClient, unwrapResponse } from "./client";
import { normalizeTask, normalizeTaskListResponse } from "./normalizers";
import type {
  Task,
  TaskComment,
  TaskCommentCreateRequest,
  TaskCreateRequest,
  TaskFilters,
  TaskListResponse,
  TaskStatus,
  TaskUpdateRequest
} from "../types";

function compactParams(filters: TaskFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== "")
  );
}

export function getTasks(filters: TaskFilters = {}) {
  return unwrapResponse<TaskListResponse>(
    apiClient.get("/tasks", {
      params: compactParams({ page: 0, size: 20, ...filters })
    })
  ).then(normalizeTaskListResponse);
}

export function createTask(payload: TaskCreateRequest) {
  return unwrapResponse<Task>(apiClient.post("/tasks", payload)).then(normalizeTask);
}

export function updateTask(id: string, payload: TaskUpdateRequest) {
  return unwrapResponse<Task>(apiClient.put(`/tasks/${id}`, payload)).then(normalizeTask);
}

export function updateTaskStatus(id: string, status: TaskStatus) {
  return unwrapResponse<Task>(apiClient.patch(`/tasks/${id}/status`, { status })).then(normalizeTask);
}

export function addTaskComment(id: string, payload: TaskCommentCreateRequest) {
  if (payload.attachment) {
    const formData = new FormData();
    if (payload.content) {
      formData.append("content", payload.content);
    }
    formData.append("attachment", payload.attachment);

    return unwrapResponse<TaskComment>(
      apiClient.post(`/tasks/${id}/comments`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
    );
  }

  return unwrapResponse<TaskComment>(apiClient.post(`/tasks/${id}/comments`, payload));
}

export async function downloadTaskCommentAttachment(taskId: string, commentId: string) {
  const response = await apiClient.get<Blob>(`/tasks/${taskId}/comments/${commentId}/attachment`, {
    responseType: "blob"
  });
  return response.data;
}

export async function deleteTask(id: string) {
  await apiClient.delete(`/tasks/${id}`);
}
