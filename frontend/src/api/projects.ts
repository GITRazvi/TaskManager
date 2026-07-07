import { apiClient, unwrapResponse } from "./client";
import type { Project, ProjectCreateRequest, ProjectUpdateRequest } from "../types";

export function getProjects() {
  return unwrapResponse<Project[]>(apiClient.get("/projects"));
}

export function createProject(payload: ProjectCreateRequest) {
  return unwrapResponse<Project>(apiClient.post("/projects", payload));
}

export function updateProject(id: string, payload: ProjectUpdateRequest) {
  return unwrapResponse<Project>(apiClient.put(`/projects/${id}`, payload));
}
