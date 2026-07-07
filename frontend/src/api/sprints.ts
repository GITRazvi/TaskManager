import { apiClient, unwrapResponse } from "./client";
import { normalizeSprintBoardResponse } from "./normalizers";
import type {
  Sprint,
  SprintBoardResponse,
  SprintCreateRequest,
  SprintStatsResponse,
  SprintStatus,
  SprintUpdateRequest
} from "../types";

export function getSprints(status?: SprintStatus) {
  return unwrapResponse<Sprint[]>(
    apiClient.get("/sprints", {
      params: status ? { status } : undefined
    })
  );
}

export function createSprint(payload: SprintCreateRequest) {
  return unwrapResponse<Sprint>(apiClient.post("/sprints", payload));
}

export function updateSprint(id: string, payload: SprintUpdateRequest) {
  return unwrapResponse<Sprint>(apiClient.put(`/sprints/${id}`, payload));
}

export function deleteSprint(id: string) {
  return unwrapResponse<void>(apiClient.delete(`/sprints/${id}`));
}

export function getSprintBoard(id: string) {
  return unwrapResponse<SprintBoardResponse>(apiClient.get(`/sprints/${id}/tasks`)).then(normalizeSprintBoardResponse);
}

export function getSprintStats(id: string) {
  return unwrapResponse<SprintStatsResponse>(apiClient.get(`/sprints/${id}/stats`));
}
