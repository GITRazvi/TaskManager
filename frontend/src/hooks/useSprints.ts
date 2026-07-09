// File responsibility: Provides React Query hooks and cache invalidation for sprint workflows and sprint metrics.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as sprintsApi from "../api/sprints";
import type { Sprint, SprintCreateRequest, SprintStatus, SprintUpdateRequest } from "../types";

/**
 * Inserts or replaces one sprint in a cached sprint list.
 * sprints stores the current cache value; sprint stores the latest server version.
 */
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

/**
 * Fetches sprints, optionally scoped by lifecycle status.
 * status stores the requested filter value when provided.
 */
export function useSprints(status?: SprintStatus) {
  return useQuery({
    queryKey: ["sprints", status],
    queryFn: () => sprintsApi.getSprints(status)
  });
}

/**
 * Creates a sprint and refreshes sprint list caches.
 */
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

/**
 * Updates sprint fields and refreshes lists, boards, and sprint metrics.
 */
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

/**
 * Deletes a sprint and refreshes sprint, board, stats, and task caches.
 */
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

/**
 * Fetches board columns for a selected sprint.
 * sprintId stores the selected sprint UUID and disables the query when missing.
 */
export function useSprintBoard(sprintId?: string) {
  return useQuery({
    queryKey: ["sprint-board", sprintId],
    queryFn: () => sprintsApi.getSprintBoard(sprintId as string),
    enabled: Boolean(sprintId)
  });
}

/**
 * Fetches metrics for a selected sprint.
 * sprintId stores the selected sprint UUID and disables the query when missing.
 */
export function useSprintStats(sprintId?: string) {
  return useQuery({
    queryKey: ["sprint-stats", sprintId],
    queryFn: () => sprintsApi.getSprintStats(sprintId as string),
    enabled: Boolean(sprintId)
  });
}
