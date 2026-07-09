// File responsibility: Wraps sprint API calls for sprint CRUD, board data, and sprint metrics.
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

/**
 * Loads sprints, optionally filtered by lifecycle status.
 * status stores the selected sprint status filter when one is active.
 */
export function getSprints(status?: SprintStatus) {
  return unwrapResponse<Sprint[]>(
    apiClient.get("/sprints", {
      params: status ? { status } : undefined
    })
  );
}

/**
 * Creates a sprint.
 * payload stores sprint name, dates, project, status, and participants from the form.
 */
export function createSprint(payload: SprintCreateRequest) {
  return unwrapResponse<Sprint>(apiClient.post("/sprints", payload));
}

/**
 * Updates a sprint.
 * id stores the sprint UUID; payload stores partial sprint fields to change.
 */
export function updateSprint(id: string, payload: SprintUpdateRequest) {
  return unwrapResponse<Sprint>(apiClient.put(`/sprints/${id}`, payload));
}

/**
 * Deletes a sprint.
 * id stores the sprint UUID selected by the user.
 */
export function deleteSprint(id: string) {
  return unwrapResponse<void>(apiClient.delete(`/sprints/${id}`));
}

/**
 * Loads board columns for a sprint.
 * id stores the sprint UUID whose tasks should be grouped by status.
 */
export function getSprintBoard(id: string) {
  return unwrapResponse<SprintBoardResponse>(apiClient.get(`/sprints/${id}/tasks`)).then(normalizeSprintBoardResponse);
}

/**
 * Loads sprint-specific metrics.
 * id stores the sprint UUID used by the metrics endpoint.
 */
export function getSprintStats(id: string) {
  return unwrapResponse<SprintStatsResponse>(apiClient.get(`/sprints/${id}/stats`));
}
