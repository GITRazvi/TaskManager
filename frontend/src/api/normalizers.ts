// File responsibility: Normalizes backend payloads so optional task arrays are always safe to render.
import type { SprintBoardResponse, Task, TaskListResponse } from "../types";

type TaskPayload = Omit<Task, "comments" | "statusHistory"> & {
  comments?: unknown;
  statusHistory?: unknown;
};

/**
 * Ensures every task has array fields expected by render code.
 * task stores a backend task payload where comments or statusHistory may be absent.
 */
function normalizeTask(task: TaskPayload): Task {
  return {
    ...task,
    comments: Array.isArray(task.comments) ? task.comments : [],
    statusHistory: Array.isArray(task.statusHistory) ? task.statusHistory : []
  };
}

/**
 * Normalizes every task in a paginated task response.
 * response stores the original backend page envelope.
 */
export function normalizeTaskListResponse(response: TaskListResponse): TaskListResponse {
  return {
    ...response,
    tasks: response.tasks.map(normalizeTask)
  };
}

/**
 * Normalizes every task in each sprint-board status column.
 * response stores backend board columns grouped by workflow status.
 */
export function normalizeSprintBoardResponse(response: SprintBoardResponse): SprintBoardResponse {
  return {
    ...response,
    todo: (response.todo ?? []).map(normalizeTask),
    inProgress: (response.inProgress ?? []).map(normalizeTask),
    review: (response.review ?? []).map(normalizeTask),
    done: (response.done ?? []).map(normalizeTask)
  };
}

export { normalizeTask };
