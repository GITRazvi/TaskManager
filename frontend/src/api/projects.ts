// File responsibility: Wraps project API calls for listing, creating, updating, and deleting projects.
import { apiClient, unwrapResponse } from "./client";
import type { Project, ProjectCreateRequest, ProjectUpdateRequest } from "../types";

/**
 * Loads projects visible to the authenticated user.
 */
export function getProjects() {
  return unwrapResponse<Project[]>(apiClient.get("/projects"));
}

/**
 * Creates a project.
 * payload stores project name/description fields from the project form.
 */
export function createProject(payload: ProjectCreateRequest) {
  return unwrapResponse<Project>(apiClient.post("/projects", payload));
}

/**
 * Updates a project.
 * id stores the project UUID; payload stores partial project fields to change.
 */
export function updateProject(id: string, payload: ProjectUpdateRequest) {
  return unwrapResponse<Project>(apiClient.put(`/projects/${id}`, payload));
}

/**
 * Deletes a project.
 * id stores the project UUID selected by the user.
 */
export function deleteProject(id: string) {
  return unwrapResponse<void>(apiClient.delete(`/projects/${id}`));
}
