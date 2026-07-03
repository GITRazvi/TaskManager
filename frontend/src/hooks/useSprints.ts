import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as sprintsApi from "../api/sprints";
import type { SprintCreateRequest, SprintStatus, SprintUpdateRequest } from "../types";

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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
    }
  });
}

export function useUpdateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SprintUpdateRequest }) =>
      sprintsApi.updateSprint(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
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
