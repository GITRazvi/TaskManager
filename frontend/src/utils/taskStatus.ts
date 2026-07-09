// File responsibility: Defines task status option order and user-facing task status labels.
import type { TaskStatus } from "../types";

export const taskStatusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  REVIEW: "Review",
  DONE: "Done"
};
