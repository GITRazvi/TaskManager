import type { SprintBoardResponse, Task, TaskListResponse } from "../types";

type TaskPayload = Omit<Task, "comments"> & {
  comments?: unknown;
};

function normalizeTask(task: TaskPayload): Task {
  return {
    ...task,
    comments: Array.isArray(task.comments) ? task.comments : []
  };
}

export function normalizeTaskListResponse(response: TaskListResponse): TaskListResponse {
  return {
    ...response,
    tasks: response.tasks.map(normalizeTask)
  };
}

export function normalizeSprintBoardResponse(response: SprintBoardResponse): SprintBoardResponse {
  return {
    ...response,
    todo: response.todo.map(normalizeTask),
    inProgress: response.inProgress.map(normalizeTask),
    done: response.done.map(normalizeTask)
  };
}

export { normalizeTask };
