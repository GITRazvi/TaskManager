// File responsibility: Wraps project API calls for listing, creating, updating, and deleting projects.
import { apiClient, unwrapResponse } from "./client";
import type {
  Project,
  ProjectCreateRequest,
  ProjectMember,
  ProjectMemberCreateRequest,
  ProjectMemberRoleUpdateRequest,
  ProjectUpdateRequest
} from "../types";

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

/**
 * Adds a user to a project with the selected project role.
 */
export function addProjectMember(projectId: string, payload: ProjectMemberCreateRequest) {
  return unwrapResponse<ProjectMember>(apiClient.post(`/projects/${projectId}/members`, payload));
}

/**
 * Updates a project member's project-scoped role.
 */
export function updateProjectMemberRole(projectId: string, memberId: string, payload: ProjectMemberRoleUpdateRequest) {
  return unwrapResponse<ProjectMember>(apiClient.put(`/projects/${projectId}/members/${memberId}/role`, payload));
}

/**
 * Removes a user from a project.
 */
export function removeProjectMember(projectId: string, memberId: string) {
  return unwrapResponse<void>(apiClient.delete(`/projects/${projectId}/members/${memberId}`));
}
