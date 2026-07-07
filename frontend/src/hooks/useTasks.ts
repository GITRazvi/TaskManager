import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as tasksApi from "../api/tasks";
import type { TaskCommentCreateRequest, TaskCreateRequest, TaskFilters, TaskStatus, TaskUpdateRequest } from "../types";

export function useTasks(filters: TaskFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => tasksApi.getTasks(filters),
    enabled: options?.enabled ?? true,
    keepPreviousData: true
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskCreateRequest) => tasksApi.createTask(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskUpdateRequest }) =>
      tasksApi.updateTask(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
    }
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateTaskStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
    }
  });
}

export function useAddTaskComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskCommentCreateRequest }) =>
      tasksApi.addTaskComment(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
    }
  });
}

export function useDownloadTaskCommentAttachment() {
  return useMutation({
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
      tasksApi.downloadTaskCommentAttachment(taskId, commentId)
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
    }
  });
}
