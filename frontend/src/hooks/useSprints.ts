import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as sprintsApi from "../api/sprints";
import type { Sprint, SprintCreateRequest, SprintStatus, SprintUpdateRequest } from "../types";

function upsertSprint(sprints: Sprint[] | undefined, sprint: Sprint) {
  if (!sprints) {
    return [sprint];
  }

  const exists = sprints.some((currentSprint) => currentSprint.id === sprint.id);
  if (!exists) {
    return [sprint, ...sprints];
  }

  return sprints.map((currentSprint) => (currentSprint.id === sprint.id ? sprint : currentSprint));
}

export function useSprints(status?: SprintStatus) {
  return useQuery({
    queryKey: ["sprints", status],
    queryFn: () => sprintsApi.getSprints(status)
  });
}

export function useCreateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SprintCreateRequest) => sprintsApi.createSprint(payload),
    onSuccess: (sprint) => {
      queryClient.setQueryData<Sprint[]>(["sprints", undefined], (sprints) => upsertSprint(sprints, sprint));
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
    }
  });
}

export function useUpdateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SprintUpdateRequest }) =>
      sprintsApi.updateSprint(id, payload),
    onSuccess: (sprint) => {
      queryClient.setQueriesData<Sprint[]>({ queryKey: ["sprints"] }, (sprints) =>
        sprints?.map((currentSprint) => (currentSprint.id === sprint.id ? sprint : currentSprint))
      );
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
    }
  });
}

export function useDeleteSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sprintsApi.deleteSprint(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });
}

export function useSprintBoard(sprintId?: string) {
  return useQuery({
    queryKey: ["sprint-board", sprintId],
    queryFn: () => sprintsApi.getSprintBoard(sprintId as string),
    enabled: Boolean(sprintId)
  });
}

export function useSprintStats(sprintId?: string) {
  return useQuery({
    queryKey: ["sprint-stats", sprintId],
    queryFn: () => sprintsApi.getSprintStats(sprintId as string),
    enabled: Boolean(sprintId)
  });
}
