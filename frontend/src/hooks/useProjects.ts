import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as projectsApi from "../api/projects";
import type { Project, ProjectCreateRequest, ProjectUpdateRequest } from "../types";

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

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getProjects
  });
}

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
