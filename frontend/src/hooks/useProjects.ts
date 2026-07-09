// File responsibility: Provides React Query hooks and cache updates for project CRUD workflows.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as projectsApi from "../api/projects";
import type { Project, ProjectCreateRequest, ProjectUpdateRequest } from "../types";

/**
 * Inserts or replaces one project in a cached project list.
 * projects stores the current cache value; project stores the latest server version.
 */
function upsertProject(projects: Project[] | undefined, project: Project) {
  if (!projects) {
    return [project];
  }

  const exists = projects.some((currentProject) => currentProject.id === project.id);
  if (!exists) {
    return [project, ...projects];
  }

  return projects.map((currentProject) => (currentProject.id === project.id ? project : currentProject));
}

/**
 * Fetches projects visible to the signed-in user.
 */
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getProjects
  });
}

/**
 * Creates a project and updates the project cache immediately after success.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectCreateRequest) => projectsApi.createProject(payload),
    onSuccess: (project) => {
      queryClient.setQueryData<Project[]>(["projects"], (projects) => upsertProject(projects, project));
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });
}

/**
 * Updates a project and refreshes project plus sprint caches that may show project names.
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectUpdateRequest }) =>
      projectsApi.updateProject(id, payload),
    onSuccess: (project) => {
      queryClient.setQueryData<Project[]>(["projects"], (projects) => upsertProject(projects, project));
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
    }
  });
}

/**
 * Deletes a project and refreshes project, sprint, and task caches affected by removal.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Project[]>(["projects"], (projects) =>
        projects?.filter((project) => project.id !== id)
      );
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });
}
