// File responsibility: Provides React Query hooks and cache invalidation for task workflows, comments, and metrics.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as tasksApi from "../api/tasks";
import type { TaskCommentCreateRequest, TaskCreateRequest, TaskFilters, TaskStatus, TaskUpdateRequest } from "../types";

/**
 * Fetches task pages and keeps prior results while filters change.
 * filters stores query params; options.enabled lets callers delay the request.
 */
export function useTasks(filters: TaskFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => tasksApi.getTasks(filters),
    enabled: options?.enabled ?? true,
    keepPreviousData: true
  });
}

/**
 * Fetches project-wide dashboard metrics for visible projects.
 */
export function useTaskStats() {
  return useQuery({
    queryKey: ["task-stats"],
    queryFn: tasksApi.getTaskStats
  });
}

/**
 * Creates tasks and refreshes task, dashboard, sprint, board, and sprint metric caches.
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskCreateRequest) => tasksApi.createTask(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
    }
  });
}

/**
 * Updates task details.
 * The mutation input stores the task id and a partial payload with the changed fields.
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskUpdateRequest }) =>
      tasksApi.updateTask(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
    }
  });
}

/**
 * Moves a task to a new workflow status.
 * The mutation input stores the task id and target status value.
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateTaskStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
    }
  });
}

/**
 * Adds task comments and refreshes views that display comments or task aggregates.
 * The mutation input stores the task id and comment payload.
 */
export function useAddTaskComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskCommentCreateRequest }) =>
      tasksApi.addTaskComment(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
    }
  });
}

/**
 * Downloads a comment attachment on demand.
 * The mutation input stores both task id and comment id for the backend route.
 */
export function useDownloadTaskCommentAttachment() {
  return useMutation({
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
      tasksApi.downloadTaskCommentAttachment(taskId, commentId)
  });
}

/**
 * Deletes a task and refreshes all task and sprint caches affected by removal.
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["sprints"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-board"] });
      void queryClient.invalidateQueries({ queryKey: ["sprint-stats"] });
    }
  });
}
