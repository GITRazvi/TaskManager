import { apiClient, unwrapResponse } from "./client";
import type {
  Task,
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
  );
}

export function createTask(payload: TaskCreateRequest) {
  return unwrapResponse<Task>(apiClient.post("/tasks", payload));
}

export function updateTask(id: string, payload: TaskUpdateRequest) {
  return unwrapResponse<Task>(apiClient.put(`/tasks/${id}`, payload));
}

export function updateTaskStatus(id: string, status: TaskStatus) {
  return unwrapResponse<Task>(apiClient.patch(`/tasks/${id}/status`, { status }));
}

export async function deleteTask(id: string) {
  await apiClient.delete(`/tasks/${id}`);
}
